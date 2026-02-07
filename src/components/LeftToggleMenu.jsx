import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Абстрактный UI: полоска кнопок слева и выезжающая панель.
 * @param {Array<{ id: string, label: string, icon: string }>} items — пункты меню
 * @param {(activeId: string) => React.ReactNode} renderContent — контент панели для activeId
 * @param {string} [className] — класс обёртки триггеров
 */
export function LeftToggleMenu({ items, renderContent, className = "" }) {
  const [activeId, setActiveId] = useState(null);

  const handleTrigger = (id) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  const closePanel = () => {
    setActiveId(null);
  };

  // Закрытие по Escape
  useEffect(() => {
    if (activeId === null) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeId]);

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null;

  return (
    <>
      <div className={`left-toggle-menu ${className}`.trim()}>
        <nav className="left-toggle-menu__triggers" aria-label="Боковое меню">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`left-toggle-menu__btn ${activeId === item.id ? "left-toggle-menu__btn--active" : ""}`}
              onClick={() => handleTrigger(item.id)}
              title={item.label}
              aria-pressed={activeId === item.id}
              aria-expanded={activeId === item.id}
            >
              <span className="left-toggle-menu__icon" aria-hidden>
                {item.icon}
              </span>
              <span className="left-toggle-menu__label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence>
        {activeId !== null && (
          <motion.div
            key="left-panel-backdrop"
            className="left-toggle-menu__panel-backdrop"
            onClick={closePanel}
            role="presentation"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
        {activeId !== null && (
          <motion.div
            key="left-panel"
            className="left-toggle-menu__panel"
            role="dialog"
            aria-modal="true"
            aria-label={activeItem?.label ?? "Панель"}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
          >
            <div className="left-toggle-menu__panel-inner">
              <header className="left-toggle-menu__panel-header">
                <h2 className="left-toggle-menu__panel-title">
                  {activeItem && (
                    <span
                      className="left-toggle-menu__panel-title-icon"
                      aria-hidden
                    >
                      {activeItem.icon}
                    </span>
                  )}
                  {activeItem?.label ?? ""}
                </h2>
                <button
                  type="button"
                  className="left-toggle-menu__panel-close"
                  onClick={closePanel}
                  aria-label="Закрыть"
                >
                  ×
                </button>
              </header>
              <div className="left-toggle-menu__panel-body">
                {renderContent(activeId)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

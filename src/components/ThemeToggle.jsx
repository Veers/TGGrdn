import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import "./ThemeToggle.css";

export function ThemeToggle() {
  const { theme, themes, themeIds, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleSelect = (themeId) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="theme-toggle" ref={containerRef}>
      <button
        type="button"
        className="theme-toggle__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Текущая тема: ${theme.name}. Выбрать тему`}
      >
        <span className="theme-toggle__icon">{theme.emoji}</span>
        <span className="theme-toggle__label">{theme.name}</span>
        <span className="theme-toggle__arrow">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="theme-toggle__dropdown" role="menu">
          {themeIds.map((id) => {
            const t = themes[id];
            const isActive = id === theme.id;
            return (
              <button
                key={id}
                type="button"
                className={`theme-toggle__option ${isActive ? "theme-toggle__option--active" : ""}`}
                onClick={() => handleSelect(id)}
                role="menuitem"
                aria-checked={isActive}
              >
                <span className="theme-toggle__option-icon">{t.emoji}</span>
                <span className="theme-toggle__option-label">{t.name}</span>
                {isActive && <span className="theme-toggle__option-check">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

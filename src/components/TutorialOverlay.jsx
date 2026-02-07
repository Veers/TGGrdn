import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TUTORIAL_STORAGE_KEY = "farm_game_tutorial_done";

export function useTutorialDone() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      setDone(localStorage.getItem(TUTORIAL_STORAGE_KEY) === "1");
    } catch (_) {
      setDone(false);
    }
  }, []);

  const markDone = () => {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, "1");
      setDone(true);
    } catch (_) {}
  };

  return [done, markDone];
}

export function TutorialOverlay({ onClose }) {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
    // onClose is called from AnimatePresence onExitComplete after exit animation
  };

  return (
    <AnimatePresence onExitComplete={onClose}>
      {visible && (
        <motion.div
          key="tutorial-overlay"
          className="tutorial-overlay"
          role="dialog"
          aria-label="Подсказка"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="tutorial-overlay__backdrop"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="tutorial-overlay__card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="tutorial-overlay__title">Как играть</h2>
            <ol className="tutorial-overlay__steps">
              <li>
                В <strong>Магазине</strong> купи семена — они попадут на{" "}
                <strong>Склад</strong>
              </li>
              <li>
                Вкладка <strong>Склад</strong>: выбери семена и нажми на пустую
                грядку, чтобы посадить
              </li>
              <li>
                Когда урожай созреет — нажми на грядку: продукция попадёт в{" "}
                <strong>Амбар</strong>
              </li>
              <li>
                В <strong>Амбаре</strong> нажми «Продать всё», чтобы получить монеты
              </li>
            </ol>
            <button
              type="button"
              className="tutorial-overlay__btn"
              onClick={handleClose}
            >
              Понятно
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

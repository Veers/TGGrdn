import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./ConfirmDialog.css";

/**
 * Информационный компонент с подтверждением
 * @param {Object} props
 * @param {string} props.message - Текст сообщения
 * @param {number} props.autoCloseTime - Время до автоматического исчезновения в миллисекундах (0 = не исчезает автоматически)
 * @param {Function} props.onConfirm - Callback при нажатии "Да"
 * @param {Function} props.onCancel - Callback при нажатии "Нет"
 * @param {Function} props.onClose - Callback при закрытии (автоматически или вручную)
 * @param {boolean} props.visible - Видимость компонента
 * @param {string} props.confirmLabel - Текст кнопки "Да" (по умолчанию "Да")
 * @param {string} props.cancelLabel - Текст кнопки "Нет" (по умолчанию "Нет")
 */
export function ConfirmDialog({
  message,
  autoCloseTime = 0,
  onConfirm,
  onCancel,
  onClose,
  visible = false,
  confirmLabel = "Да",
  cancelLabel = "Нет",
}) {
  const [isVisible, setIsVisible] = useState(visible);
  const [timeLeft, setTimeLeft] = useState(autoCloseTime);

  useEffect(() => {
    setIsVisible(visible);
    if (visible && autoCloseTime > 0) {
      setTimeLeft(autoCloseTime);
    }
  }, [visible, autoCloseTime]);

  useEffect(() => {
    if (!isVisible || autoCloseTime === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          handleClose();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, autoCloseTime]);

  const handleClose = () => {
    setIsVisible(false);
    // onClose is called from AnimatePresence onExitComplete after exit animation
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    handleClose();
  };

  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    return seconds > 0 ? seconds : 0;
  };

  return (
    <AnimatePresence
      onExitComplete={() => {
        if (onClose) onClose();
      }}
    >
      {isVisible && (
        <motion.div
          key="confirm-dialog"
          className="confirm-dialog"
          role="dialog"
          aria-label="Подтверждение"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="confirm-dialog__backdrop"
            onClick={handleCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="confirm-dialog__card"
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="confirm-dialog__content">
              <p className="confirm-dialog__message">{message}</p>
              {autoCloseTime > 0 && timeLeft > 0 && (
                <div className="confirm-dialog__timer">
                  Исчезнет через {formatTime(timeLeft)} сек.
                </div>
              )}
            </div>
            <div className="confirm-dialog__actions">
              <button
                type="button"
                className="confirm-dialog__btn confirm-dialog__btn--cancel"
                onClick={handleCancel}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className="confirm-dialog__btn confirm-dialog__btn--confirm"
                onClick={handleConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

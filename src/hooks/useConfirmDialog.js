import { useState, useCallback } from "react";

/**
 * Хук для управления диалогом подтверждения
 * @returns {Object} { showDialog, hideDialog, dialogProps }
 */
export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState({
    visible: false,
    message: "",
    autoCloseTime: 0,
    onConfirm: null,
    onCancel: null,
    onClose: null,
    confirmLabel: "Да",
    cancelLabel: "Нет",
  });

  const showDialog = useCallback((options) => {
    setDialogState({
      visible: true,
      message: options.message || "",
      autoCloseTime: options.autoCloseTime || 0,
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
      onClose: options.onClose || null,
      confirmLabel: options.confirmLabel || "Да",
      cancelLabel: options.cancelLabel || "Нет",
    });
  }, []);

  const hideDialog = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const handleClose = useCallback(() => {
    if (dialogState.onClose) {
      dialogState.onClose();
    }
    hideDialog();
  }, [dialogState.onClose, hideDialog]);

  return {
    showDialog,
    hideDialog,
    dialogProps: {
      ...dialogState,
      onClose: handleClose,
    },
  };
}

/**
 * Пример использования компонента ConfirmDialog
 *
 * Этот файл демонстрирует различные способы использования ConfirmDialog
 */

import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { useConfirmDialog } from "../hooks/useConfirmDialog";

// Пример 1: Простое использование с хуком
export function ExampleWithHook() {
  const { showDialog, dialogProps } = useConfirmDialog();

  const handleButtonClick = () => {
    showDialog({
      message: "Вы уверены, что хотите выполнить это действие?",
      autoCloseTime: 5000, // Исчезнет через 5 секунд
      onConfirm: () => {
        console.log('Пользователь нажал "Да"');
        // Здесь выполняется действие при подтверждении
        alert("Действие выполнено!");
      },
      onCancel: () => {
        console.log('Пользователь нажал "Нет"');
      },
      confirmLabel: "Да",
      cancelLabel: "Нет",
    });
  };

  return (
    <>
      <button onClick={handleButtonClick}>Показать диалог подтверждения</button>
      <ConfirmDialog {...dialogProps} />
    </>
  );
}

// Пример 2: Использование без хука (прямое управление состоянием)
export function ExampleDirectState() {
  const [visible, setVisible] = useState(false);

  const handleConfirm = () => {
    console.log("Подтверждено!");
    // Выполняем действие
    alert("Действие выполнено!");
  };

  const handleCancel = () => {
    console.log("Отменено!");
  };

  return (
    <>
      <button onClick={() => setVisible(true)}>Показать диалог</button>
      <ConfirmDialog
        visible={visible}
        message="Вы уверены?"
        autoCloseTime={3000} // Исчезнет через 3 секунды
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onClose={() => setVisible(false)}
        confirmLabel="Да"
        cancelLabel="Нет"
      />
    </>
  );
}

// Пример 3: Диалог без автоматического закрытия
export function ExampleNoAutoClose() {
  const { showDialog, dialogProps } = useConfirmDialog();

  const handleClick = () => {
    showDialog({
      message: "Этот диалог не закроется автоматически",
      autoCloseTime: 0, // 0 = не закрывается автоматически
      onConfirm: () => {
        console.log("Подтверждено");
      },
    });
  };

  return (
    <>
      <button onClick={handleClick}>Показать диалог</button>
      <ConfirmDialog {...dialogProps} />
    </>
  );
}

// Пример 4: Диалог с кастомными метками кнопок
export function ExampleCustomLabels() {
  const { showDialog, dialogProps } = useConfirmDialog();

  const handleClick = () => {
    showDialog({
      message: "Удалить этот элемент?",
      confirmLabel: "Удалить",
      cancelLabel: "Отмена",
      onConfirm: () => {
        console.log("Удалено");
      },
    });
  };

  return (
    <>
      <button onClick={handleClick}>Удалить</button>
      <ConfirmDialog {...dialogProps} />
    </>
  );
}

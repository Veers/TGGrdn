import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./ConfirmDialog.css";
import "./ShopPurchaseDialog.css";

/**
 * Диалог покупки с выбором количества (семена или техника).
 * Рендерится поверх приложения через портал.
 * item: { emoji, name, cost }
 */
export function ShopPurchaseDialog({
  visible,
  item,
  coins,
  onConfirm,
  onClose,
}) {
  const [quantity, setQuantity] = useState(1);

  const maxQty = item && item.cost > 0 ? Math.floor(coins / item.cost) : 0;

  useEffect(() => {
    if (visible && item) {
      setQuantity(1);
    }
  }, [visible, item?.id]);

  useEffect(() => {
    if (visible && quantity > maxQty && maxQty >= 1) {
      setQuantity(maxQty);
    }
  }, [visible, maxQty, quantity]);

  if (!visible || !item) return null;

  const total = item.cost * quantity;
  const canBuy = maxQty >= 1 && quantity >= 1 && total <= coins;

  const handleConfirm = () => {
    if (!canBuy) return;
    onConfirm?.(quantity);
    onClose?.();
  };

  const handleCancel = () => {
    onClose?.();
  };

  const dialog = (
    <div
      className="confirm-dialog shop-purchase-dialog"
      role="dialog"
      aria-label="Покупка"
      aria-modal="true"
    >
      <div className="confirm-dialog__backdrop" onClick={handleCancel} aria-hidden />
      <div className="confirm-dialog__card">
        <div className="confirm-dialog__content">
          <p className="confirm-dialog__message">
            {item.emoji} {item.name}
          </p>
          <p className="shop-purchase-dialog__price">🪙{item.cost} за шт.</p>
          <div className="shop-purchase-dialog__stepper-wrap">
            <span className="shop-purchase-dialog__label">Количество:</span>
            <div className="shop-purchase-dialog__stepper">
              <button
                type="button"
                className="shop-purchase-dialog__qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Меньше"
              >
                −
              </button>
              <span className="shop-purchase-dialog__qty-value">
                {quantity}
              </span>
              <button
                type="button"
                className="shop-purchase-dialog__qty-btn"
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                disabled={quantity >= maxQty}
                aria-label="Больше"
              >
                +
              </button>
            </div>
            <div className="shop-purchase-dialog__step-buttons">
              <button
                type="button"
                className="shop-purchase-dialog__step-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 100))}
                disabled={quantity <= 1}
                aria-label="Минус 100"
              >
                −100
              </button>
              <button
                type="button"
                className="shop-purchase-dialog__step-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 10))}
                disabled={quantity <= 1}
                aria-label="Минус 10"
              >
                −10
              </button>
              <button
                type="button"
                className="shop-purchase-dialog__step-btn"
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 10))}
                disabled={quantity >= maxQty}
                aria-label="Плюс 10"
              >
                +10
              </button>
              <button
                type="button"
                className="shop-purchase-dialog__step-btn"
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 100))}
                disabled={quantity >= maxQty}
                aria-label="Плюс 100"
              >
                +100
              </button>
            </div>
          </div>
          <p className="shop-purchase-dialog__total">Итого: 🪙{total}</p>
        </div>
        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="confirm-dialog__btn confirm-dialog__btn--cancel"
            onClick={handleCancel}
          >
            Отмена
          </button>
          <button
            type="button"
            className="confirm-dialog__btn confirm-dialog__btn--confirm"
            onClick={handleConfirm}
            disabled={!canBuy}
          >
            Купить {quantity}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

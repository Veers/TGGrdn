import { useState } from "react";
import { useGame } from "../context/GameContext";
import { usePhysicsEffect } from "../context/PhysicsEffectContext";

export function Barn() {
  const { seeds, seedIds, barn, sellFromBarn, sellAllFromBarn } = useGame();
  const physicsApi = usePhysicsEffect();
  const [qtyToSell, setQtyToSell] = useState({});
  const totalQty = seedIds.reduce((acc, id) => acc + (barn[id] ?? 0), 0);
  const totalValue = seedIds.reduce(
    (acc, id) => acc + (barn[id] ?? 0) * seeds[id].sellPrice,
    0,
  );

  const getQty = (id) => {
    const count = barn[id] ?? 0;
    const current = qtyToSell[id];
    if (current == null) return 1;
    return Math.min(Math.max(1, current), count || 1);
  };

  const setQty = (id, value) => {
    const count = barn[id] ?? 0;
    const clamped = Math.min(Math.max(1, value), count);
    setQtyToSell((prev) => ({ ...prev, [id]: clamped }));
  };

  const triggerCoinsEffect = (count = 5) => {
    const cx = typeof window !== "undefined" ? window.innerWidth / 2 : 200;
    const cy = typeof window !== "undefined" ? window.innerHeight / 2 : 200;
    physicsApi?.current?.spawnCoins?.(cx, cy, count);
  };

  const handleSell = (id) => {
    const n = getQty(id);
    if (sellFromBarn(id, n)) {
      triggerCoinsEffect(3);
      setQtyToSell((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  return (
    <section className={`panel barn ${totalQty === 0 ? "barn--empty" : ""}`}>
      <h3 className="panel__title">Амбар</h3>
      <p className="panel__sub">Продукция со сборов</p>
      <div className="barn__list">
        {seedIds.map((id) => {
          const s = seeds[id];
          const count = barn[id] ?? 0;
          if (count === 0) return null;
          const rowValue = count * s.sellPrice;
          const qty = getQty(id);
          const sellValue = qty * s.sellPrice;
          return (
            <div key={id} className="barn__item">
              <span className="barn__emoji">{s.emoji}</span>
              <span className="barn__name">{s.name}</span>
              <span className="barn__count">×{count}</span>
              <span className="barn__value">= 🪙{rowValue}</span>
              <div className="barn__item-actions">
                <div className="barn__qty-stepper">
                  <button
                    type="button"
                    className="barn__qty-btn"
                    onClick={() => setQty(id, qty - 1)}
                    disabled={qty <= 1}
                    aria-label="Меньше"
                  >
                    −
                  </button>
                  <span className="barn__qty-value">{qty}</span>
                  <button
                    type="button"
                    className="barn__qty-btn"
                    onClick={() => setQty(id, qty + 1)}
                    disabled={qty >= count}
                    aria-label="Больше"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="barn__sell-row"
                  onClick={() => handleSell(id)}
                  title={`Продать ${qty} шт. за 🪙${sellValue}`}
                >
                  Продать {qty}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {totalQty === 0 ? (
        <p className="barn__empty">Пока пусто. Собери урожай с грядок.</p>
      ) : (
        <button
          type="button"
          className="barn__sell"
          onClick={() => {
            sellAllFromBarn();
            triggerCoinsEffect(8);
          }}
        >
          Продать всё за 🪙{totalValue}
        </button>
      )}
    </section>
  );
}

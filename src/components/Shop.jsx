import { useState } from "react";
import { useGame } from "../context/GameContext";
import { ShopPurchaseDialog } from "./ShopPurchaseDialog";

export function Shop() {
  const { seeds, seedIds, machinery, machineryIds, coins, buySeeds, buyMachinery } = useGame();
  const [purchaseSeedId, setPurchaseSeedId] = useState(null);
  const [purchaseMachineryId, setPurchaseMachineryId] = useState(null);

  const seed = purchaseSeedId ? seeds[purchaseSeedId] : null;
  const machineryItem = purchaseMachineryId ? machinery[purchaseMachineryId] : null;
  const dialogItem = seed ?? machineryItem;

  const handleBuySeed = (id) => {
    if (seeds[id] && coins >= seeds[id].cost) setPurchaseSeedId(id);
  };

  const handleBuyMachinery = (id) => {
    if (machinery[id] && coins >= machinery[id].cost) setPurchaseMachineryId(id);
  };

  const handlePurchaseConfirm = (quantity) => {
    if (purchaseSeedId) {
      buySeeds(purchaseSeedId, quantity);
      setPurchaseSeedId(null);
    } else if (purchaseMachineryId) {
      buyMachinery(purchaseMachineryId, quantity);
      setPurchaseMachineryId(null);
    }
  };

  const closeDialog = () => {
    setPurchaseSeedId(null);
    setPurchaseMachineryId(null);
  };

  return (
    <>
      <section className="panel shop">
        <h3 className="panel__title">Магазин</h3>
        <p className="panel__sub">Семена → склад · Техника → гараж</p>

        <div className="shop__block">
          <h4 className="shop__block-title">Семена</h4>
          <div className="shop__seeds">
            {seedIds.map((id) => {
              const s = seeds[id];
              const canBuy = coins >= s.cost;
              return (
                <button
                  key={id}
                  type="button"
                  className={`shop__seed ${!canBuy ? "shop__seed--disabled" : ""}`}
                  onClick={() => canBuy && handleBuySeed(id)}
                  disabled={!canBuy}
                >
                  <span className="shop__seed-emoji">{s.emoji}</span>
                  <span className="shop__seed-name">{s.name}</span>
                  <span className="shop__seed-price">🪙{s.cost}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="shop__block">
          <h4 className="shop__block-title">Техника</h4>
          <div className="shop__seeds shop__machinery">
            {machineryIds.map((id) => {
              const m = machinery[id];
              const canBuy = coins >= m.cost;
              return (
                <button
                  key={id}
                  type="button"
                  className={`shop__seed ${!canBuy ? "shop__seed--disabled" : ""}`}
                  onClick={() => canBuy && handleBuyMachinery(id)}
                  disabled={!canBuy}
                >
                  <span className="shop__seed-emoji">{m.emoji}</span>
                  <span className="shop__seed-name">{m.name}</span>
                  <span className="shop__seed-price">🪙{m.cost}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
      <ShopPurchaseDialog
        visible={!!dialogItem}
        item={dialogItem}
        coins={coins}
        onConfirm={handlePurchaseConfirm}
        onClose={closeDialog}
      />
    </>
  );
}

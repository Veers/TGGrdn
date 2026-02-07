import { useGame } from "../context/GameContext";

export function ExpandFarmBar({ showFarm = true }) {
  const { canExpand, expandCost, coins, expandFarm } = useGame();
  if (!canExpand || !showFarm) return null;
  return (
    <div className="expand-bar">
      <button
        type="button"
        className="expand-bar__btn"
        onClick={() => expandFarm()}
        disabled={coins < expandCost}
      >
        Расширить ферму 🪙{expandCost}
      </button>
    </div>
  );
}

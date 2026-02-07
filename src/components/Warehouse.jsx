import { useGame } from "../context/GameContext";

export function Warehouse({
  selectedSeedId,
  onSelectSeed,
  showBottomHint = true,
}) {
  const { seeds, seedIds, warehouse } = useGame();

  return (
    <section className="panel warehouse">
      <h3 className="panel__title">Склад</h3>
      <p className="panel__sub">Семена для посадки</p>
      <div className="warehouse__list">
        {seedIds.map((id) => {
          const s = seeds[id];
          const count = warehouse[id] ?? 0;
          const isSelected = selectedSeedId === id;
          const canSelect = count > 0;
          return (
            <button
              key={id}
              type="button"
              className={`warehouse__item ${isSelected ? "warehouse__item--selected" : ""} ${!canSelect ? "warehouse__item--empty" : ""}`}
              onClick={() =>
                onSelectSeed(canSelect ? (isSelected ? null : id) : null)
              }
              disabled={!canSelect}
            >
              <span className="warehouse__emoji">{s.emoji}</span>
              <span className="warehouse__name">{s.name}</span>
              <span className="warehouse__count">×{count}</span>
            </button>
          );
        })}
      </div>
      {selectedSeedId && showBottomHint && (
        <div className="panel__hint-row">
          <p className="panel__hint">Нажми на пустую грядку, чтобы посадить</p>
          <button
            type="button"
            className="panel__cancel"
            onClick={() => onSelectSeed(null)}
          >
            Отменить
          </button>
        </div>
      )}
    </section>
  );
}

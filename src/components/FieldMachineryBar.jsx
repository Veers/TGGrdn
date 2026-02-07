import { useGame } from "../context/GameContext";

export function FieldMachineryBar() {
  const { deployedMachinery, machinery, machineryIds, returnMachineryFromField, getMachineryUnitStats } = useGame();

  const onField = machineryIds.filter((id) => (deployedMachinery[id] ?? []).length > 0);
  if (onField.length === 0) return null;

  return (
    <div className="field-machinery-bar">
      <span className="field-machinery-bar__label">На поле:</span>
      <div className="field-machinery-bar__list">
        {onField.map((id) => {
          const m = machinery[id];
          const units = deployedMachinery[id] ?? [];
          const count = units.length;
          const stats = getMachineryUnitStats(units);
          return (
            <div key={id} className="field-machinery-bar__item">
              <span className="field-machinery-bar__emoji">{m.emoji}</span>
              <span className="field-machinery-bar__name">{m.name}</span>
              <span className="field-machinery-bar__count">×{count}</span>
              <span className="field-machinery-bar__params">
                ⛽{Math.round(stats.avgFuel)}% 🔧{Math.round(stats.avgIntegrity)}%
              </span>
              <button
                type="button"
                className="field-machinery-bar__return"
                onClick={() => returnMachineryFromField(id)}
                title="Вернуть в гараж"
              >
                Вернуть
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useGame } from "../context/GameContext";
import { Plot, getPlotIndexFromEvent, isPlantAction } from "./Plot";

export function FarmGrid({ selectedSeedId, onPlant }) {
  const { grid, farmCols, farmRows } = useGame();

  const handleGridClick = (e) => {
    if (!selectedSeedId) return;
    if (!isPlantAction(e.target)) return;
    const index = getPlotIndexFromEvent(e);
    if (index < 0) return;
    onPlant?.(index);
  };

  return (
    <section className="farm" onClick={handleGridClick}>
      <div
        className="farm__grid"
        style={{
          gridTemplateColumns: `repeat(${farmCols}, var(--farm-plot-size))`,
          gridTemplateRows: `repeat(${farmRows}, var(--farm-plot-size))`,
        }}
      >
        {grid.map((_, i) => (
          <Plot key={i} index={i} />
        ))}
      </div>
    </section>
  );
}

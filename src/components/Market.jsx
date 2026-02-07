import { useGame } from "../context/GameContext";

export function Market() {
  const { seeds, seedIds } = useGame();

  return (
    <aside className="market">
      <div className="market__title">Рынок</div>
      <div className="market__section">
        <div className="market__heading">Семена</div>
        {seedIds.map((id) => {
          const s = seeds[id];
          return (
            <div key={`seed-${id}`} className="market__row">
              <span className="market__emoji">{s.emoji}</span>
              <span className="market__price">🪙{s.cost}</span>
            </div>
          );
        })}
      </div>
      <div className="market__section">
        <div className="market__heading">Продукция</div>
        {seedIds.map((id) => {
          const s = seeds[id];
          return (
            <div key={`prod-${id}`} className="market__row">
              <span className="market__emoji">{s.emoji}</span>
              <span className="market__price">🪙{s.sellPrice}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

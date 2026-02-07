const SAVE_KEY = "farm_game_save";
const TUTORIAL_KEY = "farm_game_tutorial_done";

function resetGame() {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(TUTORIAL_KEY);
    window.location.reload();
  } catch (_) {}
}

export function DevTools() {
  return (
    <section className="panel devtools">
      <h3 className="panel__title">DevTools</h3>
      <p className="panel__sub">Служебные действия</p>
      <button type="button" className="devtools__reset" onClick={resetGame}>
        Сбросить игру (новая игра)
      </button>
    </section>
  );
}

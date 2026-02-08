import { useGame } from "../context/GameContext";

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
  const {
    repairAllMachinery,
    addCoins,
    addAllMachinery,
    addAllSeeds,
    addCrypto,
    deployAllMachineryToField,
    returnAllMachineryFromField,
  } = useGame();

  const handleRepairAll = () => {
    repairAllMachinery();
  };

  const handleAddCoins = () => {
    addCoins(1000000);
  };

  const handleAddMachinery = () => {
    addAllMachinery(100);
  };

  const handleAddSeeds = () => {
    addAllSeeds(1000);
  };

  const handleAddCrypto = () => {
    addCrypto(10000);
  };

  const handleDeployAll = () => {
    deployAllMachineryToField();
  };

  const handleReturnAll = () => {
    returnAllMachineryFromField();
  };

  return (
    <section className="panel devtools">
      <h3 className="panel__title">DevTools</h3>
      <p className="panel__sub">Служебные действия</p>
      <div className="devtools__actions">
        <button type="button" className="devtools__btn" onClick={handleRepairAll}>
          Починить всю технику
        </button>
        <button type="button" className="devtools__btn" onClick={handleAddCoins}>
          Выдать 1,000,000 монет
        </button>
        <button type="button" className="devtools__btn" onClick={handleAddMachinery}>
          Выдать по 100 каждой техники
        </button>
        <button type="button" className="devtools__btn" onClick={handleAddSeeds}>
          Выдать по 1000 каждой семечки
        </button>
        <button type="button" className="devtools__btn" onClick={handleAddCrypto}>
          Выдать 10,000 CRX
        </button>
        <button type="button" className="devtools__btn" onClick={handleDeployAll}>
          Всю технику на поле
        </button>
        <button type="button" className="devtools__btn" onClick={handleReturnAll}>
          Всю технику с поля
        </button>
        <button type="button" className="devtools__reset" onClick={resetGame}>
          Сбросить игру (новая игра)
        </button>
      </div>
    </section>
  );
}

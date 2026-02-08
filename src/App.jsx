import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTelegram } from "./hooks/useTelegram";
import { GameProvider, useGame } from "./context/GameContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Stats } from "./components/Stats";
import { Market } from "./components/Market";
import { Shop } from "./components/Shop";
import { Warehouse } from "./components/Warehouse";
import { Barn } from "./components/Barn";
import { Exchange } from "./components/market/index.jsx";
import { ExchangeBottom } from "./components/market/ExchangeBottom";
import { Garage } from "./components/Garage";
import { DevTools } from "./components/DevTools";
import { FarmGrid } from "./components/FarmGrid";
import { FieldMachineryBar } from "./components/FieldMachineryBar";
import { ExpandFarmBar } from "./components/ExpandFarmBar";
import { TutorialOverlay, useTutorialDone } from "./components/TutorialOverlay";
import { LeftToggleMenu } from "./components/LeftToggleMenu";
import { ThemeToggle } from "./components/ThemeToggle";
import { SoundToggle } from "./components/SoundToggle";
import { PhysicsEffectLayer } from "./components/PhysicsEffectLayer";
import { SoundProvider, useSound } from "./context/SoundContext";
import { PhysicsEffectProvider } from "./context/PhysicsEffectContext";
import "./App.css";

const TABS = [
  { id: "warehouse", label: "Склад", icon: "📦" },
  { id: "barn", label: "Амбар", icon: "🏚" },
  { id: "garage", label: "Гараж", icon: "🚜" },
  { id: "shop", label: "Магазин", icon: "🛒" },
  { id: "exchange", label: "Биржа", icon: "💹" },
  { id: "devtools", label: "DevTools", icon: "🛠" },
];

/** Левое меню — взаимодействие с другими игроками */
const LEFT_MENU = [
  { id: "friends", label: "Друзья", icon: "👥" },
  { id: "leaderboard", label: "Рейтинг", icon: "🏆" },
];

function FarmGame() {
  const { plant, garage, machineryIds } = useGame();
  const [tab, setTab] = useState("warehouse");
  const [selectedSeedId, setSelectedSeedId] = useState(null);
  const [seedPricesOpen, setSeedPricesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [tutorialDone, setTutorialDone] = useTutorialDone();
  const physicsEffectApiRef = useRef(null);

  // Проверить, есть ли техника в гараже
  const hasMachinery = machineryIds.some((id) => (garage[id] ?? []).length > 0);

  const handlePlant = (plotIndex) => {
    if (!selectedSeedId) return;
    const ok = plant(plotIndex, selectedSeedId);
    if (ok) setSelectedSeedId(null);
  };

  const isPlantingMode = tab === "warehouse" && selectedSeedId != null;

  return (
    <PhysicsEffectProvider apiRef={physicsEffectApiRef}>
      <div className={`app ${isPlantingMode ? "app--planting-mode" : ""}`}>
        {!tutorialDone && <TutorialOverlay onClose={setTutorialDone} />}
        <div className="app__main">
          {tab !== "exchange" && (
            <aside className="app__left">
              <LeftToggleMenu
                items={LEFT_MENU}
                renderContent={(activeId) => (
                  <p className="left-toggle-menu__panel-placeholder">
                    {activeId === "friends" && "Список друзей — скоро."}
                    {activeId === "leaderboard" && "Рейтинг игроков — скоро."}
                  </p>
                )}
              />
              <div className="app__left-actions">
                <ThemeToggle />
                <SoundToggle />
              </div>
            </aside>
          )}
          <div className="app__body">
            {tab === "exchange" ? (
              <div className="app__screen app__screen--exchange">
                <Exchange />
              </div>
            ) : (
              <>
                <div className="app__top">
                  <Stats />
                </div>
                <div
                  className={`app__body-farm-wrap ${isPlantingMode ? "app__planting-zone" : ""}`}
                >
                  <FarmGrid
                    selectedSeedId={tab === "warehouse" ? selectedSeedId : null}
                    onPlant={handlePlant}
                  />
                  <PhysicsEffectLayer effectApiRef={physicsEffectApiRef} />
                  {isPlantingMode && (
                    <button
                      type="button"
                      className="farm-back-btn"
                      onClick={() => setSelectedSeedId(null)}
                    >
                      Назад
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        {tab !== "exchange" && (
          <div className="app__right">
            <aside className="market-wrap">
              {seedPricesOpen && (
                <div className="market-wrap__panel">
                  <Market />
                </div>
              )}
              <button
                type="button"
                className="market-wrap__toggle"
                onClick={() => setSeedPricesOpen((v) => !v)}
                title={seedPricesOpen ? "Свернуть цены" : "Показать цены на семена"}
                aria-label={seedPricesOpen ? "Свернуть цены" : "Показать цены на семена"}
              >
                <span className="market-wrap__toggle-text">
                  {seedPricesOpen ? "◀" : "Цены ▶"}
                </span>
              </button>
            </aside>
            <aside className="profile-wrap">
              {profileOpen && (
                <div className="profile-wrap__panel">
                  <section className="panel profile-panel">
                    <h3 className="panel__title">Профиль</h3>
                    <p className="profile-panel__text">
                      Здесь будет информация о вашем аккаунте, достижения и настройки.
                    </p>
                  </section>
                </div>
              )}
              <button
                type="button"
                className="profile-wrap__toggle"
                onClick={() => setProfileOpen((v) => !v)}
                title={profileOpen ? "Свернуть профиль" : "Открыть профиль"}
                aria-label={profileOpen ? "Свернуть профиль" : "Открыть профиль"}
              >
                <span className="profile-wrap__toggle-text">
                  {profileOpen ? "◀" : "👤 ▶"}
                </span>
              </button>
            </aside>
          </div>
        )}
      </div>
      {tab !== "exchange" && <FieldMachineryBar />}
      <ExpandFarmBar showFarm={tab !== "exchange"} />
      <div className={`app__bottom ${tab === "garage" && hasMachinery ? "app__bottom--garage-open" : ""}`}>
        <div className="app__bottom-scroll">
          <AnimatePresence mode="wait" initial={false}>
            {tab === "shop" && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                style={{ minHeight: 0 }}
              >
                <Shop />
              </motion.div>
            )}
            {tab === "warehouse" && (
              <motion.div
                key="warehouse"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                style={{ minHeight: 0 }}
              >
                <Warehouse
                  selectedSeedId={selectedSeedId}
                  onSelectSeed={setSelectedSeedId}
                  showBottomHint={!isPlantingMode}
                />
              </motion.div>
            )}
            {tab === "barn" && (
              <motion.div
                key="barn"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                style={{ minHeight: 0 }}
              >
                <Barn />
              </motion.div>
            )}
            {tab === "exchange" && (
              <motion.div
                key="exchange"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                style={{ minHeight: 0 }}
              >
                <ExchangeBottom />
              </motion.div>
            )}
            {tab === "garage" && (
              <motion.div
                key="garage"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                style={{ minHeight: 0 }}
              >
                <Garage />
              </motion.div>
            )}
            {tab === "devtools" && (
              <motion.div
                key="devtools"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                style={{ minHeight: 0 }}
              >
                <DevTools />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tabs__btn ${tab === t.id ? "tabs__btn--active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span className="tabs__icon">{t.icon}</span>
              <span className="tabs__label">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
      </div>
    </PhysicsEffectProvider>
  );
}

function App() {
  const { webApp } = useTelegram();

  // Telegram theme применяется только если пользователь не выбрал свою тему
  // ThemeContext перезапишет эти значения при инициализации
  useEffect(() => {
    if (!webApp?.themeParams) return;
    const savedTheme = localStorage.getItem("farm_game_theme");
    // Если пользователь уже выбрал тему, не применяем Telegram тему
    if (savedTheme && savedTheme !== "dark") return;
    
    const t = webApp.themeParams;
    // Применяем Telegram тему только для темной темы по умолчанию
    document.documentElement.style.setProperty(
      "--tg-theme-bg-color",
      t.bg_color || "#1a1a2e",
    );
    document.documentElement.style.setProperty(
      "--tg-theme-text-color",
      t.text_color || "#eee",
    );
    document.documentElement.style.setProperty(
      "--tg-theme-hint-color",
      t.hint_color || "#aaa",
    );
    document.documentElement.style.setProperty(
      "--tg-theme-button-color",
      t.button_color || "#4a7c59",
    );
    document.documentElement.style.setProperty(
      "--tg-theme-button-text-color",
      t.button_text_color || "#fff",
    );
    document.documentElement.style.setProperty(
      "--tg-theme-secondary-bg-color",
      t.secondary_bg_color || "#16213e",
    );
  }, [webApp]);

  return (
    <ThemeProvider>
      <SoundProvider>
        <AppWithSound />
      </SoundProvider>
    </ThemeProvider>
  );
}

function AppWithSound() {
  const { playSound } = useSound();
  return (
    <GameProvider playSound={playSound}>
      <FarmGame />
    </GameProvider>
  );
}

export default App;

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const THEME_STORAGE_KEY = "farm_game_theme";
const THEMES = {
  dark: {
    id: "dark",
    name: "Тёмная",
    emoji: "🌙",
    colors: {
      "--tg-theme-bg-color": "#1a1a2e",
      "--tg-theme-text-color": "#eee",
      "--tg-theme-hint-color": "#aaa",
      "--tg-theme-button-color": "#4a7c59",
      "--tg-theme-button-text-color": "#fff",
      "--tg-theme-secondary-bg-color": "#16213e",
      "--glass-bg": "rgba(22, 33, 62, 0.7)",
      "--glass-bg-light": "rgba(22, 33, 62, 0.5)",
      "--glass-border": "rgba(255, 255, 255, 0.1)",
      "--gradient-button": "linear-gradient(135deg, #4a7c59 0%, #5a9c6a 100%)",
      "--gradient-accent": "linear-gradient(135deg, rgba(74, 124, 89, 0.3) 0%, rgba(74, 124, 89, 0.1) 100%)",
      "--shadow-glow": "0 0 20px rgba(74, 124, 89, 0.4)",
      "--shadow-glow-strong": "0 0 30px rgba(74, 124, 89, 0.6)",
    },
  },
  light: {
    id: "light",
    name: "Светлая",
    emoji: "☀️",
    colors: {
      "--tg-theme-bg-color": "#f5f5f5",
      "--tg-theme-text-color": "#1a1a2e",
      "--tg-theme-hint-color": "#666",
      "--tg-theme-button-color": "#4a7c59",
      "--tg-theme-button-text-color": "#fff",
      "--tg-theme-secondary-bg-color": "#ffffff",
      "--glass-bg": "rgba(255, 255, 255, 0.8)",
      "--glass-bg-light": "rgba(255, 255, 255, 0.6)",
      "--glass-border": "rgba(0, 0, 0, 0.1)",
      "--gradient-button": "linear-gradient(135deg, #4a7c59 0%, #5a9c6a 100%)",
      "--gradient-accent": "linear-gradient(135deg, rgba(74, 124, 89, 0.15) 0%, rgba(74, 124, 89, 0.05) 100%)",
      "--shadow-glow": "0 0 20px rgba(74, 124, 89, 0.3)",
      "--shadow-glow-strong": "0 0 30px rgba(74, 124, 89, 0.5)",
    },
  },
  degen: {
    id: "degen",
    name: "Degen",
    emoji: "🚀",
    colors: {
      "--tg-theme-bg-color": "#0a0a0a",
      "--tg-theme-text-color": "#00ff88",
      "--tg-theme-hint-color": "#00cc66",
      "--tg-theme-button-color": "#ff0080",
      "--tg-theme-button-text-color": "#000",
      "--tg-theme-secondary-bg-color": "#1a0a1a",
      "--glass-bg": "rgba(255, 0, 128, 0.15)",
      "--glass-bg-light": "rgba(255, 0, 128, 0.1)",
      "--glass-border": "rgba(0, 255, 136, 0.3)",
      "--gradient-button": "linear-gradient(135deg, #ff0080 0%, #ff40a0 100%)",
      "--gradient-accent": "linear-gradient(135deg, rgba(255, 0, 128, 0.3) 0%, rgba(0, 255, 136, 0.2) 100%)",
      "--shadow-glow": "0 0 20px rgba(255, 0, 128, 0.6)",
      "--shadow-glow-strong": "0 0 30px rgba(0, 255, 136, 0.8)",
    },
  },
};

const THEME_IDS = Object.keys(THEMES);

function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && THEMES[saved]) return saved;
  } catch {
    // Ignore localStorage errors
  }
  return "dark";
}

function applyTheme(themeId) {
  const theme = THEMES[themeId];
  if (!theme) return;
  document.documentElement.setAttribute("data-theme", themeId);
  Object.entries(theme.colors).forEach(([prop, value]) => {
    document.documentElement.style.setProperty(prop, value);
  });
}

// Применяем тему сразу при загрузке модуля, чтобы избежать мигания
if (typeof document !== "undefined") {
  const initialTheme = loadTheme();
  applyTheme(initialTheme);
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => loadTheme());

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  const setTheme = useCallback((id) => {
    if (!THEMES[id]) return;
    setThemeId(id);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const cycleTheme = useCallback(() => {
    const currentIdx = THEME_IDS.indexOf(themeId);
    const nextIdx = (currentIdx + 1) % THEME_IDS.length;
    setTheme(THEME_IDS[nextIdx]);
  }, [themeId, setTheme]);

  const value = useMemo(
    () => ({
      themeId,
      theme: THEMES[themeId],
      themes: THEMES,
      themeIds: THEME_IDS,
      setTheme,
      cycleTheme,
    }),
    [themeId, setTheme, cycleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

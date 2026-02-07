import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { Howl } from "howler";

const SOUND_STORAGE_KEY = "farm_game_sound";
const SOUND_IDS = [
  "plant",
  "harvest",
  "buy",
  "sell",
  "water",
  "weed",
  "fertilize",
  "expand",
];

function getSoundEnabled() {
  try {
    const v = localStorage.getItem(SOUND_STORAGE_KEY);
    return v !== "0" && v !== "false";
  } catch {
    return true;
  }
}

function createHowl(src) {
  try {
    return new Howl({
      src: [src],
      volume: 0.5,
      onloaderror: () => {},
    });
  } catch {
    return null;
  }
}

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [soundEnabled, setSoundEnabledState] = useState(getSoundEnabled);
  const soundsRef = useRef(null);

  useEffect(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const ext = "mp3"; // use .wav placeholders; replace with .mp3 for real sounds
    soundsRef.current = {
      plant: createHowl(`${base}/sounds/plant.${ext}`),
      harvest: createHowl(`${base}/sounds/harvest.${ext}`),
      buy: createHowl(`${base}/sounds/buy.${ext}`),
      sell: createHowl(`${base}/sounds/sell.${ext}`),
      water: createHowl(`${base}/sounds/water.${ext}`),
      weed: createHowl(`${base}/sounds/weed.${ext}`),
      fertilize: createHowl(`${base}/sounds/fertilize.${ext}`),
      expand: createHowl(`${base}/sounds/expand.${ext}`),
    };
    return () => {
      SOUND_IDS.forEach((id) => {
        const s = soundsRef.current?.[id];
        if (s?.state?.() === "loaded") s.unload();
      });
      soundsRef.current = null;
    };
  }, []);

  const playSound = useCallback((id) => {
    if (!getSoundEnabled()) return;
    const s = soundsRef.current?.[id];
    if (s) {
      try {
        s.play();
      } catch {
        // Игнорируем ошибки воспроизведения звука
      }
    }
  }, []);

  const setSoundEnabled = useCallback((enabled) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, enabled ? "1" : "0");
    } catch {
      // Игнорируем ошибки localStorage
    }
  }, []);

  const value = useMemo(
    () => ({ playSound, soundEnabled, setSoundEnabled }),
    [playSound, soundEnabled, setSoundEnabled],
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used inside SoundProvider");
  return ctx;
}

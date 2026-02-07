import { useSound } from "../context/SoundContext";

export function SoundToggle() {
  const { soundEnabled, setSoundEnabled } = useSound();

  return (
    <button
      type="button"
      className="sound-toggle"
      onClick={() => setSoundEnabled(!soundEnabled)}
      aria-label={soundEnabled ? "Выключить звук" : "Включить звук"}
      title={soundEnabled ? "Звук вкл" : "Звук выкл"}
    >
      <span className="sound-toggle__icon" aria-hidden>
        {soundEnabled ? "🔊" : "🔇"}
      </span>
    </button>
  );
}

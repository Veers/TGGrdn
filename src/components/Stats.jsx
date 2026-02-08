import { useState, useEffect } from "react";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useGame } from "../context/GameContext";

function formatGameTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function Stats() {
  const { coins, crypto, CRYPTO_TICKER } = useGame();
  const [sessionTime, setSessionTime] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setSessionTime(Date.now() - start), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="stats">
      <span className="stats__timer" title="Время в этой сессии">
        ⏱ {formatGameTime(sessionTime)}
      </span>
      <span className="stats__coins">🪙 {coins}</span>
      <span className="stats__crypto">
        💎 {crypto} {CRYPTO_TICKER}
      </span>
      <div className="stats__wallet">
        <TonConnectButton className="stats__ton-btn" />
      </div>
    </header>
  );
}

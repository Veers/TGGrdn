import { TonConnectButton } from "@tonconnect/ui-react";
import { useGame } from "../context/GameContext";

export function Stats() {
  const { coins, crypto, CRYPTO_TICKER } = useGame();
  return (
    <header className="stats">
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

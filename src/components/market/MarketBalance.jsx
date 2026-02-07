import { useGame } from '../../context/GameContext';

export function MarketBalance() {
  const { coins, crypto, CRYPTO_TICKER } = useGame();

  return (
    <div className="market__balance">
      <span className="market__balance-item market__balance-item--coins">🪙 {coins}</span>
      <span className="market__balance-item market__balance-item--crypto">💎 {crypto} {CRYPTO_TICKER}</span>
    </div>
  );
}

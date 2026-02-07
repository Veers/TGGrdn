import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { MarketBalance } from './MarketBalance';
import { MarketOrderBook } from './MarketOrderBook';
import { MarketTrade } from './MarketTrade';
import { MarketChart } from './MarketChart';
import './Market.css';

export function Exchange() {
  const { CRYPTO_TICKER, getCryptoRates, buyCrypto, sellCrypto } = useGame();
  const [rates, setRates] = useState(getCryptoRates());

  useEffect(() => {
    const id = setInterval(() => setRates(getCryptoRates()), 2000);
    return () => clearInterval(id);
  }, []);

  const handleBuy = (qty) => {
    if (rates.buyRate && qty >= 1) buyCrypto(qty * rates.buyRate);
  };

  const handleSell = (qty) => {
    if (rates.sellRate && qty >= 1) sellCrypto(qty);
  };

  return (
    <section className="panel market">
      <h3 className="panel__title">Биржа {CRYPTO_TICKER}</h3>
      <p className="panel__sub">Внешняя криптовалюта, курс меняется</p>

      <MarketBalance />

      <MarketTrade
        buyRate={rates.buyRate}
        sellRate={rates.sellRate}
        ticker={CRYPTO_TICKER}
        onBuy={handleBuy}
        onSell={handleSell}
      />

      <div className="exchange-bottom">
        <MarketOrderBook
          buyRate={rates.buyRate}
          sellRate={rates.sellRate}
          marketRate={rates.marketRate}
          ticker={CRYPTO_TICKER}
        />
        <MarketChart
          marketRate={rates.marketRate}
          ticker={CRYPTO_TICKER}
        />
      </div>
    </section>
  );
}

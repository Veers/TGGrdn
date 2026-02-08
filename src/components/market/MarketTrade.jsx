import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';

export function MarketTrade({ buyRate, sellRate, ticker, onBuy, onSell }) {
  const { coins, crypto } = useGame();
  const [buyQty, setBuyQty] = useState(1);
  const [sellQty, setSellQty] = useState(1);

  const maxBuy = buyRate > 0 ? Math.floor(coins / buyRate) : 0;
  const maxSell = Math.max(0, crypto ?? 0);

  useEffect(() => {
    if (maxBuy > 0 && buyQty > maxBuy) setBuyQty(maxBuy);
  }, [maxBuy, buyQty]);

  useEffect(() => {
    if (maxSell > 0 && sellQty > maxSell) setSellQty(maxSell);
  }, [maxSell, sellQty]);

  const buyTotal = buyQty * buyRate;
  const sellTotal = sellQty * sellRate;
  const canBuy = maxBuy >= 1 && buyQty >= 1 && buyTotal <= coins;
  const canSell = maxSell >= 1 && sellQty >= 1 && sellQty <= maxSell;

  const clampBuy = (v) => Math.min(Math.max(1, v), maxBuy || 1);
  const clampSell = (v) => Math.min(Math.max(1, v), maxSell || 1);

  const handleBuyQtyChange = (e) => {
    const value = parseInt(e.target.value, 10) || 1;
    setBuyQty(clampBuy(value));
  };

  const handleSellQtyChange = (e) => {
    const value = parseInt(e.target.value, 10) || 1;
    setSellQty(clampSell(value));
  };

  return (
    <div className="market__trade">
      <div className="market__trade-block market__trade-block--buy">
        <span className="market__trade-block-title">Покупка</span>
        <div className="market__trade-stepper">
          <button
            type="button"
            className="market__trade-stepper-btn"
            onClick={() => setBuyQty((q) => clampBuy(q - 1))}
            disabled={buyQty <= 1}
            aria-label="Меньше"
          >
            −
          </button>
          <input
            type="number"
            className="market__trade-stepper-value market__trade-stepper-input"
            value={buyQty}
            onChange={handleBuyQtyChange}
            min={1}
            max={maxBuy}
            aria-label="Количество для покупки"
          />
          <button
            type="button"
            className="market__trade-stepper-btn"
            onClick={() => setBuyQty((q) => clampBuy(q + 1))}
            disabled={buyQty >= maxBuy}
            aria-label="Больше"
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="market__trade-btn market__trade-btn--buy"
          onClick={() => onBuy(buyQty)}
          disabled={!canBuy}
        >
          Купить {buyQty} {ticker} за 🪙{buyTotal.toLocaleString()}
        </button>
      </div>

      <div className="market__trade-block market__trade-block--sell">
        <span className="market__trade-block-title">Продажа</span>
        <div className="market__trade-stepper">
          <button
            type="button"
            className="market__trade-stepper-btn"
            onClick={() => setSellQty((q) => clampSell(q - 1))}
            disabled={sellQty <= 1}
            aria-label="Меньше"
          >
            −
          </button>
          <input
            type="number"
            className="market__trade-stepper-value market__trade-stepper-input"
            value={sellQty}
            onChange={handleSellQtyChange}
            min={1}
            max={maxSell}
            aria-label="Количество для продажи"
          />
          <button
            type="button"
            className="market__trade-stepper-btn"
            onClick={() => setSellQty((q) => clampSell(q + 1))}
            disabled={sellQty >= maxSell}
            aria-label="Больше"
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="market__trade-btn market__trade-btn--sell"
          onClick={() => onSell(sellQty)}
          disabled={!canSell}
        >
          Продать {sellQty} {ticker} за 🪙{sellTotal.toLocaleString()}
        </button>
      </div>
    </div>
  );
}

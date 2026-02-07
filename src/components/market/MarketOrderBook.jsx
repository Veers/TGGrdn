import { useMemo } from "react";

/** Псевдо-объёмы для стакана (детерминировано от курса) */
function getLevelVolumes(seed, count) {
  const v = [];
  for (let i = 0; i < count; i++) {
    const t = Math.sin(seed * (i + 1) * 0.7) * 50 + 80 + i * 20;
    v.push(Math.max(10, Math.round(t)));
  }
  return v;
}

const DEPTH = 5;

export function MarketOrderBook({ buyRate, sellRate, marketRate, ticker }) {
  const { bids, asks } = useMemo(() => {
    const volBid = getLevelVolumes(sellRate, DEPTH);
    const volAsk = getLevelVolumes(buyRate, DEPTH);

    const bids = [];
    const asks = [];

    for (let i = 0; i < DEPTH; i++) {
      bids.push({
        price: Math.max(1, sellRate - i),
        volume: volBid[i],
      });
      asks.push({
        price: buyRate + i,
        volume: volAsk[i],
      });
    }

    return { bids, asks };
  }, [sellRate, buyRate]);

  return (
    <div className="market__orderbook">
      <div className="market__orderbook-header">
        <span className="market__orderbook-title">Стакан</span>
        <span className="market__orderbook-rate">
          1 {ticker} ≈ {marketRate} 🪙
        </span>
      </div>

      <div className="market__orderbook-table-wrap">
        <table className="market__orderbook-table">
          <thead>
            <tr>
              <th className="market__orderbook-th market__orderbook-th--bid">
                Спрос (покупка)
              </th>
              <th className="market__orderbook-th market__orderbook-th--ask">
                Предложение (продажа)
              </th>
            </tr>
            <tr className="market__orderbook-subhead">
              <th className="market__orderbook-th">Цена · Объём</th>
              <th className="market__orderbook-th">Цена · Объём</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid, i) => (
              <tr key={`bid-${i}`} className="market__orderbook-tr">
                <td className="market__orderbook-td market__orderbook-td--bid">
                  <span className="market__orderbook-price">🪙{bid.price}</span>
                  <span className="market__orderbook-volume">{bid.volume}</span>
                </td>
                <td className="market__orderbook-td market__orderbook-td--ask">
                  {asks[i] ? (
                    <>
                      <span className="market__orderbook-price">🪙{asks[i].price}</span>
                      <span className="market__orderbook-volume">{asks[i].volume}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

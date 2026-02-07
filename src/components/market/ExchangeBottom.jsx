import { useState } from "react";
import { useGame } from "../../context/GameContext";
import "./Market.css";

const EXCHANGE_SUB_TABS = [
  { id: "orders", label: "Открытые ордера", icon: "📋" },
  { id: "history", label: "История торговли", icon: "📜" },
];

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function ExchangeBottom() {
  const { CRYPTO_TICKER, openOrders, tradeHistory } = useGame();
  const [subTab, setSubTab] = useState("orders");

  return (
    <div className="exchange-bottom-panel">
      <nav className="exchange-bottom-panel__tabs">
        {EXCHANGE_SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`exchange-bottom-panel__tab ${subTab === t.id ? "exchange-bottom-panel__tab--active" : ""}`}
            onClick={() => setSubTab(t.id)}
          >
            <span className="exchange-bottom-panel__tab-icon">{t.icon}</span>
            <span className="exchange-bottom-panel__tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
      <div className="exchange-bottom-panel__content">
        {subTab === "orders" && (
          <div className="exchange-bottom-panel__list">
            {openOrders.length === 0 ? (
              <p className="exchange-bottom-panel__empty">Нет открытых ордеров</p>
            ) : (
              openOrders.map((order) => (
                <div
                  key={order.id}
                  className={`exchange-bottom-panel__row exchange-bottom-panel__row--${order.type}`}
                >
                  <span className="exchange-bottom-panel__row-type">
                    {order.type === "buy" ? "Покупка" : "Продажа"}
                  </span>
                  <span className="exchange-bottom-panel__row-amount">
                    {order.amount} {CRYPTO_TICKER}
                  </span>
                  <span className="exchange-bottom-panel__row-rate">🪙{order.rate}</span>
                  <span className="exchange-bottom-panel__row-date">{formatDate(order.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        )}
        {subTab === "history" && (
          <div className="exchange-bottom-panel__list">
            {tradeHistory.length === 0 ? (
              <p className="exchange-bottom-panel__empty">История пуста. Совершите сделку на бирже.</p>
            ) : (
              [...tradeHistory].reverse().map((trade) => (
                <div
                  key={trade.id}
                  className={`exchange-bottom-panel__row exchange-bottom-panel__row--${trade.type}`}
                >
                  <span className="exchange-bottom-panel__row-type">
                    {trade.type === "buy" ? "Покупка" : "Продажа"}
                  </span>
                  <span className="exchange-bottom-panel__row-amount">
                    {trade.amount} {CRYPTO_TICKER}
                  </span>
                  <span className="exchange-bottom-panel__row-price-label">
                    {trade.type === "buy" ? "Цена покупки" : "Цена продажи"}: 🪙{trade.rate}
                  </span>
                  <span className="exchange-bottom-panel__row-date">{formatDate(trade.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

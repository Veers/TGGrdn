import { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import './Market.css';

export function MarketChart({ marketRate, ticker }) {
  const { getCryptoRates } = useGame();
  const [priceHistory, setPriceHistory] = useState([]);
  const canvasRef = useRef(null);
  const maxPoints = 50;

  useEffect(() => {
    const updateHistory = () => {
      const rates = getCryptoRates();
      setPriceHistory((prev) => {
        const newHistory = [...prev, { rate: rates.marketRate, time: Date.now() }];
        return newHistory.slice(-maxPoints);
      });
    };

    updateHistory();
    const interval = setInterval(updateHistory, 2000);
    return () => clearInterval(interval);
  }, [getCryptoRates]);

  useEffect(() => {
    if (!canvasRef.current || priceHistory.length < 2) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    const drawChart = () => {
      // Set canvas size based on container
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = 120;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      if (priceHistory.length < 2) return;

      // Calculate min/max for scaling
      const rates = priceHistory.map((p) => p.rate);
      const minRate = Math.min(...rates);
      const maxRate = Math.max(...rates);
      const range = maxRate - minRate || 1;
      const padding = range * 0.1;

      const scaleY = (rate) => {
        return height - ((rate - minRate + padding) / (range + padding * 2)) * height;
      };

      const stepX = width / (priceHistory.length - 1);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw price line
      ctx.strokeStyle = '#4a7c59';
      ctx.lineWidth = 2;
      ctx.beginPath();
      priceHistory.forEach((point, index) => {
        const x = index * stepX;
        const y = scaleY(point.rate);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw area under curve
      ctx.fillStyle = 'rgba(74, 124, 89, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, height);
      priceHistory.forEach((point, index) => {
        const x = index * stepX;
        const y = scaleY(point.rate);
        ctx.lineTo(x, y);
      });
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Draw current price point
      if (priceHistory.length > 0) {
        const lastPoint = priceHistory[priceHistory.length - 1];
        const x = (priceHistory.length - 1) * stepX;
        const y = scaleY(lastPoint.rate);
        ctx.fillStyle = '#4a7c59';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw min/max labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Max: ${maxRate.toFixed(1)}`, 4, 12);
      ctx.textAlign = 'right';
      ctx.fillText(`Min: ${minRate.toFixed(1)}`, width - 4, height - 4);
    };

    drawChart();

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      drawChart();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [priceHistory]);

  if (priceHistory.length < 2) {
    return (
      <div className="market__chart">
        <div className="market__chart-header">
          <span className="market__chart-title">График курса</span>
          <span className="market__chart-rate">
            {marketRate.toFixed(1)} 🪙
          </span>
        </div>
        <div className="market__chart-placeholder">
          Загрузка данных...
        </div>
      </div>
    );
  }

  return (
    <div className="market__chart">
      <div className="market__chart-header">
        <span className="market__chart-title">График курса</span>
        <span className="market__chart-rate">
          {marketRate.toFixed(1)} 🪙
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="market__chart-canvas"
      />
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useGame } from "../context/GameContext";
import { Plot, getPlotIndexFromEvent, isPlantAction } from "./Plot";

export function FarmGrid({ selectedSeedId, onPlant }) {
  const { grid, farmCols, farmRows } = useGame();
  const farmRef = useRef(null);
  const [plotSize, setPlotSize] = useState(null);

  // Вычисляем оптимальный размер квадрата на основе доступного пространства
  useEffect(() => {
    const updatePlotSize = () => {
      if (!farmRef.current) return;

      const farmElement = farmRef.current;
      const rect = farmElement.getBoundingClientRect();
      
      // Проверяем, что контейнер имеет валидные размеры
      if (rect.width === 0 || rect.height === 0) return;
      
      // Получаем доступные размеры (учитываем padding секции .farm)
      const availableWidth = rect.width;
      const farmPaddingVertical = 28; // var(--space-4) + var(--space-5)
      const availableHeight = Math.max(0, rect.height - farmPaddingVertical);

      // Получаем gap из CSS переменной
      // Сначала получаем значение --farm-gap, которое может быть var(--space-3)
      let gapValue = getComputedStyle(document.documentElement)
        .getPropertyValue('--farm-gap').trim();
      
      // Если это var(--space-3), получаем значение --space-3
      if (gapValue.startsWith('var(')) {
        const varName = gapValue.match(/var\(([^)]+)\)/)?.[1];
        if (varName) {
          gapValue = getComputedStyle(document.documentElement)
            .getPropertyValue(varName.trim()).trim();
        }
      }
      
      // Парсим значение (убираем 'px' если есть)
      const gap = parseFloat(gapValue) || 8;

      // Вычисляем максимальный размер квадрата для ширины
      const maxWidthForCols = farmCols > 0 
        ? (availableWidth - gap * (farmCols - 1)) / farmCols 
        : 0;
      
      // Вычисляем максимальный размер квадрата для высоты
      const maxHeightForRows = farmRows > 0 
        ? (availableHeight - gap * (farmRows - 1)) / farmRows 
        : 0;

      // Берем минимальное значение, чтобы все квадраты поместились
      const calculatedSize = Math.min(maxWidthForCols, maxHeightForRows);

      // Ограничиваем минимальный и максимальный размер
      const minSize = 30; // Минимальный размер квадрата
      const maxSize = 90; // Максимальный размер квадрата (из CSS)
      const finalSize = Math.round(Math.max(minSize, Math.min(maxSize, calculatedSize)));

      setPlotSize(finalSize);
    };

    // Вычисляем размер при монтировании и изменении размеров
    // Используем requestAnimationFrame для более точного расчета после рендера
    const rafId = requestAnimationFrame(() => {
      updatePlotSize();
    });

    // Обработчик изменения размера с RAF
    const handleResize = () => {
      requestAnimationFrame(updatePlotSize);
    };

    // Слушаем изменения размера окна
    const resizeObserver = new ResizeObserver(handleResize);
    
    if (farmRef.current) {
      resizeObserver.observe(farmRef.current);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [farmCols, farmRows]);

  const handleGridClick = (e) => {
    if (!selectedSeedId) return;
    if (!isPlantAction(e.target)) return;
    const index = getPlotIndexFromEvent(e);
    if (index < 0) return;
    onPlant?.(index);
  };

  // Используем вычисленный размер или CSS переменную по умолчанию
  const plotSizeStyle = plotSize !== null ? `${plotSize}px` : 'var(--farm-plot-size)';

  return (
    <section className="farm" ref={farmRef} onClick={handleGridClick}>
      <div
        className="farm__grid"
        style={{
          gridTemplateColumns: `repeat(${farmCols}, ${plotSizeStyle})`,
          gridTemplateRows: `repeat(${farmRows}, ${plotSizeStyle})`,
        }}
      >
        {grid.map((_, i) => (
          <Plot key={i} index={i} />
        ))}
      </div>
    </section>
  );
}

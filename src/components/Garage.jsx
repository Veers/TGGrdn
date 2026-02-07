import { useState, useMemo } from "react";
import { useGame } from "../context/GameContext";
import { MACHINERY_IDS } from "../data/machinery";

export function Garage({ onDeployToField }) { // onDeployToField опциональный, не используется
  const {
    garage,
    machinery,
    machineryIds,
    sellMachinery,
    maintenanceMachinery,
    maintenanceCost,
    deployMachineryToField,
    coins,
  } = useGame();

  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Собрать все единицы техники с информацией о типе
  const allUnits = useMemo(() => {
    const units = [];
    machineryIds.forEach((id) => {
      const unitsOfType = garage[id] ?? [];
      unitsOfType.forEach((unit, index) => {
        units.push({
          machineryId: id,
          unitIndex: index,
          unit,
          machinery: machinery[id],
        });
      });
    });
    return units;
  }, [garage, machinery, machineryIds]);

  // Применить фильтры
  const filteredUnits = useMemo(() => {
    return allUnits.filter((item) => {
      // Фильтр по типу
      if (filterType !== "all" && item.machineryId !== filterType) {
        return false;
      }

      // Фильтр по состоянию
      const fuel = item.unit.fuel ?? 100;
      const integrity = item.unit.integrity ?? 100;
      const needsMaintenance = fuel < 100 || integrity < 100;
      const isPerfect = fuel === 100 && integrity === 100;

      if (filterStatus === "needs_maintenance" && !needsMaintenance) {
        return false;
      }
      if (filterStatus === "perfect" && !isPerfect) {
        return false;
      }

      return true;
    });
  }, [allUnits, filterType, filterStatus]);

  const totalCount = allUnits.length;

  // Группировка по типам для фильтра
  const machineryGroups = useMemo(() => {
    const groups = { all: { name: "Все", count: totalCount } };
    machineryIds.forEach((id) => {
      const count = (garage[id] ?? []).length;
      if (count > 0) {
        groups[id] = { name: machinery[id].name, count };
      }
    });
    return groups;
  }, [garage, machinery, machineryIds, totalCount]);

  if (totalCount === 0) {
    return (
      <section className="panel garage">
        <h3 className="panel__title">Гараж</h3>
        <p className="panel__sub">Техника и транспорт</p>
        <div className="garage__empty">
          <span className="garage__icon">🚜</span>
          <p>Пока пусто. Покупайте технику в магазине.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel garage">
      <h3 className="panel__title">Гараж</h3>
      <p className="panel__sub">Ваша техника ({filteredUnits.length} из {totalCount})</p>

      {/* Фильтры */}
      <div className="garage__filters">
        <div className="garage__filter-group">
          <label className="garage__filter-label">Тип техники:</label>
          <div className="garage__filter-buttons">
            {Object.entries(machineryGroups).map(([id, { name, count }]) => (
              <button
                key={id}
                type="button"
                className={`garage__filter-btn ${filterType === id ? "garage__filter-btn--active" : ""}`}
                onClick={() => setFilterType(id)}
                title={`${name} (${count})`}
              >
                {id === "all" ? name : machinery[id]?.emoji}
                <span className="garage__filter-count">{count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="garage__filter-group">
          <label className="garage__filter-label">Состояние:</label>
          <div className="garage__filter-buttons">
            <button
              type="button"
              className={`garage__filter-btn ${filterStatus === "all" ? "garage__filter-btn--active" : ""}`}
              onClick={() => setFilterStatus("all")}
            >
              Все
            </button>
            <button
              type="button"
              className={`garage__filter-btn ${filterStatus === "needs_maintenance" ? "garage__filter-btn--active" : ""}`}
              onClick={() => setFilterStatus("needs_maintenance")}
            >
              Нужен ремонт
            </button>
            <button
              type="button"
              className={`garage__filter-btn ${filterStatus === "perfect" ? "garage__filter-btn--active" : ""}`}
              onClick={() => setFilterStatus("perfect")}
            >
              Исправна
            </button>
          </div>
        </div>
      </div>

      {/* Список единиц техники */}
      <div className="garage__list">
        {filteredUnits.length === 0 ? (
          <div className="garage__empty-filter">
            <p>Нет техники, соответствующей выбранным фильтрам</p>
          </div>
        ) : (
          filteredUnits.map((item, index) => {
            const { machineryId, unit, machinery: m } = item;
            const fuel = unit.fuel ?? 100;
            const integrity = unit.integrity ?? 100;
            const needsMaintenance = fuel < 100 || integrity < 100;
            const canMaintain = needsMaintenance && coins >= maintenanceCost;

            return (
              <div
                key={`${machineryId}-${item.unitIndex}`}
                className={`garage__unit ${needsMaintenance ? "garage__unit--needs-maintenance" : ""}`}
              >
                <span className="garage__unit-emoji">{m.emoji}</span>
                <div className="garage__unit-info">
                  <span className="garage__unit-name">{m.name}</span>
                  <div className="garage__unit-stats">
                    <div className="garage__unit-stat">
                      <span className="garage__unit-stat-label">Топливо:</span>
                      <div className="garage__unit-stat-bar">
                        <div
                          className="garage__unit-stat-fill garage__unit-stat-fill--fuel"
                          style={{ width: `${fuel}%` }}
                        />
                        <span className="garage__unit-stat-value">{Math.round(fuel)}%</span>
                      </div>
                    </div>
                    <div className="garage__unit-stat">
                      <span className="garage__unit-stat-label">Целостность:</span>
                      <div className="garage__unit-stat-bar">
                        <div
                          className="garage__unit-stat-fill garage__unit-stat-fill--integrity"
                          style={{ width: `${integrity}%` }}
                        />
                        <span className="garage__unit-stat-value">{Math.round(integrity)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="garage__unit-actions">
                  <button
                    type="button"
                    className="garage__btn garage__btn--field"
                    onClick={() => {
                      deployMachineryToField(machineryId);
                    }}
                    title="Отправить на поле"
                  >
                    На поле
                  </button>
                  <button
                    type="button"
                    className="garage__btn garage__btn--maintenance"
                    onClick={() => maintenanceMachinery(machineryId)}
                    disabled={!canMaintain}
                    title={
                      needsMaintenance
                        ? `Обслуживание (${maintenanceCost}🪙)`
                        : "Техника в отличном состоянии"
                    }
                  >
                    Ремонт
                  </button>
                  <button
                    type="button"
                    className="garage__btn garage__btn--sell"
                    onClick={() => sellMachinery(machineryId, 1)}
                    title="Продать эту единицу"
                  >
                    Продать
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

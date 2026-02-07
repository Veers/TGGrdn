/** Максимальные значения топлива и целостности для одной единицы техники */
export const MACHINERY_MAX_FUEL = 100;
export const MACHINERY_MAX_INTEGRITY = 100;

/**
 * Техника для фермы — отдельный класс, покупается в магазине и хранится в гараже.
 * Каждая единица техники — один экземпляр с параметрами: топливо (0–100), целостность (0–100).
 */
export const MACHINERY = {
  seeder: {
    id: "seeder",
    name: "Сеялка",
    emoji: "🌱",
    cost: 120,
    maxFuel: MACHINERY_MAX_FUEL,
    maxIntegrity: MACHINERY_MAX_INTEGRITY,
    description: "Посев семян",
  },
  cultivator: {
    id: "cultivator",
    name: "Культиватор",
    emoji: "🛞",
    cost: 80,
    maxFuel: MACHINERY_MAX_FUEL,
    maxIntegrity: MACHINERY_MAX_INTEGRITY,
    description: "Обработка почвы",
  },
  fertilizer_spreader: {
    id: "fertilizer_spreader",
    name: "Разбрасыватель удобрений",
    emoji: "🧪",
    cost: 100,
    maxFuel: MACHINERY_MAX_FUEL,
    maxIntegrity: MACHINERY_MAX_INTEGRITY,
    description: "Внесение удобрений",
  },
  irrigator: {
    id: "irrigator",
    name: "Дождеватель",
    emoji: "💧",
    cost: 90,
    maxFuel: MACHINERY_MAX_FUEL,
    maxIntegrity: MACHINERY_MAX_INTEGRITY,
    description: "Полив грядок",
  },
  harvester: {
    id: "harvester",
    name: "Комбайн",
    emoji: "🌾",
    cost: 350,
    maxFuel: MACHINERY_MAX_FUEL,
    maxIntegrity: MACHINERY_MAX_INTEGRITY,
    description: "Уборка урожая",
  },
  truck: {
    id: "truck",
    name: "Грузовик",
    emoji: "🚚",
    cost: 200,
    maxFuel: MACHINERY_MAX_FUEL,
    maxIntegrity: MACHINERY_MAX_INTEGRITY,
    description: "Перевозка урожая",
  },
};

export const MACHINERY_IDS = Object.keys(MACHINERY);

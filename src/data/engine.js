import { SEEDS, SEED_IDS } from "./seeds";
import { MACHINERY, MACHINERY_IDS, MACHINERY_MAX_FUEL, MACHINERY_MAX_INTEGRITY } from "./machinery";

/** Константы игры */
export const STORAGE_KEY = "farm_game_save";
export const SAVE_VERSION = 9;
export const MAX_TRADE_HISTORY = 100;
export const MAX_EARNINGS_HISTORY = 100;
/** Время сбора по умолчанию, если у культуры не задано harvestSeconds */
export const DEFAULT_HARVEST_SECONDS = 4;

export const CRYPTO_TICKER = "CRX";
export const CRYPTO_RATE_MIN = 1.5;
export const CRYPTO_RATE_MAX = 33.5;
export const CRYPTO_SPREAD = 2;
export const CRYPTO_RATE_PERIOD_MS = 45000;

export const INITIAL_COLS = 2;
export const INITIAL_ROWS = 2;

export const EXPANSIONS = [
  { cols: 2, rows: 2 },
  { cols: 2, rows: 3 },
  { cols: 3, rows: 3 },
  { cols: 3, rows: 4 },
  { cols: 4, rows: 4 },
  { cols: 4, rows: 5 },
  { cols: 5, rows: 5 },
  { cols: 5, rows: 6 },
  { cols: 6, rows: 6 },
  { cols: 6, rows: 7 },
  { cols: 7, rows: 7 },
  { cols: 7, rows: 8 },
  { cols: 8, rows: 8 },
];
export const EXPAND_COST = 80;

/** Константы тика техники */
export const GAME_TICK_INTERVAL_MS = 500;
export const SEEDER_TICK_INTERVAL = 4;
export const SEEDER_FUEL_PER_PLANT = 2;
export const SEEDER_INTEGRITY_PER_PLANT = 1;

export const CULTIVATOR_TICK_INTERVAL = 4;
export const CULTIVATOR_FUEL_PER_ACTION = 2;
export const CULTIVATOR_INTEGRITY_PER_ACTION = 1;

export const FERTILIZER_SPREADER_TICK_INTERVAL = 4;
export const FERTILIZER_SPREADER_FUEL_PER_ACTION = 2;
export const FERTILIZER_SPREADER_INTEGRITY_PER_ACTION = 1;

export const IRRIGATOR_TICK_INTERVAL = 4;
export const IRRIGATOR_FUEL_PER_ACTION = 2;
export const IRRIGATOR_INTEGRITY_PER_ACTION = 1;

export const HARVESTER_TICK_INTERVAL = 4;
export const HARVESTER_FUEL_PER_ACTION = 3;
export const HARVESTER_INTEGRITY_PER_ACTION = 2;

export const TRUCK_TICK_INTERVAL = 6;
export const TRUCK_FUEL_PER_ACTION = 1;
export const TRUCK_INTEGRITY_PER_ACTION = 1;

/** Константы обслуживания техники */
export const MAINTENANCE_COST = 10;
export const MAINTENANCE_RESTORE = 20;

/** Функции создания значений по умолчанию */
export function defaultGrid(cols = INITIAL_COLS, rows = INITIAL_ROWS) {
  return Array(cols * rows).fill(null);
}

export function defaultWarehouse() {
  return Object.fromEntries(SEED_IDS.map((id) => [id, 0]));
}

export function defaultBarn() {
  return Object.fromEntries(SEED_IDS.map((id) => [id, 0]));
}

/** Одна единица техники: топливо и целостность 0–100, время последнего действия */
export function defaultUnit() {
  return { 
    fuel: MACHINERY_MAX_FUEL, 
    integrity: MACHINERY_MAX_INTEGRITY,
    lastActionTime: null 
  };
}

export function defaultGarage() {
  return Object.fromEntries(MACHINERY_IDS.map((id) => [id, []]));
}

export function defaultDeployedMachinery() {
  return Object.fromEntries(MACHINERY_IDS.map((id) => [id, []]));
}

function normalizeUnit(u) {
  const rawFuel = Number(u?.fuel);
  const rawIntegrity = Number(u?.integrity);
  return {
    fuel: Math.min(MACHINERY_MAX_FUEL, Math.max(0, Number.isFinite(rawFuel) ? rawFuel : MACHINERY_MAX_FUEL)),
    integrity: Math.min(MACHINERY_MAX_INTEGRITY, Math.max(0, Number.isFinite(rawIntegrity) ? rawIntegrity : MACHINERY_MAX_INTEGRITY)),
    lastActionTime: u?.lastActionTime != null ? u.lastActionTime : null,
  };
}

export function migrateGarageOrDeployed(value) {
  if (!value || typeof value !== "object") return defaultGarage();
  const out = {};
  for (const id of MACHINERY_IDS) {
    const v = value[id];
    if (Array.isArray(v)) {
      out[id] = v.map(normalizeUnit);
    } else if (typeof v === "number" && v > 0) {
      out[id] = Array(v).fill(null).map(() => defaultUnit());
    } else {
      out[id] = [];
    }
  }
  return out;
}

/** Загрузка сохранения */
export function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.version !== SAVE_VERSION) return null;
    if (typeof data.coins !== "number" || typeof data.crypto !== "number")
      return null;
    if (
      !Array.isArray(data.grid) ||
      typeof data.farmCols !== "number" ||
      typeof data.farmRows !== "number"
    )
      return null;
    const cols = data.farmCols;
    const rows = data.farmRows;
    const size = cols * rows;
    let grid = data.grid;
    if (grid.length < size)
      grid = [...grid, ...Array(size - grid.length).fill(null)];
    else if (grid.length > size) grid = grid.slice(0, size);
    const warehouse =
      data.warehouse && typeof data.warehouse === "object"
        ? { ...defaultWarehouse(), ...data.warehouse }
        : defaultWarehouse();
    const barn =
      data.barn && typeof data.barn === "object"
        ? { ...defaultBarn(), ...data.barn }
        : defaultBarn();
    const garage = migrateGarageOrDeployed(data.garage);
    const deployedMachinery = migrateGarageOrDeployed(data.deployedMachinery);
    const tradeHistory = Array.isArray(data.tradeHistory) ? data.tradeHistory.slice(-MAX_TRADE_HISTORY) : [];
    const openOrders = Array.isArray(data.openOrders) ? data.openOrders : [];
    const earningsHistory = Array.isArray(data.earningsHistory) ? data.earningsHistory.slice(-MAX_EARNINGS_HISTORY) : [];
    return { ...data, warehouse, barn, garage, deployedMachinery, tradeHistory, openOrders, earningsHistory, farmCols: cols, farmRows: rows, grid };
  } catch {
    // ignore load errors
  }
  return null;
}

/** Сохранение игры */
export function saveGame(coins, grid, warehouse, barn, garage, deployedMachinery, farmCols, farmRows, crypto, tradeHistory, openOrders, earningsHistory) {
  try {
    const history = Array.isArray(tradeHistory) ? tradeHistory.slice(-MAX_TRADE_HISTORY) : [];
    const orders = Array.isArray(openOrders) ? openOrders : [];
    const earnings = Array.isArray(earningsHistory) ? earningsHistory.slice(-MAX_EARNINGS_HISTORY) : [];
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: SAVE_VERSION,
        coins,
        grid,
        warehouse,
        barn,
        garage,
        deployedMachinery,
        farmCols,
        farmRows,
        crypto,
        tradeHistory: history,
        openOrders: orders,
        earningsHistory: earnings,
      }),
    );
  } catch {
    // ignore save errors
  }
}

/** Расчёт курса в произвольный момент (для исторического графика) */
function getMarketRateAtTimestamp(timestampMs) {
  const t = Math.floor(timestampMs / CRYPTO_RATE_PERIOD_MS);
  const wave = Math.sin(t * 0.7) * 0.5 + Math.sin(t * 1.3) * 0.5; // [-1, 1]
  const center = (CRYPTO_RATE_MIN + CRYPTO_RATE_MAX) / 2;
  const halfRange = (CRYPTO_RATE_MAX - CRYPTO_RATE_MIN) / 2;
  const marketRate = Math.max(CRYPTO_RATE_MIN, Math.min(CRYPTO_RATE_MAX, center + halfRange * wave));
  return Math.round(marketRate * 10) / 10;
}

/** Расчёт курсов криптовалюты (минимум CRYPTO_RATE_MIN, максимум CRYPTO_RATE_MAX) */
export function getCryptoRates() {
  const now = Date.now();
  const marketRate = getMarketRateAtTimestamp(now);
  const buyRate = Math.round(marketRate + CRYPTO_SPREAD / 2);
  const sellRate = Math.max(1, Math.round(marketRate - CRYPTO_SPREAD / 2));
  return { buyRate, sellRate, marketRate };
}

/** Курс на момент времени (для графика истории) */
export function getCryptoRatesAt(timestampMs) {
  const marketRate = getMarketRateAtTimestamp(timestampMs);
  const buyRate = Math.round(marketRate + CRYPTO_SPREAD / 2);
  const sellRate = Math.max(1, Math.round(marketRate - CRYPTO_SPREAD / 2));
  return { buyRate, sellRate, marketRate };
}

/**
 * Тик сеялок: проверяет условия и возвращает изменения состояния
 * @param {Array} grid - сетка поля
 * @param {Object} warehouse - склад семян
 * @param {Object} deployedMachinery - техника на поле
 * @returns {Object|null} Изменения состояния или null если ничего не делать
 */
export function tickSeeders(grid, warehouse, deployedMachinery) {
  const now = Date.now();
  const actionInterval = SEEDER_TICK_INTERVAL * GAME_TICK_INTERVAL_MS;
  
  const seeders = deployedMachinery.seeder ?? [];
  const workerIndex = seeders.findIndex((u) => {
    if ((u.fuel ?? 0) <= 0 || (u.integrity ?? 0) <= 0) return false;
    const timeSinceLastAction = u.lastActionTime ? now - u.lastActionTime : Infinity;
    return timeSinceLastAction >= actionInterval;
  });
  if (workerIndex < 0) return null;
  
  const emptyIndex = grid.findIndex((c) => c === null);
  if (emptyIndex < 0) return null;
  
  const seedId = SEED_IDS.find((id) => (warehouse[id] ?? 0) > 0);
  if (!seedId) return null;
  
  return {
    plant: { plotIndex: emptyIndex, seedId },
    updateDeployedMachinery: (d) => {
      const list = [...(d.seeder ?? [])];
      const u = list[workerIndex];
      list[workerIndex] = {
        ...u,
        fuel: Math.max(0, (u.fuel ?? 0) - SEEDER_FUEL_PER_PLANT),
        integrity: Math.max(0, (u.integrity ?? 0) - SEEDER_INTEGRITY_PER_PLANT),
        lastActionTime: now,
      };
      return { ...d, seeder: list };
    },
  };
}

/**
 * Тик культиваторов: убирает сорняки с грядок
 * @param {Array} grid - сетка поля
 * @param {Object} deployedMachinery - техника на поле
 * @returns {Object|null} Изменения состояния или null если ничего не делать
 */
export function tickCultivators(grid, deployedMachinery) {
  const now = Date.now();
  const actionInterval = CULTIVATOR_TICK_INTERVAL * GAME_TICK_INTERVAL_MS;
  
  const cultivators = deployedMachinery.cultivator ?? [];
  const workerIndex = cultivators.findIndex((u) => {
    if ((u.fuel ?? 0) <= 0 || (u.integrity ?? 0) <= 0) return false;
    const timeSinceLastAction = u.lastActionTime ? now - u.lastActionTime : Infinity;
    return timeSinceLastAction >= actionInterval;
  });
  if (workerIndex < 0) return null;
  
  // Найти грядку с сорняками (нужно прополоть, но еще не прополота)
  const plotIndex = grid.findIndex((cell) => {
    if (!cell || cell.weededAt) return false;
    const seed = SEEDS[cell.seedId];
    if (!seed) return false;
    const g = seed.growthSeconds;
    const seg = g / 4;
    const t = (now - cell.plantedAt) / 1000;
    
    let effectiveElapsed;
    if (!cell.fertilizedAt) {
      effectiveElapsed = Math.min(t, seg);
    } else {
      const sinceFertilized = (now - cell.fertilizedAt) / 1000;
      effectiveElapsed = seg + Math.min(sinceFertilized, seg);
    }
    const growthProgress = Math.min(1, effectiveElapsed / g);
    return growthProgress >= 2 / 4 && !cell.weededAt;
  });
  
  if (plotIndex < 0) return null;
  
  return {
    weed: { plotIndex },
    updateDeployedMachinery: (d) => {
      const list = [...(d.cultivator ?? [])];
      const u = list[workerIndex];
      list[workerIndex] = {
        ...u,
        fuel: Math.max(0, (u.fuel ?? 0) - CULTIVATOR_FUEL_PER_ACTION),
        integrity: Math.max(0, (u.integrity ?? 0) - CULTIVATOR_INTEGRITY_PER_ACTION),
        lastActionTime: now,
      };
      return { ...d, cultivator: list };
    },
  };
}

/**
 * Тик разбрасывателей удобрений: вносит удобрения на грядки
 * @param {Array} grid - сетка поля
 * @param {Object} deployedMachinery - техника на поле
 * @returns {Object|null} Изменения состояния или null если ничего не делать
 */
export function tickFertilizerSpreaders(grid, deployedMachinery) {
  const now = Date.now();
  const actionInterval = FERTILIZER_SPREADER_TICK_INTERVAL * GAME_TICK_INTERVAL_MS;
  
  const spreaders = deployedMachinery.fertilizer_spreader ?? [];
  const workerIndex = spreaders.findIndex((u) => {
    if ((u.fuel ?? 0) <= 0 || (u.integrity ?? 0) <= 0) return false;
    const timeSinceLastAction = u.lastActionTime ? now - u.lastActionTime : Infinity;
    return timeSinceLastAction >= actionInterval;
  });
  if (workerIndex < 0) return null;
  
  // Найти грядку, которую нужно удобрить
  const plotIndex = grid.findIndex((cell) => {
    if (!cell || cell.fertilizedAt) return false;
    const seed = SEEDS[cell.seedId];
    if (!seed) return false;
    const g = seed.growthSeconds;
    const t = (now - cell.plantedAt) / 1000;
    const growthProgress = Math.min(1, t / g);
    return growthProgress >= 1 / 4 && !cell.fertilizedAt;
  });
  
  if (plotIndex < 0) return null;
  
  return {
    fertilize: { plotIndex },
    updateDeployedMachinery: (d) => {
      const list = [...(d.fertilizer_spreader ?? [])];
      const u = list[workerIndex];
      list[workerIndex] = {
        ...u,
        fuel: Math.max(0, (u.fuel ?? 0) - FERTILIZER_SPREADER_FUEL_PER_ACTION),
        integrity: Math.max(0, (u.integrity ?? 0) - FERTILIZER_SPREADER_INTEGRITY_PER_ACTION),
        lastActionTime: now,
      };
      return { ...d, fertilizer_spreader: list };
    },
  };
}

/**
 * Тик дождевателей: поливает грядки
 * @param {Array} grid - сетка поля
 * @param {Object} deployedMachinery - техника на поле
 * @returns {Object|null} Изменения состояния или null если ничего не делать
 */
export function tickIrrigators(grid, deployedMachinery) {
  const now = Date.now();
  const actionInterval = IRRIGATOR_TICK_INTERVAL * GAME_TICK_INTERVAL_MS;
  
  const irrigators = deployedMachinery.irrigator ?? [];
  const workerIndex = irrigators.findIndex((u) => {
    if ((u.fuel ?? 0) <= 0 || (u.integrity ?? 0) <= 0) return false;
    const timeSinceLastAction = u.lastActionTime ? now - u.lastActionTime : Infinity;
    return timeSinceLastAction >= actionInterval;
  });
  if (workerIndex < 0) return null;
  
  // Найти грядку, которую нужно полить
  const plotIndex = grid.findIndex((cell) => {
    if (!cell || cell.wateredAt) return false;
    const seed = SEEDS[cell.seedId];
    if (!seed) return false;
    const g = seed.growthSeconds;
    const seg = g / 4;
    const t = (now - cell.plantedAt) / 1000;
    
    let effectiveElapsed;
    if (!cell.fertilizedAt) {
      effectiveElapsed = Math.min(t, seg);
    } else if (!cell.weededAt) {
      const sinceFertilized = (now - cell.fertilizedAt) / 1000;
      effectiveElapsed = seg + Math.min(sinceFertilized, seg);
    } else {
      const sinceWeeded = (now - cell.weededAt) / 1000;
      effectiveElapsed = 2 * seg + Math.min(sinceWeeded, seg);
    }
    const growthProgress = Math.min(1, effectiveElapsed / g);
    return growthProgress >= 3 / 4 && !cell.wateredAt;
  });
  
  if (plotIndex < 0) return null;
  
  return {
    water: { plotIndex },
    updateDeployedMachinery: (d) => {
      const list = [...(d.irrigator ?? [])];
      const u = list[workerIndex];
      list[workerIndex] = {
        ...u,
        fuel: Math.max(0, (u.fuel ?? 0) - IRRIGATOR_FUEL_PER_ACTION),
        integrity: Math.max(0, (u.integrity ?? 0) - IRRIGATOR_INTEGRITY_PER_ACTION),
        lastActionTime: now,
      };
      return { ...d, irrigator: list };
    },
  };
}

/**
 * Тик комбайнов: начинает сбор урожая с готовых грядок
 * @param {Array} grid - сетка поля
 * @param {Object} deployedMachinery - техника на поле
 * @returns {Object|null} Изменения состояния или null если ничего не делать
 */
export function tickHarvesters(grid, deployedMachinery) {
  const now = Date.now();
  const actionInterval = HARVESTER_TICK_INTERVAL * GAME_TICK_INTERVAL_MS;
  
  const harvesters = deployedMachinery.harvester ?? [];
  const workerIndex = harvesters.findIndex((u) => {
    if ((u.fuel ?? 0) <= 0 || (u.integrity ?? 0) <= 0) return false;
    const timeSinceLastAction = u.lastActionTime ? now - u.lastActionTime : Infinity;
    return timeSinceLastAction >= actionInterval;
  });
  if (workerIndex < 0) return null;
  
  // Найти готовую грядку (урожай готов, но сбор еще не начат)
  const plotIndex = grid.findIndex((cell) => {
    if (!cell || cell.collectingStartedAt) return false;
    const seed = SEEDS[cell.seedId];
    if (!seed) return false;
    const g = seed.growthSeconds;
    const seg = g / 4;
    const t = (now - cell.plantedAt) / 1000;
    
    let effectiveElapsed;
    if (!cell.fertilizedAt) {
      effectiveElapsed = Math.min(t, seg);
    } else if (!cell.weededAt) {
      const sinceFertilized = (now - cell.fertilizedAt) / 1000;
      effectiveElapsed = seg + Math.min(sinceFertilized, seg);
    } else if (!cell.wateredAt) {
      const sinceWeeded = (now - cell.weededAt) / 1000;
      effectiveElapsed = 2 * seg + Math.min(sinceWeeded, seg);
    } else {
      const sinceWatered = (now - cell.wateredAt) / 1000;
      effectiveElapsed = 3 * seg + Math.min(sinceWatered, seg);
    }
    const growthProgress = Math.min(1, effectiveElapsed / g);
    return growthProgress >= 1;
  });
  
  if (plotIndex < 0) return null;
  
  return {
    startCollection: { plotIndex },
    updateDeployedMachinery: (d) => {
      const list = [...(d.harvester ?? [])];
      const u = list[workerIndex];
      list[workerIndex] = {
        ...u,
        fuel: Math.max(0, (u.fuel ?? 0) - HARVESTER_FUEL_PER_ACTION),
        integrity: Math.max(0, (u.integrity ?? 0) - HARVESTER_INTEGRITY_PER_ACTION),
        lastActionTime: now,
      };
      return { ...d, harvester: list };
    },
  };
}

/**
 * Тик грузовиков: продает урожай из амбара
 * @param {Object} barn - амбар с урожаем
 * @param {Object} deployedMachinery - техника на поле
 * @returns {Object|null} Изменения состояния или null если ничего не делать
 */
export function tickTrucks(barn, deployedMachinery) {
  const now = Date.now();
  const actionInterval = TRUCK_TICK_INTERVAL * GAME_TICK_INTERVAL_MS;
  
  const trucks = deployedMachinery.truck ?? [];
  const workerIndex = trucks.findIndex((u) => {
    if ((u.fuel ?? 0) <= 0 || (u.integrity ?? 0) <= 0) return false;
    const timeSinceLastAction = u.lastActionTime ? now - u.lastActionTime : Infinity;
    return timeSinceLastAction >= actionInterval;
  });
  if (workerIndex < 0) return null;
  
  // Найти урожай в амбаре для продажи
  const seedId = SEED_IDS.find((id) => (barn[id] ?? 0) > 0);
  if (!seedId) return null;
  
  return {
    sellFromBarn: { seedId, amount: 1 },
    updateDeployedMachinery: (d) => {
      const list = [...(d.truck ?? [])];
      const u = list[workerIndex];
      list[workerIndex] = {
        ...u,
        fuel: Math.max(0, (u.fuel ?? 0) - TRUCK_FUEL_PER_ACTION),
        integrity: Math.max(0, (u.integrity ?? 0) - TRUCK_INTEGRITY_PER_ACTION),
        lastActionTime: now,
      };
      return { ...d, truck: list };
    },
  };
}

/**
 * Вычисляет минимальное время до следующей проверки техники
 * @param {Object} deployedMachinery - техника на поле
 * @returns {number} Время в миллисекундах до следующей проверки (минимум 100мс)
 */
export function calculateNextCheckDelay(deployedMachinery) {
  const now = Date.now();
  let minDelay = Infinity;
  
  const intervals = {
    seeder: SEEDER_TICK_INTERVAL * GAME_TICK_INTERVAL_MS,
    cultivator: CULTIVATOR_TICK_INTERVAL * GAME_TICK_INTERVAL_MS,
    fertilizer_spreader: FERTILIZER_SPREADER_TICK_INTERVAL * GAME_TICK_INTERVAL_MS,
    irrigator: IRRIGATOR_TICK_INTERVAL * GAME_TICK_INTERVAL_MS,
    harvester: HARVESTER_TICK_INTERVAL * GAME_TICK_INTERVAL_MS,
    truck: TRUCK_TICK_INTERVAL * GAME_TICK_INTERVAL_MS,
  };
  
  for (const [machineryId, interval] of Object.entries(intervals)) {
    const units = deployedMachinery[machineryId] ?? [];
    for (const unit of units) {
      if ((unit.fuel ?? 0) <= 0 || (unit.integrity ?? 0) <= 0) continue;
      
      const timeSinceLastAction = unit.lastActionTime 
        ? now - unit.lastActionTime 
        : 0;
      const timeUntilNextAction = Math.max(0, interval - timeSinceLastAction);
      
      if (timeUntilNextAction < minDelay) {
        minDelay = timeUntilNextAction;
      }
    }
  }
  
  // Если нет техники или все готовы к действию, проверяем через минимальный интервал
  if (minDelay === Infinity) {
    return Math.min(...Object.values(intervals));
  }
  
  // Минимальная задержка 100мс для избежания слишком частых проверок
  return Math.max(100, minDelay);
}

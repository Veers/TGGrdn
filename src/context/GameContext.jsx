import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { SEEDS, SEED_IDS } from "../data/seeds";
import { MACHINERY, MACHINERY_IDS, MACHINERY_MAX_FUEL, MACHINERY_MAX_INTEGRITY } from "../data/machinery";
import {
  STORAGE_KEY,
  SAVE_VERSION,
  MAX_TRADE_HISTORY,
  MAX_EARNINGS_HISTORY,
  DEFAULT_HARVEST_SECONDS,
  CRYPTO_TICKER,
  INITIAL_COLS,
  INITIAL_ROWS,
  EXPANSIONS,
  EXPAND_COST,
  GAME_TICK_INTERVAL_MS,
  MAINTENANCE_COST,
  MAINTENANCE_RESTORE,
  defaultGrid,
  defaultWarehouse,
  defaultBarn,
  defaultUnit,
  defaultGarage,
  defaultDeployedMachinery,
  loadSave,
  saveGame,
  getCryptoRates,
  tickSeeders,
  tickCultivators,
  tickFertilizerSpreaders,
  tickIrrigators,
  tickHarvesters,
  tickTrucks,
} from "../data/engine";

const GameContext = createContext(null);

export function GameProvider({ children, playSound }) {
  const saved = loadSave();
  const [coins, setCoins] = useState(saved?.coins ?? 50);
  const [farmCols, setFarmCols] = useState(saved?.farmCols ?? INITIAL_COLS);
  const [farmRows, setFarmRows] = useState(saved?.farmRows ?? INITIAL_ROWS);
  const [grid, setGrid] = useState(() => {
    if (saved?.grid) return saved.grid;
    return defaultGrid(farmCols, farmRows);
  });
  const [warehouse, setWarehouse] = useState(
    saved?.warehouse ?? defaultWarehouse(),
  );
  const [barn, setBarn] = useState(saved?.barn ?? defaultBarn());
  const [garage, setGarage] = useState(saved?.garage ?? defaultGarage());
  const [deployedMachinery, setDeployedMachinery] = useState(
    saved?.deployedMachinery ?? defaultDeployedMachinery(),
  );
  const [crypto, setCrypto] = useState(saved?.crypto ?? 0);
  const [tradeHistory, setTradeHistory] = useState(saved?.tradeHistory ?? []);
  const [openOrders] = useState(saved?.openOrders ?? []);
  const [earningsHistory, setEarningsHistory] = useState(saved?.earningsHistory ?? []);
  const [tick, setTick] = useState(0);
  const prevCoinsRef = useRef(coins);

  /** Игровой таймер: тик каждые 500 мс */
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), GAME_TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // Track earnings history - use ref to avoid synchronous setState in effect
  useEffect(() => {
    const prevCoins = prevCoinsRef.current;
    prevCoinsRef.current = coins;
    
    // Only update if coins actually changed
    if (prevCoins === coins) return;
    
    // Use setTimeout to defer the update and avoid synchronous setState
    const timeoutId = setTimeout(() => {
      setEarningsHistory((prev) => {
        const last = prev[prev.length - 1];
        const now = Date.now();
        // Only add new entry if coins changed or it's been more than 30 seconds
        if (last && last.coins === coins && now - last.time < 30000) {
          return prev;
        }
        return [...prev, { coins, time: now }].slice(-MAX_EARNINGS_HISTORY);
      });
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [coins]);

  useEffect(() => {
    saveGame(coins, grid, warehouse, barn, garage, deployedMachinery, farmCols, farmRows, crypto, tradeHistory, openOrders, earningsHistory);
  }, [coins, grid, warehouse, barn, garage, deployedMachinery, farmCols, farmRows, crypto, tradeHistory, openOrders, earningsHistory]);

  const buySeeds = useCallback(
    (seedId, count = 1) => {
      if (!SEEDS[seedId] || count < 1) return false;
      const cost = SEEDS[seedId].cost * count;
      if (coins < cost) return false;
      setCoins((c) => c - cost);
      setWarehouse((w) => ({ ...w, [seedId]: (w[seedId] ?? 0) + count }));
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
      playSound?.("buy");
      return true;
    },
    [coins, playSound],
  );

  const buyMachinery = useCallback(
    (machineryId, count = 1) => {
      if (!MACHINERY[machineryId] || count < 1) return false;
      const cost = MACHINERY[machineryId].cost * count;
      if (coins < cost) return false;
      setCoins((c) => c - cost);
      const newUnits = Array(count).fill(null).map(() => defaultUnit());
      setGarage((g) => ({
        ...g,
        [machineryId]: [...(g[machineryId] ?? []), ...newUnits],
      }));
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
      playSound?.("buy");
      return true;
    },
    [coins, playSound],
  );

  const sellMachinery = useCallback(
    (machineryId, count = 1) => {
      if (!MACHINERY[machineryId] || count < 1) return false;
      const units = garage[machineryId] ?? [];
      if (units.length < count) return false;
      const refund = Math.floor(MACHINERY[machineryId].cost * 0.5) * count;
      setGarage((g) => ({
        ...g,
        [machineryId]: (g[machineryId] ?? []).slice(0, -count),
      }));
      setCoins((c) => c + refund);
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
      playSound?.("sell");
      return true;
    },
    [garage, playSound],
  );

  const maintenanceMachinery = useCallback(
    (machineryId) => {
      if (!MACHINERY[machineryId]) return false;
      const units = garage[machineryId] ?? [];
      
      // Подсчитать количество единиц техники, которые нужно обслужить
      const needsMaintenance = units.filter(
        (u) => (u.fuel ?? 0) < MACHINERY_MAX_FUEL || (u.integrity ?? 0) < MACHINERY_MAX_INTEGRITY
      );
      
      if (needsMaintenance.length === 0) return false;
      
      // Стоимость обслуживания = базовая стоимость * количество единиц техники
      const totalCost = MAINTENANCE_COST * needsMaintenance.length;
      if (coins < totalCost) return false;
      
      setCoins((c) => c - totalCost);
      setGarage((g) => {
        const list = [...(g[machineryId] ?? [])];
        // Восстановить все единицы техники до максимума
        const updatedList = list.map((u) => ({
          ...u,
          fuel: MACHINERY_MAX_FUEL,
          integrity: MACHINERY_MAX_INTEGRITY,
        }));
        return { ...g, [machineryId]: updatedList };
      });
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("medium");
      playSound?.("buy");
      return true;
    },
    [garage, coins, playSound],
  );

  const deployMachineryToField = useCallback((machineryId) => {
    if (!MACHINERY[machineryId]) return false;
    const units = garage[machineryId] ?? [];
    if (units.length < 1) return false;
    const [unit, ...rest] = units;
    setGarage((g) => ({ ...g, [machineryId]: rest }));
    setDeployedMachinery((d) => ({ ...d, [machineryId]: [...(d[machineryId] ?? []), unit] }));
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
    return true;
  }, [garage]);

  const returnMachineryFromField = useCallback((machineryId) => {
    if (!MACHINERY[machineryId]) return false;
    const deployed = deployedMachinery[machineryId] ?? [];
    if (deployed.length < 1) return false;
    const unit = deployed[deployed.length - 1];
    setDeployedMachinery((d) => ({ ...d, [machineryId]: (d[machineryId] ?? []).slice(0, -1) }));
    setGarage((g) => ({ ...g, [machineryId]: [...(g[machineryId] ?? []), unit] }));
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
    return true;
  }, [deployedMachinery]);

  const getMachineryUnitStats = useCallback((units) => {
    const list = Array.isArray(units) ? units : [];
    const n = list.length;
    if (!n) return { count: 0, avgFuel: 0, avgIntegrity: 0 };
    const avgFuel = list.reduce((s, u) => s + (u?.fuel ?? 0), 0) / n;
    const avgIntegrity = list.reduce((s, u) => s + (u?.integrity ?? 0), 0) / n;
    return { count: n, avgFuel, avgIntegrity };
  }, []);

  const plant = useCallback(
    (plotIndex, seedId) => {
      if (!SEEDS[seedId] || (warehouse[seedId] ?? 0) < 1) return false;
      setGrid((prev) => {
        const next = [...prev];
        if (next[plotIndex] !== null) return prev;
        next[plotIndex] = { seedId, plantedAt: Date.now() };
        return next;
      });
      setWarehouse((w) => ({
        ...w,
        [seedId]: Math.max(0, (w[seedId] ?? 0) - 1),
      }));
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
      playSound?.("plant");
      return true;
    },
    [warehouse, playSound],
  );

  /** Тик техники: сеялки на поле сажают семена с склада в пустые клетки, расходуют топливо и целостность */
  useEffect(() => {
    const result = tickSeeders(tick, grid, warehouse, deployedMachinery);
    if (!result) return;
    
    // Check if we can plant (warehouse has seeds and plot is empty)
    const { plotIndex, seedId } = result.plant;
    if (!SEEDS[seedId] || (warehouse[seedId] ?? 0) < 1) return;
    
    // Capture values to avoid stale closures
    const capturedPlotIndex = plotIndex;
    const capturedSeedId = seedId;
    const capturedUpdateDeployedMachinery = result.updateDeployedMachinery;
    
    // Defer state updates to avoid synchronous setState in effect
    const timeoutId = setTimeout(() => {
      // Use functional updates to batch state changes and avoid cascading renders
      setGrid((prev) => {
        const next = [...prev];
        if (next[capturedPlotIndex] !== null) return prev; // Plot already occupied
        next[capturedPlotIndex] = { seedId: capturedSeedId, plantedAt: Date.now() };
        return next;
      });
      
      setWarehouse((w) => ({
        ...w,
        [capturedSeedId]: Math.max(0, (w[capturedSeedId] ?? 0) - 1),
      }));
      
      setDeployedMachinery(capturedUpdateDeployedMachinery);
      
      // Play sound effect
      playSound?.("plant");
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [tick, grid, warehouse, deployedMachinery, playSound]);

  /** Тик техники: культиваторы убирают сорняки с грядок */
  useEffect(() => {
    const result = tickCultivators(tick, grid, deployedMachinery);
    if (!result) return;
    
    const { plotIndex } = result.weed;
    const cell = grid[plotIndex];
    if (!cell || cell.weededAt) return;
    
    const capturedPlotIndex = plotIndex;
    const capturedUpdateDeployedMachinery = result.updateDeployedMachinery;
    
    const timeoutId = setTimeout(() => {
      setGrid((prev) => {
        const next = [...prev];
        if (!next[capturedPlotIndex] || next[capturedPlotIndex].weededAt) return prev;
        next[capturedPlotIndex] = { ...next[capturedPlotIndex], weededAt: Date.now() };
        return next;
      });
      
      setDeployedMachinery(capturedUpdateDeployedMachinery);
      playSound?.("weed");
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [tick, grid, deployedMachinery, playSound]);

  /** Тик техники: разбрасыватели удобрений вносят удобрения на грядки */
  useEffect(() => {
    const result = tickFertilizerSpreaders(tick, grid, deployedMachinery);
    if (!result) return;
    
    const { plotIndex } = result.fertilize;
    const cell = grid[plotIndex];
    if (!cell || cell.fertilizedAt) return;
    
    const capturedPlotIndex = plotIndex;
    const capturedUpdateDeployedMachinery = result.updateDeployedMachinery;
    
    const timeoutId = setTimeout(() => {
      setGrid((prev) => {
        const next = [...prev];
        if (!next[capturedPlotIndex] || next[capturedPlotIndex].fertilizedAt) return prev;
        next[capturedPlotIndex] = { ...next[capturedPlotIndex], fertilizedAt: Date.now() };
        return next;
      });
      
      setDeployedMachinery(capturedUpdateDeployedMachinery);
      playSound?.("fertilize");
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [tick, grid, deployedMachinery, playSound]);

  /** Тик техники: дождеватели поливают грядки */
  useEffect(() => {
    const result = tickIrrigators(tick, grid, deployedMachinery);
    if (!result) return;
    
    const { plotIndex } = result.water;
    const cell = grid[plotIndex];
    if (!cell || cell.wateredAt) return;
    
    const capturedPlotIndex = plotIndex;
    const capturedUpdateDeployedMachinery = result.updateDeployedMachinery;
    
    const timeoutId = setTimeout(() => {
      setGrid((prev) => {
        const next = [...prev];
        if (!next[capturedPlotIndex] || next[capturedPlotIndex].wateredAt) return prev;
        next[capturedPlotIndex] = { ...next[capturedPlotIndex], wateredAt: Date.now() };
        return next;
      });
      
      setDeployedMachinery(capturedUpdateDeployedMachinery);
      playSound?.("water");
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [tick, grid, deployedMachinery, playSound]);

  /** Тик техники: комбайны начинают сбор урожая с готовых грядок */
  useEffect(() => {
    const result = tickHarvesters(tick, grid, deployedMachinery);
    if (!result) return;
    
    const { plotIndex } = result.startCollection;
    const cell = grid[plotIndex];
    if (!cell || cell.collectingStartedAt) return;
    
    const seed = SEEDS[cell.seedId];
    if (!seed) return;
    const elapsed = (Date.now() - cell.plantedAt) / 1000;
    if (elapsed < seed.growthSeconds) return;
    
    const capturedPlotIndex = plotIndex;
    const capturedUpdateDeployedMachinery = result.updateDeployedMachinery;
    
    const timeoutId = setTimeout(() => {
      setGrid((prev) => {
        const next = [...prev];
        if (!next[capturedPlotIndex] || next[capturedPlotIndex].collectingStartedAt) return prev;
        next[capturedPlotIndex] = {
          ...next[capturedPlotIndex],
          collectingStartedAt: Date.now(),
        };
        return next;
      });
      
      setDeployedMachinery(capturedUpdateDeployedMachinery);
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [tick, grid, deployedMachinery]);

  /** Тик техники: грузовики продают урожай из амбара */
  useEffect(() => {
    const result = tickTrucks(tick, barn, deployedMachinery);
    if (!result) return;
    
    const { seedId, amount } = result.sellFromBarn;
    if (!SEEDS[seedId] || (barn[seedId] ?? 0) < 1) return;
    
    const capturedSeedId = seedId;
    const capturedAmount = amount;
    const capturedUpdateDeployedMachinery = result.updateDeployedMachinery;
    
    const timeoutId = setTimeout(() => {
      const qty = barn[capturedSeedId] ?? 0;
      if (qty < 1) return;
      const toSell = Math.min(qty, Math.max(1, Math.floor(capturedAmount)));
      if (toSell < 1) return;
      
      const gain = SEEDS[capturedSeedId].sellPrice * toSell;
      setBarn((b) => ({ ...b, [capturedSeedId]: (b[capturedSeedId] ?? 0) - toSell }));
      setCoins((c) => c + gain);
      setDeployedMachinery(capturedUpdateDeployedMachinery);
      playSound?.("sell");
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [tick, barn, deployedMachinery, playSound]);

  const clearWeeds = useCallback((plotIndex) => {
    const cell = grid[plotIndex];
    if (!cell || cell.weededAt) return;
    setGrid((prev) => {
      const next = [...prev];
      next[plotIndex] = { ...next[plotIndex], weededAt: Date.now() };
      return next;
    });
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
    playSound?.("weed");
  }, [grid, playSound]);

  const fertilize = useCallback((plotIndex) => {
    const cell = grid[plotIndex];
    if (!cell || cell.fertilizedAt) return;
    setGrid((prev) => {
      const next = [...prev];
      next[plotIndex] = { ...next[plotIndex], fertilizedAt: Date.now() };
      return next;
    });
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
    playSound?.("fertilize");
  }, [grid, playSound]);

  const water = useCallback((plotIndex) => {
    const cell = grid[plotIndex];
    if (!cell || cell.wateredAt) return;
    setGrid((prev) => {
      const next = [...prev];
      next[plotIndex] = { ...next[plotIndex], wateredAt: Date.now() };
      return next;
    });
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
    playSound?.("water");
  }, [grid, playSound]);

  const startCollection = useCallback(
    (plotIndex) => {
      const cell = grid[plotIndex];
      if (!cell || cell.collectingStartedAt) return;
      const seed = SEEDS[cell.seedId];
      const elapsed = (Date.now() - cell.plantedAt) / 1000;
      if (elapsed < seed.growthSeconds) return;
      setGrid((prev) => {
        const next = [...prev];
        next[plotIndex] = {
          ...next[plotIndex],
          collectingStartedAt: Date.now(),
        };
        return next;
      });
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
    },
    [grid],
  );

  const harvest = useCallback(
    (plotIndex) => {
      const cell = grid[plotIndex];
      if (!cell) return;
      const seed = SEEDS[cell.seedId];
      const elapsed = (Date.now() - cell.plantedAt) / 1000;
      if (elapsed < seed.growthSeconds) return;
      const harvestSeconds = seed.harvestSeconds ?? DEFAULT_HARVEST_SECONDS;
      const collectingStartedAt =
        cell.collectingStartedAt ?? cell.plantedAt + seed.growthSeconds * 1000;
      const collectionElapsed = (Date.now() - collectingStartedAt) / 1000;
      if (collectionElapsed < harvestSeconds) return;
      setGrid((prev) => {
        const next = [...prev];
        next[plotIndex] = null;
        return next;
      });
      setBarn((b) => ({ ...b, [cell.seedId]: (b[cell.seedId] ?? 0) + 1 }));
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("medium");
      playSound?.("harvest");
    },
    [grid, playSound],
  );

  const sellFromBarn = useCallback(
    (seedId, amount = null) => {
      if (!SEEDS[seedId]) return false;
      const qty = barn[seedId] ?? 0;
      if (qty < 1) return false;
      const toSell =
        amount == null ? qty : Math.min(qty, Math.max(1, Math.floor(amount)));
      if (toSell < 1) return false;
      const gain = SEEDS[seedId].sellPrice * toSell;
      setBarn((b) => ({ ...b, [seedId]: (b[seedId] ?? 0) - toSell }));
      setCoins((c) => c + gain);
      // Track earnings
      setEarningsHistory((prev) => [...prev, { coins: coins + gain, time: Date.now() }].slice(-MAX_EARNINGS_HISTORY));
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
      playSound?.("sell");
      return true;
    },
    [barn, coins, playSound],
  );

  const sellAllFromBarn = useCallback(() => {
    let total = 0;
    const updates = { ...barn };
    let hasAny = false;
    SEED_IDS.forEach((id) => {
      const qty = updates[id] ?? 0;
      if (qty > 0) {
        total += SEEDS[id].sellPrice * qty;
        updates[id] = 0;
        hasAny = true;
      }
    });
    if (!hasAny) return;
    setBarn(updates);
    setCoins((c) => c + total);
    // Track earnings
      setEarningsHistory((prev) => [...prev, { coins: coins + total, time: Date.now() }].slice(-MAX_EARNINGS_HISTORY));
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("medium");
      playSound?.("sell");
  }, [barn, coins, playSound]);

  const getPlotState = useCallback(
    (plotIndex) => {
      const cell = grid[plotIndex];
      if (!cell) return { empty: true };
      const seed = SEEDS[cell.seedId];
      const g = seed.growthSeconds;
      const seg = g / 4; // четыре четверти: 1/4 удобрить, 1/4 прополоть, 1/4 полить, 1/4 рост
      const t = (Date.now() - cell.plantedAt) / 1000;

      let effectiveElapsed;
      if (!cell.fertilizedAt) {
        effectiveElapsed = Math.min(t, seg);
      } else if (!cell.weededAt) {
        const sinceFertilized = (Date.now() - cell.fertilizedAt) / 1000;
        effectiveElapsed = seg + Math.min(sinceFertilized, seg);
      } else if (!cell.wateredAt) {
        const sinceWeeded = (Date.now() - cell.weededAt) / 1000;
        effectiveElapsed = 2 * seg + Math.min(sinceWeeded, seg);
      } else {
        const sinceWatered = (Date.now() - cell.wateredAt) / 1000;
        effectiveElapsed = 3 * seg + Math.min(sinceWatered, seg);
      }
      const growthProgress = Math.min(1, effectiveElapsed / g);
      const ready = growthProgress >= 1;
      const remainingSeconds = ready
        ? 0
        : Math.max(0, Math.ceil(g - effectiveElapsed));

      const harvestSeconds = seed.harvestSeconds ?? DEFAULT_HARVEST_SECONDS;
      const collectingStartedAt = cell.collectingStartedAt;
      const collectionElapsed =
        collectingStartedAt != null
          ? (Date.now() - collectingStartedAt) / 1000
          : 0;
      const collectionProgress = Math.min(
        1,
        collectionElapsed / harvestSeconds,
      );
      const collectionRemainingSeconds = Math.max(
        0,
        Math.ceil(harvestSeconds - collectionElapsed),
      );
      const collectionComplete =
        collectingStartedAt != null && collectionElapsed >= harvestSeconds;

      let phase = "growing";
      if (ready && !collectingStartedAt) phase = "ready";
      else if (collectingStartedAt != null && !collectionComplete)
        phase = "collecting";
      else if (collectionComplete) phase = "collectionComplete";

      // 1/4 — удобрить, 1/4 — прополоть, 1/4 — полить, 1/4 — рост до готовности
      const needsFertilizing = growthProgress >= 1 / 4 && !cell.fertilizedAt;
      const needsWeeding = growthProgress >= 2 / 4 && !cell.weededAt;
      const needsWatering = growthProgress >= 3 / 4 && !cell.wateredAt;

      return {
        empty: false,
        seedId: cell.seedId,
        seed,
        progress: growthProgress,
        ready,
        remainingSeconds,
        phase,
        collectionProgress,
        collectionRemainingSeconds,
        collectionComplete,
        needsWeeding,
        needsFertilizing,
        needsWatering,
        weededAt: cell.weededAt ?? null,
        fertilizedAt: cell.fertilizedAt ?? null,
        wateredAt: cell.wateredAt ?? null,
      };
    },
    [grid],
  );

  const farmLevel = useMemo(() => {
    const idx = EXPANSIONS.findIndex(
      (e) => e.cols === farmCols && e.rows === farmRows,
    );
    return idx >= 0 ? idx : 0;
  }, [farmCols, farmRows]);

  const canExpand = farmLevel < EXPANSIONS.length - 1;
  const expandCost = EXPAND_COST * (farmLevel + 1);

  const expandFarm = useCallback(() => {
    if (!canExpand || coins < expandCost) return false;
    const next = EXPANSIONS[farmLevel + 1];
    const newSize = next.cols * next.rows;
    setGrid((prev) => [
      ...prev,
      ...Array(Math.max(0, newSize - prev.length)).fill(null),
    ]);
    setFarmCols(next.cols);
    setFarmRows(next.rows);
    setCoins((c) => c - expandCost);
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("medium");
    playSound?.("expand");
    return true;
  }, [farmLevel, canExpand, coins, expandCost, playSound]);

  const buyCrypto = useCallback(
    (coinsAmount) => {
      const { buyRate } = getCryptoRates();
      const crxAmount = Math.floor(coinsAmount / buyRate);
      if (crxAmount < 1 || coins < coinsAmount) return false;
      setCoins((c) => c - coinsAmount);
      setCrypto((cr) => cr + crxAmount);
      setTradeHistory((h) =>
        [...h, { id: Date.now(), type: "buy", amount: crxAmount, rate: buyRate, total: coinsAmount, createdAt: Date.now() }].slice(-MAX_TRADE_HISTORY),
      );
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
      playSound?.("buy");
      return true;
    },
    [coins, playSound],
  );

  const sellCrypto = useCallback(
    (crxAmount) => {
      const { sellRate } = getCryptoRates();
      if (crxAmount < 1 || (crypto ?? 0) < crxAmount) return false;
      const coinsGain = crxAmount * sellRate;
      setCrypto((cr) => cr - crxAmount);
      setCoins((c) => c + coinsGain);
      setTradeHistory((h) =>
        [...h, { id: Date.now(), type: "sell", amount: crxAmount, rate: sellRate, total: coinsGain, createdAt: Date.now() }].slice(-MAX_TRADE_HISTORY),
      );
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");
      playSound?.("sell");
      return true;
    },
    [crypto, playSound],
  );

  const value = useMemo(
    () => ({
      tick,
      coins,
      crypto,
      grid,
      farmCols,
      farmRows,
      warehouse,
      barn,
      garage,
      deployedMachinery,
      tradeHistory,
      openOrders,
      earningsHistory,
      seeds: SEEDS,
      seedIds: SEED_IDS,
      machinery: MACHINERY,
      machineryIds: MACHINERY_IDS,
      buySeeds,
      buyMachinery,
      sellMachinery,
      maintenanceMachinery,
      maintenanceCost: MAINTENANCE_COST,
      deployMachineryToField,
      returnMachineryFromField,
      getMachineryUnitStats,
      plant,
      clearWeeds,
      fertilize,
      water,
      startCollection,
      harvest,
      sellFromBarn,
      sellAllFromBarn,
      getPlotState,
      farmLevel,
      canExpand,
      expandCost,
      expandFarm,
      CRYPTO_TICKER,
      getCryptoRates,
      buyCrypto,
      sellCrypto,
    }),
    [
      tick,
      coins,
      crypto,
      grid,
      farmCols,
      farmRows,
      warehouse,
      barn,
      garage,
      deployedMachinery,
      tradeHistory,
      openOrders,
      earningsHistory,
      buySeeds,
      buyMachinery,
      sellMachinery,
      maintenanceMachinery,
      deployMachineryToField,
      returnMachineryFromField,
      getMachineryUnitStats,
      plant,
      clearWeeds,
      fertilize,
      water,
      startCollection,
      harvest,
      sellFromBarn,
      sellAllFromBarn,
      getPlotState,
      farmLevel,
      canExpand,
      expandCost,
      expandFarm,
      buyCrypto,
      sellCrypto,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}

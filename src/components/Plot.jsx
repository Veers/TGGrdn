import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { usePhysicsEffect } from "../context/PhysicsEffectContext";

export function Plot({ index }) {
  const plotRef = useRef(null);
  const { getPlotState, startCollection, harvest, clearWeeds, fertilize, water } = useGame();
  const physicsApi = usePhysicsEffect();
  const state = getPlotState(index);

  const handleClick = () => {
    if (state.empty) return; // planting is handled by parent with selected seed
    if (state.phase === "ready") startCollection(index);
  };

  const handleWeed = (e) => {
    e.stopPropagation();
    clearWeeds(index);
  };

  const handleFertilize = (e) => {
    e.stopPropagation();
    fertilize(index);
  };

  const handleWater = (e) => {
    e.stopPropagation();
    water(index);
  };

  useEffect(() => {
    if (state.phase === "collectionComplete") {
      const rect = plotRef.current?.getBoundingClientRect();
      if (rect && physicsApi?.current?.spawnHarvestBurst && state.seed) {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        physicsApi.current.spawnHarvestBurst(cx, cy, state.seed.emoji);
      }
      harvest(index);
    }
  }, [state.phase, state.seed, index, harvest, physicsApi]);

  if (state.empty) {
    return (
      <motion.div
        ref={plotRef}
        className="plot plot--empty"
        data-index={index}
        data-action="plant"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span className="plot__placeholder" aria-hidden="true">+</span>
      </motion.div>
    );
  }

  const {
    seed,
    progress,
    ready,
    remainingSeconds,
    phase,
    collectionProgress,
    collectionRemainingSeconds,
    needsWeeding,
    needsFertilizing,
    needsWatering,
  } = state;
  const isCollecting = phase === "collecting";
  const hasCareActions = phase === "growing" && (needsWeeding || needsFertilizing || needsWatering);

  const plotProps = {
    className: `plot ${ready ? "plot--ready" : "plot--growing"} ${isCollecting ? "plot--collecting" : ""} ${needsWeeding ? "plot--weeds" : ""} ${needsFertilizing && !needsWeeding ? "plot--need-fertilize" : ""} ${needsWatering ? "plot--need-water" : ""}`,
    "data-index": index,
    ...(ready && !isCollecting
      ? {
          role: "button",
          tabIndex: 0,
          onClick: handleClick,
          onKeyDown: (e) => (e.key === "Enter" || e.key === " ") && handleClick(e),
        }
      : isCollecting
        ? { "aria-busy": true }
        : {}),
  };

  return (
    <motion.div
      ref={plotRef}
      {...plotProps}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span className="plot__crop" title={seed?.name} aria-hidden="true">
        {seed?.emoji}
      </span>
      {phase === "growing" && (
        <>
          <div className="plot__progress" style={{ "--progress": progress }} />
          {hasCareActions && (
            <div className="plot__actions" onClick={(e) => e.stopPropagation()}>
              {needsWeeding && (
                <button
                  type="button"
                  className="plot__action plot__action--weed"
                  onClick={handleWeed}
                  title="Убрать сорняки"
                  aria-label="Прополоть"
                >
                  🌿 Прополоть
                </button>
              )}
              {needsFertilizing && (
                <button
                  type="button"
                  className="plot__action plot__action--fertilize"
                  onClick={handleFertilize}
                  title="Удобрить"
                  aria-label="Удобрить"
                >
                  🧪 Удобрить
                </button>
              )}
              {needsWatering && (
                <button
                  type="button"
                  className="plot__action plot__action--water"
                  onClick={handleWater}
                  title="Полить"
                  aria-label="Полить"
                >
                  💧 Полить
                </button>
              )}
            </div>
          )}
        </>
      )}
      {isCollecting && (
        <>
          <div
            className="plot__progress plot__progress--collecting"
            style={{ "--progress": collectionProgress }}
          />
        </>
      )}
    </motion.div>
  );
}

// Helper: parent will use this to know which plot was clicked for planting
export function getPlotIndexFromEvent(e) {
  const el = e.target.closest("[data-index]");
  return el ? parseInt(el.dataset.index, 10) : -1;
}

export function isPlantAction(el) {
  return el?.closest('[data-action="plant"]');
}

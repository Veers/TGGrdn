import { useEffect, useRef } from "react";
import Matter from "matter-js";

const HARVEST_BURST_COUNT = 4;
const HARVEST_BURST_RADIUS = 12;
const HARVEST_BURST_IMPULSE = 0.018;
const BODY_REMOVE_MS = 2500;

function createEngineAndWorld(containerEl) {
  const width = containerEl.offsetWidth || 400;
  const height = containerEl.offsetHeight || 400;
  const engine = Matter.Engine.create({ gravity: { x: 0, y: 0.4 } });
  const world = engine.world;
  const render = Matter.Render.create({
    element: containerEl,
    engine,
    options: {
      width,
      height,
      wireframes: false,
      background: "transparent",
      pixelRatio: Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1),
    },
  });
  Matter.Render.run(render);
  const runner = Matter.Runner.create();
  Matter.Runner.run(runner, engine);
  return { engine, world, render, runner };
}

export function PhysicsEffectLayer({ effectApiRef }) {
  const containerRef = useRef(null);
  const worldRef = useRef(null);
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const renderRef = useRef(null);
  const toRemoveRef = useRef([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const { engine, world, render, runner } = createEngineAndWorld(el);
    engineRef.current = engine;
    worldRef.current = world;
    runnerRef.current = runner;
    renderRef.current = render;

    const spawnHarvestBurst = (screenX, screenY, emoji = "🌾") => {
      const rect = el.getBoundingClientRect();
      const wx = screenX - rect.left;
      const wy = screenY - rect.top;
      const bodies = [];
      for (let i = 0; i < HARVEST_BURST_COUNT; i++) {
        const body = Matter.Bodies.circle(
          wx + (Math.random() - 0.5) * 20,
          wy + (Math.random() - 0.5) * 20,
          HARVEST_BURST_RADIUS,
          {
            restitution: 0.4,
            friction: 0.01,
            render: {
              fillStyle: "#8B7355",
              strokeStyle: "#6B5344",
              lineWidth: 1,
            },
          },
        );
        Matter.Body.applyForce(
          body,
          { x: body.position.x, y: body.position.y },
          {
            x: (Math.random() - 0.5) * HARVEST_BURST_IMPULSE,
            y: -HARVEST_BURST_IMPULSE * (1.2 + Math.random() * 0.6),
          },
        );
        Matter.World.add(world, body);
        bodies.push(body);
      }
      toRemoveRef.current.push(...bodies);
      setTimeout(() => {
        bodies.forEach((b) => {
          Matter.World.remove(world, b);
        });
        toRemoveRef.current = toRemoveRef.current.filter((b) => !bodies.includes(b));
      }, BODY_REMOVE_MS);
    };

    const spawnCoins = (screenX, screenY, count = 5) => {
      const rect = el.getBoundingClientRect();
      const wx = screenX - rect.left;
      const wy = screenY - rect.top;
      const bodies = [];
      const n = Math.min(12, Math.max(3, count));
      for (let i = 0; i < n; i++) {
        const body = Matter.Bodies.circle(
          wx + (Math.random() - 0.5) * 24,
          wy + (Math.random() - 0.5) * 24,
          8,
          {
            restitution: 0.3,
            friction: 0.01,
            render: {
              fillStyle: "#FFD700",
              strokeStyle: "#B8860B",
              lineWidth: 1,
            },
          },
        );
        Matter.Body.applyForce(
          body,
          { x: body.position.x, y: body.position.y },
          {
            x: (Math.random() - 0.5) * 0.015,
            y: -0.02 * (0.8 + Math.random() * 0.4),
          },
        );
        Matter.World.add(world, body);
        bodies.push(body);
      }
      toRemoveRef.current.push(...bodies);
      setTimeout(() => {
        bodies.forEach((b) => Matter.World.remove(world, b));
        toRemoveRef.current = toRemoveRef.current.filter((b) => !bodies.includes(b));
      }, BODY_REMOVE_MS);
    };

    if (effectApiRef) {
      effectApiRef.current = { spawnHarvestBurst, spawnCoins };
    }

    return () => {
      if (effectApiRef) effectApiRef.current = null;
      toRemoveRef.current.forEach((b) => Matter.World.remove(world, b));
      toRemoveRef.current = [];
      Matter.Runner.stop(runner);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      if (render.canvas && render.canvas.parentNode) {
        render.canvas.parentNode.removeChild(render.canvas);
      }
      engineRef.current = null;
      worldRef.current = null;
      runnerRef.current = null;
      renderRef.current = null;
    };
  }, [effectApiRef]);

  return (
    <div
      ref={containerRef}
      className="physics-effect-layer"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
      aria-hidden
    />
  );
}

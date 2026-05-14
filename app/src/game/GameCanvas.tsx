import { useRef, useEffect, useCallback } from "react";
import { GameState, GameConfig } from "./entities";
import { render } from "./renderer";
import { update } from "./gameLoop";
import { GameSprites } from "./sprites";

interface GameCanvasProps {
  state: GameState;
  config: GameConfig;
  sprites: GameSprites;
  onScoreChange: (score: number) => void;
  onTroopCountChange: (count: number) => void;
  onGameOver: () => void;
}

export default function GameCanvas({
  state,
  config,
  sprites,
  onScoreChange,
  onTroopCountChange,
  onGameOver,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const prevPhaseRef = useRef(state.phase);

  const loop = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const dt = lastTimeRef.current
        ? Math.min((time - lastTimeRef.current) / 1000, 0.05)
        : 0.016;
      lastTimeRef.current = time;

      update(state, config, dt, canvas.width, canvas.height, time / 1000);
      render(ctx, state, sprites, canvas.width, canvas.height);

      onScoreChange(state.score);
      onTroopCountChange(state.troopCount);

      if (state.phase === "gameover" && prevPhaseRef.current === "playing") {
        onGameOver();
      }
      prevPhaseRef.current = state.phase;

      rafRef.current = requestAnimationFrame(loop);
    },
    [state, config, sprites, onScoreChange, onTroopCountChange, onGameOver]
  );

  useEffect(() => {
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [loop]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: "none" }}
    />
  );
}

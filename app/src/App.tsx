import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { loadKeyValueCsv } from "./data/loadData";
import { GameState, GameConfig, createInitialState, resetForPlay } from "./game/entities";
import GameCanvas from "./game/GameCanvas";
import HUD from "./components/HUD";
import LaneButtons from "./components/LaneButtons";
import MenuScreen from "./components/MenuScreen";
import GameOverScreen from "./components/GameOverScreen";

function parseNum(map: Map<string, string>, key: string, fallback: number): number {
  const val = map.get(key);
  if (!val) return fallback;
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
}

async function loadGameConfig(): Promise<GameConfig> {
  const [cfg, gates, enemies] = await Promise.all([
    loadKeyValueCsv("config.csv"),
    loadKeyValueCsv("gates.csv"),
    loadKeyValueCsv("enemies.csv"),
  ]);

  return {
    startTroops: parseNum(cfg, "start_troops", 5),
    maxTroops: parseNum(cfg, "max_troops", 50),
    baseSpeed: parseNum(cfg, "base_speed", 120),
    speedIncreasePer100m: parseNum(cfg, "speed_increase_per_100m", 5),
    maxSpeed: parseNum(cfg, "max_speed", 300),
    troopFireRate: parseNum(cfg, "troop_fire_rate", 2),
    bulletDamage: parseNum(cfg, "bullet_damage", 1),
    bulletSpeed: parseNum(cfg, "bullet_speed", 400),
    gateSpacingMin: parseNum(gates, "gate_spacing_min", 400),
    gateSpacingMax: parseNum(gates, "gate_spacing_max", 700),
    goodValueMin: parseNum(gates, "good_value_min", 3),
    goodValueMax: parseNum(gates, "good_value_max", 10),
    badValueMin: parseNum(gates, "bad_value_min", -8),
    badValueMax: parseNum(gates, "bad_value_max", -1),
    multiplierChance: parseNum(gates, "multiplier_chance", 0.1),
    multiplierValue: parseNum(gates, "multiplier_value", 2),
    enemyBaseHp: parseNum(enemies, "enemy_base_hp", 1),
    enemySpeed: parseNum(enemies, "enemy_speed", 60),
    waveSizeBase: parseNum(enemies, "wave_size_base", 3),
    waveSizeGrowthPer100m: parseNum(enemies, "wave_size_growth_per_100m", 1),
    waveSpacingMin: parseNum(enemies, "wave_spacing_min", 200),
    waveSpacingMax: parseNum(enemies, "wave_spacing_max", 400),
  };
}

export default function App() {
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [score, setScore] = useState(0);
  const [troopCount, setTroopCount] = useState(0);
  const [phase, setPhase] = useState<"menu" | "playing" | "gameover">("menu");
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const stateRef = useRef<GameState | null>(null);

  useEffect(() => {
    loadGameConfig()
      .then((cfg) => {
        setConfig(cfg);
        const state = createInitialState(cfg);
        stateRef.current = state;
        setTroopCount(cfg.startTroops);
      })
      .catch(console.error);
  }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    let rafId = 0;
    const update = () => {
      const vv = window.visualViewport;
      const w = vv?.width ?? window.innerWidth;
      const h = vv?.height ?? window.innerHeight;
      const maxW =
        parseFloat(getComputedStyle(root).getPropertyValue("--app-max-width")) || 400;
      const maxH =
        parseFloat(getComputedStyle(root).getPropertyValue("--app-max-height")) || 800;
      root.style.setProperty("--app-height", `${Math.round(h)}px`);
      root.style.setProperty("--game-width", `${Math.round(Math.min(w, maxW))}px`);
      root.style.setProperty("--game-height", `${Math.min(Math.round(h), maxH)}px`);
    };
    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        update();
      });
    };
    update();
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!stateRef.current) return;
      if (e.key === "ArrowUp") {
        stateRef.current.playerLane = "top";
      } else if (e.key === "ArrowDown") {
        stateRef.current.playerLane = "bottom";
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleStart = useCallback(() => {
    if (!stateRef.current || !config) return;
    resetForPlay(stateRef.current, config);
    setPhase("playing");
    setScore(0);
    setTroopCount(config.startTroops);
    setIsNewHighScore(false);
  }, [config]);

  const handleGameOver = useCallback(() => {
    if (!stateRef.current) return;
    setPhase("gameover");
    setIsNewHighScore(stateRef.current.score > (stateRef.current.highScore - stateRef.current.score >= 0 ? 0 : Infinity));
    const prevHigh = parseInt(localStorage.getItem("troop_rush_highscore") || "0", 10);
    setIsNewHighScore(stateRef.current.score >= prevHigh && stateRef.current.score > 0);
  }, []);

  const handleLaneChange = useCallback((lane: "top" | "bottom") => {
    if (stateRef.current) {
      stateRef.current.playerLane = lane;
    }
  }, []);

  if (!config || !stateRef.current) {
    return (
      <div className="app-shell relative mx-auto flex w-full flex-col overflow-hidden">
        <div className="game-screen flex items-center justify-center">
          <p className="ink-soft">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell relative mx-auto flex w-full flex-col overflow-hidden">
      <div className="game-screen">
        <GameCanvas
          state={stateRef.current}
          config={config}
          onScoreChange={setScore}
          onTroopCountChange={setTroopCount}
          onGameOver={handleGameOver}
        />

        {phase === "playing" && (
          <>
            <HUD score={score} troopCount={troopCount} />
            <LaneButtons
              currentLane={stateRef.current.playerLane}
              onLaneChange={handleLaneChange}
            />
          </>
        )}

        {phase === "menu" && (
          <MenuScreen
            highScore={stateRef.current.highScore}
            onStart={handleStart}
          />
        )}

        {phase === "gameover" && (
          <GameOverScreen
            score={score}
            highScore={stateRef.current.highScore}
            isNewHighScore={isNewHighScore}
            onRestart={handleStart}
          />
        )}
      </div>
    </div>
  );
}

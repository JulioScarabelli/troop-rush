export interface Troop {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}

export interface Enemy {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
}

export interface Gate {
  x: number;
  topValue: number;
  bottomValue: number;
  topLabel: string;
  bottomLabel: string;
  passed: boolean;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export type GamePhase = "menu" | "playing" | "gameover";

export interface GameConfig {
  startTroops: number;
  maxTroops: number;
  baseSpeed: number;
  speedIncreasePer100m: number;
  maxSpeed: number;
  troopFireRate: number;
  bulletDamage: number;
  bulletSpeed: number;
  gateSpacingMin: number;
  gateSpacingMax: number;
  goodValueMin: number;
  goodValueMax: number;
  badValueMin: number;
  badValueMax: number;
  multiplierChance: number;
  multiplierValue: number;
  enemyBaseHp: number;
  enemySpeed: number;
  waveSizeBase: number;
  waveSizeGrowthPer100m: number;
  waveSpacingMin: number;
  waveSpacingMax: number;
}

export interface GameState {
  phase: GamePhase;
  score: number;
  troopCount: number;
  troops: Troop[];
  enemies: Enemy[];
  bullets: Bullet[];
  gates: Gate[];
  floatingTexts: FloatingText[];
  playerLane: "top" | "bottom";
  playerY: number;
  worldX: number;
  speed: number;
  nextGateX: number;
  nextWaveX: number;
  lastShotTime: number;
  highScore: number;
}

export function createInitialState(config: GameConfig): GameState {
  const highScore = parseInt(localStorage.getItem("troop_rush_highscore") || "0", 10);
  return {
    phase: "menu",
    score: 0,
    troopCount: config.startTroops,
    troops: [],
    enemies: [],
    bullets: [],
    gates: [],
    floatingTexts: [],
    playerLane: "bottom",
    playerY: 0,
    worldX: 0,
    speed: config.baseSpeed,
    nextGateX: 500,
    nextWaveX: 300,
    lastShotTime: 0,
    highScore,
  };
}

export function resetForPlay(state: GameState, config: GameConfig): void {
  state.phase = "playing";
  state.score = 0;
  state.troopCount = config.startTroops;
  state.troops = [];
  state.enemies = [];
  state.bullets = [];
  state.gates = [];
  state.floatingTexts = [];
  state.playerLane = "bottom";
  state.playerY = 0;
  state.worldX = 0;
  state.speed = config.baseSpeed;
  state.nextGateX = 500;
  state.nextWaveX = 300;
  state.lastShotTime = 0;
  syncTroopPositions(state, 0, 0);
}

export function syncTroopPositions(state: GameState, baseX: number, baseY: number): void {
  while (state.troops.length < state.troopCount) {
    state.troops.push({
      x: 0,
      y: 0,
      offsetX: (Math.random() - 0.5) * 40,
      offsetY: (Math.random() - 0.5) * 30,
    });
  }
  while (state.troops.length > state.troopCount) {
    state.troops.pop();
  }
  for (const t of state.troops) {
    t.x = baseX + t.offsetX;
    t.y = baseY + t.offsetY;
  }
}

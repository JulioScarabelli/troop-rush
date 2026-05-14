export interface Troop {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  variant: number;
}

export type EnemyKind = "snake" | "toad" | "wasp" | "komodo";

export interface Enemy {
  x: number;
  y: number;
  lanePos: number;
  hp: number;
  maxHp: number;
  speed: number;
  kind: EnemyKind;
}

export interface Bullet {
  sx: number;
  sy: number;
  vx: number;
  vy: number;
  speed: number;
  damage: number;
}

export type GateOp = "add" | "multiply" | "divide";

export interface GateChoice {
  value: number;
  label: string;
  op: GateOp;
}

export interface Gate {
  y: number;
  left: GateChoice;
  right: GateChoice;
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

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
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
  particles: Particle[];
  playerLane: "left" | "right";
  playerX: number;
  worldY: number;
  speed: number;
  nextGateY: number;
  nextWaveY: number;
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
    particles: [],
    playerLane: "left",
    playerX: 0,
    worldY: 0,
    speed: config.baseSpeed,
    nextGateY: 500,
    nextWaveY: 300,
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
  state.particles = [];
  state.playerLane = "left";
  state.playerX = 0;
  state.worldY = 0;
  state.speed = config.baseSpeed;
  state.nextGateY = 500;
  state.nextWaveY = 300;
  state.lastShotTime = 0;
  syncTroopPositions(state, 0, 0);
}

export function syncTroopPositions(state: GameState, baseX: number, baseY: number): void {
  while (state.troops.length < state.troopCount) {
    const isLeader = state.troops.length === 0;
    state.troops.push({
      x: 0,
      y: 0,
      offsetX: isLeader ? 0 : (Math.random() - 0.5) * 120,
      offsetY: isLeader ? 0 : -20 - Math.random() * 100,
      variant: isLeader ? 0 : Math.floor(Math.random() * 4),
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

export function spawnParticles(
  state: GameState,
  x: number,
  y: number,
  color: string,
  count: number,
  speed: number
): void {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = speed * (0.3 + Math.random() * 0.7);
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life: 0.4 + Math.random() * 0.4,
      maxLife: 0.8,
      size: 2 + Math.random() * 3,
      color,
    });
  }
}

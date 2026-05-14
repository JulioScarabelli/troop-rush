import { GameState, GameConfig, Gate, GateChoice, Enemy, EnemyKind } from "./entities";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function makeGoodChoice(): GateChoice {
  const roll = Math.random();
  if (roll < 0.35) {
    const v = randInt(2, 3);
    return { value: v, label: `x${v}`, op: "multiply" };
  } else if (roll < 0.55) {
    const v = randInt(3, 8);
    return { value: v, label: `+${v}`, op: "add" };
  } else {
    const v = randInt(5, 15);
    return { value: v, label: `+${v}`, op: "add" };
  }
}

function makeBadChoice(): GateChoice {
  const roll = Math.random();
  if (roll < 0.3) {
    return { value: 2, label: `÷2`, op: "divide" };
  } else {
    const v = randInt(1, 4);
    return { value: -v, label: `-${v}`, op: "add" };
  }
}

export function spawnGates(state: GameState, config: GameConfig): void {
  if (state.worldY < state.nextGateY) return;

  const good = makeGoodChoice();
  const bad = makeBadChoice();
  const goodOnLeft = Math.random() < 0.5;

  const gate: Gate = {
    y: state.worldY + 600,
    left: goodOnLeft ? good : bad,
    right: goodOnLeft ? bad : good,
    passed: false,
  };

  state.gates.push(gate);
  state.nextGateY = state.worldY + randFloat(config.gateSpacingMin, config.gateSpacingMax);
}

export function spawnEnemies(state: GameState, config: GameConfig, canvasW: number): void {
  if (state.worldY < state.nextWaveY) return;

  const distanceFactor = state.worldY / 100;
  const waveSize = Math.floor(config.waveSizeBase + distanceFactor * config.waveSizeGrowthPer100m);

  const spawnY = state.worldY + 580;
  const playLeft = canvasW * 0.1;
  const playRight = canvasW * 0.9;

  const kinds: EnemyKind[] = ["snake", "toad", "wasp"];
  for (let i = 0; i < waveSize; i++) {
    const lanePos = 0.1 + Math.random() * 0.8;
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const enemy: Enemy = {
      x: playLeft + lanePos * (playRight - playLeft),
      y: spawnY + Math.random() * 80,
      lanePos,
      hp: config.enemyBaseHp,
      maxHp: config.enemyBaseHp,
      speed: config.enemySpeed,
      kind,
    };
    state.enemies.push(enemy);
  }

  state.nextWaveY = state.worldY + randFloat(config.waveSpacingMin, config.waveSpacingMax);
}

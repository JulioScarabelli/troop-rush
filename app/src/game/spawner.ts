import { GameState, GameConfig, Gate, Enemy } from "./entities";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function spawnGates(state: GameState, config: GameConfig, canvasH: number): void {
  if (state.worldX < state.nextGateX) return;

  let goodVal: number;
  let goodLabel: string;
  if (Math.random() < config.multiplierChance) {
    goodVal = config.multiplierValue;
    goodLabel = `x${goodVal}`;
  } else {
    goodVal = randInt(config.goodValueMin, config.goodValueMax);
    goodLabel = `+${goodVal}`;
  }

  const badVal = randInt(config.badValueMin, config.badValueMax);
  const badLabel = `${badVal}`;

  const goodOnTop = Math.random() < 0.5;

  const gate: Gate = {
    x: state.worldX + 400,
    topValue: goodOnTop ? goodVal : badVal,
    bottomValue: goodOnTop ? badVal : goodVal,
    topLabel: goodOnTop ? goodLabel : badLabel,
    bottomLabel: goodOnTop ? badLabel : goodLabel,
    passed: false,
  };

  state.gates.push(gate);
  state.nextGateX = state.worldX + 400 + randFloat(config.gateSpacingMin, config.gateSpacingMax);
}

export function spawnEnemies(state: GameState, config: GameConfig, canvasH: number): void {
  if (state.worldX < state.nextWaveX) return;

  const distanceFactor = state.worldX / 100;
  const waveSize = Math.floor(config.waveSizeBase + distanceFactor * config.waveSizeGrowthPer100m);

  const spawnX = state.worldX + 450;
  const halfH = canvasH / 2;

  for (let i = 0; i < waveSize; i++) {
    const lane = Math.random() < 0.5 ? -1 : 1;
    const enemy: Enemy = {
      x: spawnX + Math.random() * 60,
      y: halfH + lane * (30 + Math.random() * (halfH * 0.5)),
      hp: config.enemyBaseHp,
      maxHp: config.enemyBaseHp,
      speed: config.enemySpeed,
    };
    state.enemies.push(enemy);
  }

  state.nextWaveX = state.worldX + randFloat(config.waveSpacingMin, config.waveSpacingMax);
}

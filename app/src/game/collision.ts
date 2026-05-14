import { GameState, GameConfig, spawnParticles } from "./entities";
import { worldToScreenY, perspectiveX, PLAYER_SCREEN_Y_RATIO } from "./gameLoop";

function addFloatingText(
  state: GameState,
  x: number,
  y: number,
  text: string,
  color: string
): void {
  state.floatingTexts.push({ x, y, text, color, life: 1.2, maxLife: 1.2 });
}

function isGoodChoice(op: string, value: number): boolean {
  if (op === "multiply") return true;
  if (op === "divide") return false;
  return value > 0;
}

export function processGateCollisions(
  state: GameState,
  config: GameConfig,
  canvasH: number
): void {
  const playerScreenY = canvasH * PLAYER_SCREEN_Y_RATIO;

  for (const gate of state.gates) {
    if (gate.passed) continue;
    const gateDist = gate.y - state.worldY;
    if (gateDist <= 5) {
      gate.passed = true;
      const choice = state.playerLane === "left" ? gate.left : gate.right;

      let newCount = state.troopCount;
      let color: string;

      switch (choice.op) {
        case "multiply":
          newCount = state.troopCount * choice.value;
          color = "#fbbf24";
          break;
        case "divide":
          newCount = Math.floor(state.troopCount / choice.value);
          color = "#ef4444";
          break;
        case "add":
          newCount = state.troopCount + choice.value;
          color = isGoodChoice(choice.op, choice.value) ? "#22c55e" : "#ef4444";
          break;
      }

      state.troopCount = Math.min(Math.max(newCount, 1), config.maxTroops);
      addFloatingText(state, state.playerX, gate.y, choice.label, color);

      const good = isGoodChoice(choice.op, choice.value);
      const gateScreenYForParticles = worldToScreenY(gate.y, state, canvasH);
      spawnParticles(
        state, state.playerX, gateScreenYForParticles,
        good ? "#22c55e" : "#ef4444",
        good ? 20 : 8, good ? 150 : 80
      );
    }
  }
}

export function processBulletCollisions(
  state: GameState,
  canvasH: number,
  canvasW?: number
): void {
  const bulletsToRemove: number[] = [];
  const enemiesToRemove: number[] = [];
  const cw = canvasW || 400;

  for (let bi = 0; bi < state.bullets.length; bi++) {
    const bullet = state.bullets[bi];
    for (let ei = 0; ei < state.enemies.length; ei++) {
      if (enemiesToRemove.includes(ei)) continue;
      const enemy = state.enemies[ei];
      const enemyScreenY = worldToScreenY(enemy.y, state, canvasH);
      const enemyScreenX = perspectiveX(enemy.lanePos, enemyScreenY, cw, canvasH);
      const dx = bullet.sx - enemyScreenX;
      const dy = bullet.sy - enemyScreenY;
      if (Math.sqrt(dx * dx + dy * dy) < 18) {
        enemy.hp -= bullet.damage;
        bulletsToRemove.push(bi);
        spawnParticles(state, bullet.sx, bullet.sy, "#fbbf24", 3, 60);
        if (enemy.hp <= 0) {
          enemiesToRemove.push(ei);
          addFloatingText(state, enemyScreenX, enemy.y, "-1", "#ef4444");
          spawnParticles(state, enemyScreenX, enemyScreenY, "#ef4444", 12, 120);
        }
        break;
      }
    }
  }

  for (let i = bulletsToRemove.length - 1; i >= 0; i--) {
    state.bullets.splice(bulletsToRemove[i], 1);
  }
  for (let i = enemiesToRemove.length - 1; i >= 0; i--) {
    state.enemies.splice(enemiesToRemove[i], 1);
  }
}

export function processTroopEnemyCollisions(
  state: GameState,
  canvasH: number,
  canvasW?: number
): void {
  const playerScreenY = canvasH * PLAYER_SCREEN_Y_RATIO;
  const cw = canvasW || 400;
  const enemiesToRemove: number[] = [];

  for (let i = 0; i < state.enemies.length; i++) {
    const enemy = state.enemies[i];
    const enemyDist = enemy.y - state.worldY;
    if (enemyDist <= 10) {
      const enemyScreenY = worldToScreenY(enemy.y, state, canvasH);
      const enemyScreenX = perspectiveX(enemy.lanePos, enemyScreenY, cw, canvasH);
      enemiesToRemove.push(i);
      state.troopCount = Math.max(state.troopCount - 1, 0);
      addFloatingText(state, enemyScreenX, enemy.y, "-1", "#f97316");
      spawnParticles(state, enemyScreenX, enemyScreenY, "#f97316", 8, 100);
    }
  }
  for (let i = enemiesToRemove.length - 1; i >= 0; i--) {
    state.enemies.splice(enemiesToRemove[i], 1);
  }
}

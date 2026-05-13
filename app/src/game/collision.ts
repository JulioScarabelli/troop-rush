import { GameState, GameConfig, FloatingText } from "./entities";

function addFloatingText(
  state: GameState,
  x: number,
  y: number,
  text: string,
  color: string
): void {
  state.floatingTexts.push({ x, y, text, color, life: 1.0, maxLife: 1.0 });
}

export function processGateCollisions(
  state: GameState,
  config: GameConfig,
  playerScreenX: number
): void {
  for (const gate of state.gates) {
    if (gate.passed) continue;
    const gateScreenX = gate.x - state.worldX;
    if (playerScreenX >= gateScreenX - 10) {
      gate.passed = true;
      const value = state.playerLane === "top" ? gate.topValue : gate.bottomValue;
      const label = state.playerLane === "top" ? gate.topLabel : gate.bottomLabel;

      if (label.startsWith("x")) {
        const mult = value;
        const added = state.troopCount * (mult - 1);
        state.troopCount = Math.min(state.troopCount * mult, config.maxTroops);
        addFloatingText(state, gate.x, state.playerY, `x${mult}`, "#fbbf24");
      } else {
        state.troopCount = Math.min(
          Math.max(state.troopCount + value, 0),
          config.maxTroops
        );
        const color = value >= 0 ? "#22c55e" : "#ef4444";
        addFloatingText(state, gate.x, state.playerY, label, color);
      }
    }
  }
}

export function processBulletCollisions(state: GameState): void {
  const bulletsToRemove: number[] = [];
  const enemiesToRemove: number[] = [];

  for (let bi = 0; bi < state.bullets.length; bi++) {
    const bullet = state.bullets[bi];
    for (let ei = 0; ei < state.enemies.length; ei++) {
      if (enemiesToRemove.includes(ei)) continue;
      const enemy = state.enemies[ei];
      const dx = bullet.x - enemy.x;
      const dy = bullet.y - enemy.y;
      if (Math.sqrt(dx * dx + dy * dy) < 18) {
        enemy.hp -= bullet.damage;
        bulletsToRemove.push(bi);
        if (enemy.hp <= 0) {
          enemiesToRemove.push(ei);
          addFloatingText(state, enemy.x, enemy.y, "-1", "#ef4444");
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
  playerScreenX: number
): void {
  const enemiesToRemove: number[] = [];
  for (let i = 0; i < state.enemies.length; i++) {
    const enemy = state.enemies[i];
    const enemyScreenX = enemy.x - state.worldX;
    if (enemyScreenX <= playerScreenX + 30) {
      enemiesToRemove.push(i);
      state.troopCount = Math.max(state.troopCount - 1, 0);
      addFloatingText(state, enemy.x, enemy.y, "-1", "#f97316");
    }
  }
  for (let i = enemiesToRemove.length - 1; i >= 0; i--) {
    state.enemies.splice(enemiesToRemove[i], 1);
  }
}

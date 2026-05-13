import { GameState, GameConfig, syncTroopPositions, Bullet } from "./entities";
import { spawnGates, spawnEnemies } from "./spawner";
import {
  processGateCollisions,
  processBulletCollisions,
  processTroopEnemyCollisions,
} from "./collision";

const PLAYER_SCREEN_X = 80;

export function update(
  state: GameState,
  config: GameConfig,
  dt: number,
  canvasW: number,
  canvasH: number,
  time: number
): void {
  if (state.phase !== "playing") return;

  const playTop = canvasH * 0.15;
  const playBot = canvasH * 0.85;
  const playH = playBot - playTop;
  const topLaneY = playTop + playH * 0.25;
  const botLaneY = playTop + playH * 0.75;
  const targetY = state.playerLane === "top" ? topLaneY : botLaneY;

  state.playerY += (targetY - state.playerY) * Math.min(1, dt * 8);

  state.speed = Math.min(
    config.baseSpeed + (state.worldX / 100) * config.speedIncreasePer100m,
    config.maxSpeed
  );
  state.worldX += state.speed * dt;
  state.score = Math.floor(state.worldX / 10);

  spawnGates(state, config, canvasH);
  spawnEnemies(state, config, canvasH);

  for (const enemy of state.enemies) {
    enemy.x -= enemy.speed * dt;
  }

  if (state.troopCount > 0 && state.enemies.length > 0) {
    const shotInterval = 1 / config.troopFireRate;
    if (time - state.lastShotTime >= shotInterval) {
      state.lastShotTime = time;

      let nearest = state.enemies[0];
      let nearestDist = Infinity;
      for (const e of state.enemies) {
        const d = e.x - state.worldX;
        if (d > 0 && d < nearestDist) {
          nearestDist = d;
          nearest = e;
        }
      }

      if (nearest) {
        const bulletStartX = state.worldX + PLAYER_SCREEN_X + 20;
        const dx = nearest.x - bulletStartX;
        const dy = nearest.y - state.playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const bullet: Bullet = {
            x: bulletStartX,
            y: state.playerY,
            vx: (dx / dist) * config.bulletSpeed,
            vy: (dy / dist) * config.bulletSpeed,
            damage: config.bulletDamage,
          };
          state.bullets.push(bullet);
        }
      }
    }
  }

  for (const bullet of state.bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
  }

  state.bullets = state.bullets.filter((b) => {
    const screenX = b.x - state.worldX;
    return screenX > -20 && screenX < canvasW + 50 && b.y > -20 && b.y < canvasH + 20;
  });

  processGateCollisions(state, config, PLAYER_SCREEN_X);
  processBulletCollisions(state);
  processTroopEnemyCollisions(state, PLAYER_SCREEN_X);

  state.gates = state.gates.filter((g) => g.x - state.worldX > -100);
  state.enemies = state.enemies.filter((e) => e.x - state.worldX > -50);

  for (const ft of state.floatingTexts) {
    ft.life -= dt;
  }
  state.floatingTexts = state.floatingTexts.filter((ft) => ft.life > 0);

  syncTroopPositions(state, state.worldX + PLAYER_SCREEN_X, state.playerY);

  if (state.troopCount <= 0) {
    state.phase = "gameover";
    if (state.score > state.highScore) {
      state.highScore = state.score;
      localStorage.setItem("troop_rush_highscore", String(state.score));
    }
  }
}

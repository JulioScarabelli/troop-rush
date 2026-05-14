import { GameState, GameConfig, syncTroopPositions } from "./entities";
import { spawnGates, spawnEnemies } from "./spawner";
import {
  processGateCollisions,
  processBulletCollisions,
  processTroopEnemyCollisions,
} from "./collision";

export const PLAYER_SCREEN_Y_RATIO = 0.82;
export const VANISH_Y_RATIO = 0.12;
export const ROAD_WIDTH_BOTTOM = 0.88;
export const ROAD_WIDTH_TOP = 0.08;

export function worldToScreenY(worldEntityY: number, state: GameState, canvasH: number): number {
  const vanishY = canvasH * VANISH_Y_RATIO;
  const playerScreenY = canvasH * PLAYER_SCREEN_Y_RATIO;
  const aheadRange = playerScreenY - vanishY;
  const behindRange = canvasH - playerScreenY;

  const worldDist = worldEntityY - state.worldY;
  const viewDepthAhead = 700;
  const viewDepthBehind = 200;

  if (worldDist >= 0) {
    const t = Math.min(1, worldDist / viewDepthAhead);
    const curved = Math.pow(t, 0.55);
    return playerScreenY - curved * aheadRange;
  } else {
    const t = Math.max(-1, worldDist / viewDepthBehind);
    return playerScreenY - t * behindRange;
  }
}

export function depthScale(screenY: number, canvasH: number): number {
  const vanishY = canvasH * VANISH_Y_RATIO;
  const playerY = canvasH * PLAYER_SCREEN_Y_RATIO;
  // Things below player (screenY > playerY) are even closer — scale capped at 1.2
  if (screenY > playerY) {
    const extra = (screenY - playerY) / (canvasH - playerY);
    return Math.min(1.2, 1 + extra * 0.2);
  }
  const t = Math.max(0, Math.min(1, (screenY - vanishY) / (playerY - vanishY)));
  return t;
}

export function perspectiveX(
  lanePos: number,
  screenY: number,
  canvasW: number,
  canvasH: number
): number {
  const scale = depthScale(screenY, canvasH);
  const roadW = canvasW * (ROAD_WIDTH_TOP + (ROAD_WIDTH_BOTTOM - ROAD_WIDTH_TOP) * scale);
  const roadL = (canvasW - roadW) / 2;
  return roadL + lanePos * roadW;
}

export function roadEdgesAtY(
  screenY: number,
  canvasW: number,
  canvasH: number
): { left: number; right: number } {
  const scale = depthScale(screenY, canvasH);
  const roadW = canvasW * (ROAD_WIDTH_TOP + (ROAD_WIDTH_BOTTOM - ROAD_WIDTH_TOP) * scale);
  const roadL = (canvasW - roadW) / 2;
  return { left: roadL, right: roadL + roadW };
}

export function update(
  state: GameState,
  config: GameConfig,
  dt: number,
  canvasW: number,
  canvasH: number,
  time: number
): void {
  if (state.phase !== "playing") return;

  const playerScreenY = canvasH * PLAYER_SCREEN_Y_RATIO;
  const targetLanePos = state.playerLane === "left" ? 0.25 : 0.75;
  const targetX = perspectiveX(targetLanePos, playerScreenY, canvasW, canvasH);

  state.playerX += (targetX - state.playerX) * Math.min(1, dt * 10);

  state.speed = Math.min(
    config.baseSpeed + (state.worldY / 100) * config.speedIncreasePer100m,
    config.maxSpeed
  );
  state.worldY += state.speed * dt;
  state.score = Math.floor(state.worldY / 10);

  spawnGates(state, config);
  spawnEnemies(state, config, canvasW);

  // Enemies move toward the player (increasing worldY means forward,
  // but enemies move *down* the screen by decreasing their world Y)
  for (const enemy of state.enemies) {
    enemy.y -= enemy.speed * dt;
  }

  // Shooting — troops fire at enemies that are ahead (higher world Y)
  if (state.troopCount > 0 && state.enemies.length > 0) {
    const shotInterval = 1 / config.troopFireRate;
    if (time - state.lastShotTime >= shotInterval) {
      state.lastShotTime = time;

      const playerWorldY = state.worldY;
      const shooters = Math.min(state.troopCount, state.enemies.length);

      const sortedEnemies = [...state.enemies]
        .map((e) => ({ enemy: e, dist: e.y - playerWorldY }))
        .filter((e) => e.dist > 0)
        .sort((a, b) => a.dist - b.dist);

      for (let i = 0; i < shooters && i < sortedEnemies.length; i++) {
        const troop = state.troops[i % state.troops.length];
        if (!troop) continue;
        const target = sortedEnemies[i % sortedEnemies.length].enemy;

        const troopLane = state.playerLane === "left"
          ? 0.25 + (troop.offsetX / 120) * 0.35
          : 0.75 + (troop.offsetX / 120) * 0.35;
        const troopSY = worldToScreenY(troop.y, state, canvasH);
        const troopSX = perspectiveX(troopLane, troopSY, canvasW, canvasH);

        const enemySY = worldToScreenY(target.y, state, canvasH);
        const enemySX = perspectiveX(target.lanePos, enemySY, canvasW, canvasH);

        // Aim straight at the enemy
        const dx = enemySX - troopSX;
        const dy = enemySY - troopSY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          state.bullets.push({
            sx: troopSX,
            sy: troopSY,
            vx: (dx / dist) * config.bulletSpeed,
            vy: (dy / dist) * config.bulletSpeed,
            speed: config.bulletSpeed,
            damage: config.bulletDamage,
          });
        }
      }
    }
  }

  for (const bullet of state.bullets) {
    bullet.sx += bullet.vx * dt;
    bullet.sy += bullet.vy * dt;
  }

  state.bullets = state.bullets.filter((b) =>
    b.sx > -20 && b.sx < canvasW + 20 && b.sy > -50 && b.sy < canvasH + 20
  );

  // Collisions
  processGateCollisions(state, config, canvasH);
  processBulletCollisions(state, canvasH, canvasW);
  processTroopEnemyCollisions(state, canvasH, canvasW);

  // Clean up entities that have scrolled past the player
  state.gates = state.gates.filter((g) => g.y > state.worldY - 200);
  state.enemies = state.enemies.filter((e) => e.y > state.worldY - 100);

  for (const ft of state.floatingTexts) {
    ft.life -= dt;
  }
  state.floatingTexts = state.floatingTexts.filter((ft) => ft.life > 0);

  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 200 * dt;
    p.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);

  syncTroopPositions(state, state.playerX, state.worldY);

  if (state.troopCount <= 0) {
    state.phase = "gameover";
    if (state.score > state.highScore) {
      state.highScore = state.score;
      localStorage.setItem("troop_rush_highscore", String(state.score));
    }
  }
}

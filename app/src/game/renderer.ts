import { GameState, GateChoice } from "./entities";
import {
  PLAYER_SCREEN_Y_RATIO,
  VANISH_Y_RATIO,
  worldToScreenY,
  depthScale,
  perspectiveX,
  roadEdgesAtY,
} from "./gameLoop";
import { GameSprites, Sprite } from "./sprites";

export function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  sprites: GameSprites,
  canvasW: number,
  canvasH: number
): void {
  ctx.clearRect(0, 0, canvasW, canvasH);

  drawBackground(ctx, state, sprites, canvasW, canvasH);
  drawRoad(ctx, state, sprites, canvasW, canvasH);
  drawGates(ctx, state, sprites, canvasW, canvasH);
  drawParticles(ctx, state);
  drawEnemiesSorted(ctx, state, sprites, canvasW, canvasH);
  drawBullets(ctx, state, sprites, canvasH);
  drawTroopsSorted(ctx, state, sprites, canvasW, canvasH);
  drawFloatingTexts(ctx, state, canvasH);
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  _state: GameState,
  sprites: GameSprites,
  w: number,
  h: number
): void {
  // Forest sky / canopy across the top
  const vanishY = h * VANISH_Y_RATIO;
  ctx.drawImage(sprites.bgSky, 0, 0, w, vanishY + 60);

  // Forest floor stretched across the bottom to fill the side areas
  ctx.drawImage(sprites.bgFloor, 0, vanishY, w, h - vanishY);

  // Soft horizon haze where sky meets ground
  const haze = ctx.createLinearGradient(0, vanishY - 30, 0, vanishY + 60);
  haze.addColorStop(0, "transparent");
  haze.addColorStop(0.5, "rgba(120, 160, 100, 0.4)");
  haze.addColorStop(1, "transparent");
  ctx.fillStyle = haze;
  ctx.fillRect(0, vanishY - 30, w, 90);
}

function drawRoad(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  _sprites: GameSprites,
  w: number,
  h: number
): void {
  const vanishY = h * VANISH_Y_RATIO;
  const bottomY = h;

  const topEdges = roadEdgesAtY(vanishY, w, h);
  const botEdges = roadEdgesAtY(bottomY, w, h);

  // Solid dirt road trapezoid with depth gradient
  const dirtGrad = ctx.createLinearGradient(0, vanishY, 0, bottomY);
  dirtGrad.addColorStop(0, "#5e3a1a");
  dirtGrad.addColorStop(0.4, "#7a4d22");
  dirtGrad.addColorStop(1, "#8a5a2a");
  ctx.fillStyle = dirtGrad;
  ctx.beginPath();
  ctx.moveTo(topEdges.left, vanishY);
  ctx.lineTo(topEdges.right, vanishY);
  ctx.lineTo(botEdges.right, bottomY);
  ctx.lineTo(botEdges.left, bottomY);
  ctx.closePath();
  ctx.fill();

  // Subtle scrolling tire/foot tracks (two parallel darker strips)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(topEdges.left, vanishY);
  ctx.lineTo(topEdges.right, vanishY);
  ctx.lineTo(botEdges.right, bottomY);
  ctx.lineTo(botEdges.left, bottomY);
  ctx.closePath();
  ctx.clip();

  // Two perspective tracks on either side of center
  for (const side of [-1, 1]) {
    ctx.beginPath();
    const tTop = perspectiveX(0.5 + side * 0.18, vanishY, w, h);
    const tBot = perspectiveX(0.5 + side * 0.18, bottomY, w, h);
    ctx.moveTo(tTop, vanishY);
    ctx.lineTo(tBot, bottomY);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(70, 40, 15, 0.35)";
    ctx.stroke();
  }

  // Scrolling cross marks for motion (small ticks that move with the road)
  const marks = 40;
  for (let i = 0; i < marks; i++) {
    const worldDist = (i / marks) * 700;
    const offset = state.worldY % (700 / marks);
    const adjusted = worldDist - offset;
    if (adjusted < 0) continue;
    const sY = worldToScreenY(state.worldY + adjusted, state, h);
    if (sY < vanishY || sY > bottomY) continue;
    const scale = depthScale(sY, h);
    const edges = roadEdgesAtY(sY, w, h);
    ctx.strokeStyle = `rgba(60, 35, 12, ${0.15 * scale})`;
    ctx.lineWidth = Math.max(1, 1.5 * scale);
    ctx.beginPath();
    ctx.moveTo(edges.left + (edges.right - edges.left) * 0.15, sY);
    ctx.lineTo(edges.right - (edges.right - edges.left) * 0.15, sY);
    ctx.stroke();
  }

  ctx.restore();

  // Glowing road edges
  ctx.strokeStyle = "rgba(180, 220, 100, 0.5)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(topEdges.left, vanishY);
  ctx.lineTo(botEdges.left, bottomY);
  ctx.moveTo(topEdges.right, vanishY);
  ctx.lineTo(botEdges.right, bottomY);
  ctx.stroke();

  // Center dashed divider with perspective
  for (let i = 0; i < 30; i++) {
    const worldDist = (i / 30) * 800;
    const adjusted = worldDist - (state.worldY % (800 / 30));
    if (adjusted < 0) continue;
    const sY1 = worldToScreenY(state.worldY + adjusted, state, h);
    const sY2 = worldToScreenY(state.worldY + adjusted + 18, state, h);
    if (sY1 > bottomY || sY2 < vanishY) continue;
    const cx1 = perspectiveX(0.5, sY1, w, h);
    const cx2 = perspectiveX(0.5, sY2, w, h);
    const scale = depthScale(sY1, h);
    ctx.strokeStyle = `rgba(255, 240, 200, ${0.1 + scale * 0.18})`;
    ctx.lineWidth = 1 + scale * 2;
    ctx.beginPath();
    ctx.moveTo(cx1, sY1);
    ctx.lineTo(cx2, sY2);
    ctx.stroke();
  }
}

function isGood(choice: GateChoice): boolean {
  if (choice.op === "multiply") return true;
  if (choice.op === "divide") return false;
  return choice.value > 0;
}

function gateImageFor(choice: GateChoice, sprites: GameSprites): Sprite {
  if (choice.op === "multiply") return sprites.gateMultiply;
  if (choice.op === "divide") return sprites.gateDivide;
  if (choice.value > 0) return sprites.gatePlus;
  return sprites.gateMinus;
}

function drawGates(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  sprites: GameSprites,
  w: number,
  h: number
): void {
  for (const gate of state.gates) {
    if (gate.passed) continue;
    const screenY = worldToScreenY(gate.y, state, h);
    if (screenY < h * VANISH_Y_RATIO - 20 || screenY > h + 80) continue;

    const scale = depthScale(screenY, h);
    if (scale < 0.05) continue;

    const edges = roadEdgesAtY(screenY, w, h);
    const roadW = edges.right - edges.left;
    const halfW = roadW / 2;
    const gateH = Math.max(20, 90 * scale);
    const gateW = halfW * 1.05;
    const centerX = (edges.left + edges.right) / 2;

    // Left gate sprite
    const leftImg = gateImageFor(gate.left, sprites);
    ctx.drawImage(leftImg,
      edges.left - gateW * 0.05,
      screenY - gateH / 2,
      gateW,
      gateH);

    // Right gate sprite
    const rightImg = gateImageFor(gate.right, sprites);
    ctx.drawImage(rightImg,
      centerX,
      screenY - gateH / 2,
      gateW,
      gateH);

    // Big readable value labels overlaid on top
    const fontSize = Math.max(12, Math.round(28 * scale));
    ctx.font = `900 ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const leftLabelX = edges.left + halfW * 0.5;
    const rightLabelX = centerX + halfW * 0.5;
    const labelY = screenY;

    // Heavy outline + colored fill for max visibility
    const drawLabel = (text: string, x: number, y: number, color: string) => {
      ctx.lineWidth = Math.max(3, 5 * scale);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
      ctx.lineJoin = "round";
      ctx.strokeText(text, x, y);
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
    };

    drawLabel(gate.left.label, leftLabelX, labelY,
      isGood(gate.left) ? "#a3e635" : "#fda4af");
    drawLabel(gate.right.label, rightLabelX, labelY,
      isGood(gate.right) ? "#a3e635" : "#fda4af");
  }
}

function drawSpriteCentered(
  ctx: CanvasRenderingContext2D,
  img: Sprite,
  cx: number, cy: number, displaySize: number, alpha: number
) {
  if (alpha < 0.05) return;
  ctx.globalAlpha = alpha;
  const aspect = img.width / img.height;
  const w = displaySize * aspect;
  const h = displaySize;
  // Anchor slightly above center so shadow sits on the ground line
  ctx.drawImage(img, cx - w / 2, cy - h * 0.6, w, h);
  ctx.globalAlpha = 1;
}

function spriteForEnemy(kind: string, sprites: GameSprites): Sprite {
  switch (kind) {
    case "toad": return sprites.toad;
    case "wasp": return sprites.wasp;
    case "komodo": return sprites.komodo;
    default: return sprites.snake;
  }
}

function drawEnemiesSorted(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  sprites: GameSprites,
  canvasW: number,
  canvasH: number
): void {
  const sorted = [...state.enemies]
    .map((e) => ({ enemy: e, screenY: worldToScreenY(e.y, state, canvasH) }))
    .filter((e) => e.screenY > canvasH * VANISH_Y_RATIO - 20 && e.screenY < canvasH + 30)
    .sort((a, b) => a.screenY - b.screenY);

  for (const { enemy, screenY } of sorted) {
    const scale = depthScale(screenY, canvasH);
    if (scale < 0.05) continue;
    const screenX = perspectiveX(enemy.lanePos, screenY, canvasW, canvasH);
    const baseSize = enemy.kind === "komodo" ? 110 : 70;
    const size = Math.max(20, baseSize * scale);

    const img = spriteForEnemy(enemy.kind, sprites);
    drawSpriteCentered(ctx, img, screenX, screenY, size, Math.min(1, scale + 0.3));

    // HP bar
    if (enemy.hp < enemy.maxHp && scale > 0.2) {
      const barW = 24 * scale;
      const barH = Math.max(3, 4 * scale);
      const barY = screenY - size * 0.55;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(screenX - barW / 2 - 1, barY - 1, barW + 2, barH + 2);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(screenX - barW / 2, barY, barW, barH);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(screenX - barW / 2, barY, barW * (enemy.hp / enemy.maxHp), barH);
    }
  }
}

function drawBullets(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  sprites: GameSprites,
  canvasH: number
): void {
  for (const bullet of state.bullets) {
    if (bullet.sy < -10 || bullet.sy > canvasH + 10) continue;

    const scale = depthScale(bullet.sy, canvasH);
    const size = Math.max(12, 28 * scale);

    // Glow halo
    ctx.shadowColor = "rgba(251, 191, 36, 0.7)";
    ctx.shadowBlur = 10 + 8 * scale;
    drawSpriteCentered(ctx, sprites.acorn, bullet.sx, bullet.sy, size, 1);
    ctx.shadowBlur = 0;
  }
}

function drawTroopsSorted(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  sprites: GameSprites,
  canvasW: number,
  canvasH: number
): void {
  const baseLane = state.playerLane === "left" ? 0.25 : 0.75;

  const sorted = state.troops
    .map((troop) => {
      const sY = worldToScreenY(troop.y, state, canvasH);
      const troopLane = baseLane + (troop.offsetX / 120) * 0.35;
      const sX = perspectiveX(troopLane, sY, canvasW, canvasH);
      return { troop, screenX: sX, screenY: sY };
    })
    .filter((t) => t.screenY > canvasH * VANISH_Y_RATIO - 20 && t.screenY < canvasH + 50)
    .sort((a, b) => a.screenY - b.screenY);

  for (const { troop, screenX, screenY } of sorted) {
    const scale = depthScale(screenY, canvasH);
    const size = Math.max(20, 80 * scale);
    const img = sprites.platypusVariants[troop.variant % sprites.platypusVariants.length];
    drawSpriteCentered(ctx, img, screenX, screenY, size, 1);
  }
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  state: GameState
): void {
  for (const p of state.particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFloatingTexts(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasH: number
): void {
  for (const ft of state.floatingTexts) {
    const screenY = worldToScreenY(ft.y, state, canvasH);
    if (screenY < -40 || screenY > canvasH + 40) continue;
    const scale = depthScale(screenY, canvasH);
    const alpha = ft.life / ft.maxLife;
    const yOffset = (1 - alpha) * -40;
    const textScale = 0.8 + 0.4 * Math.min(1, (1 - alpha) * 3);
    const fontSize = Math.max(12, Math.round(26 * scale * textScale));

    ctx.globalAlpha = alpha;
    ctx.font = `900 ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.strokeStyle = "rgba(0,0,0,0.8)";
    ctx.lineWidth = Math.max(3, 5 * scale);
    ctx.lineJoin = "round";
    ctx.strokeText(ft.text, ft.x, screenY + yOffset);

    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, screenY + yOffset);

    ctx.globalAlpha = 1;
  }
}

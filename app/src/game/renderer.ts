import { GameState } from "./entities";

const GROUND_COLOR = "#2d3748";
const LANE_LINE_COLOR = "rgba(255,255,255,0.08)";
const SKY_GRADIENT_TOP = "#0f172a";
const SKY_GRADIENT_BOTTOM = "#1e293b";

export function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasW: number,
  canvasH: number
): void {
  ctx.clearRect(0, 0, canvasW, canvasH);

  drawBackground(ctx, state, canvasW, canvasH);
  drawGates(ctx, state, canvasW, canvasH);
  drawEnemies(ctx, state);
  drawBullets(ctx, state);
  drawTroops(ctx, state);
  drawFloatingTexts(ctx, state);
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  w: number,
  h: number
): void {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, SKY_GRADIENT_TOP);
  grad.addColorStop(1, SKY_GRADIENT_BOTTOM);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = GROUND_COLOR;
  ctx.fillRect(0, h * 0.15, w, h * 0.7);

  ctx.strokeStyle = LANE_LINE_COLOR;
  ctx.lineWidth = 2;
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.15);
  ctx.lineTo(w, h * 0.15);
  ctx.moveTo(0, h * 0.85);
  ctx.lineTo(w, h * 0.85);
  ctx.stroke();

  const scrollOffset = state.worldX % 80;
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let x = -scrollOffset; x < w + 80; x += 80) {
    ctx.fillRect(x, h * 0.15, 2, h * 0.7);
  }
}

function drawGates(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  _w: number,
  h: number
): void {
  for (const gate of state.gates) {
    if (gate.passed) continue;
    const screenX = gate.x - state.worldX;
    if (screenX < -60 || screenX > 500) continue;

    const gateW = 60;
    const halfH = h / 2;
    const playTop = h * 0.15;
    const playBot = h * 0.85;
    const playH = playBot - playTop;

    const isTopGood = gate.topValue > 0;
    ctx.fillStyle = isTopGood ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)";
    ctx.fillRect(screenX - gateW / 2, playTop, gateW, playH / 2);
    ctx.strokeStyle = isTopGood ? "#22c55e" : "#ef4444";
    ctx.lineWidth = 3;
    ctx.strokeRect(screenX - gateW / 2, playTop, gateW, playH / 2);

    const isBotGood = gate.bottomValue > 0;
    ctx.fillStyle = isBotGood ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)";
    ctx.fillRect(screenX - gateW / 2, halfH, gateW, playH / 2);
    ctx.strokeStyle = isBotGood ? "#22c55e" : "#ef4444";
    ctx.lineWidth = 3;
    ctx.strokeRect(screenX - gateW / 2, halfH, gateW, playH / 2);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(gate.topLabel, screenX, playTop + playH / 4);
    ctx.fillText(gate.bottomLabel, screenX, halfH + playH / 4);
  }
}

function drawEnemies(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const enemy of state.enemies) {
    const screenX = enemy.x - state.worldX;
    if (screenX < -20 || screenX > 500) continue;

    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(screenX, enemy.y, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#991b1b";
    ctx.beginPath();
    ctx.arc(screenX, enemy.y - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    if (enemy.hp < enemy.maxHp) {
      const barW = 16;
      const barH = 3;
      ctx.fillStyle = "#333";
      ctx.fillRect(screenX - barW / 2, enemy.y - 17, barW, barH);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(
        screenX - barW / 2,
        enemy.y - 17,
        barW * (enemy.hp / enemy.maxHp),
        barH
      );
    }
  }
}

function drawBullets(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.fillStyle = "#fbbf24";
  for (const bullet of state.bullets) {
    const screenX = bullet.x - state.worldX;
    if (screenX < -10 || screenX > 500) continue;
    ctx.beginPath();
    ctx.arc(screenX, bullet.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTroops(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const troop of state.troops) {
    const screenX = troop.x - state.worldX;

    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(screenX, troop.y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#166534";
    ctx.beginPath();
    ctx.arc(screenX, troop.y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const ft of state.floatingTexts) {
    const screenX = ft.x - state.worldX;
    const alpha = ft.life / ft.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ft.color;
    ctx.font = "bold 18px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const yOffset = (1 - alpha) * -30;
    ctx.fillText(ft.text, screenX, ft.y + yOffset);
    ctx.globalAlpha = 1;
  }
}

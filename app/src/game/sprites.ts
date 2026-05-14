import { resolveSpritePath } from "../ui/sprites";

export type Sprite = HTMLImageElement;

export interface GameSprites {
  platypus: Sprite;
  platypusVariants: Sprite[];
  snake: Sprite;
  toad: Sprite;
  wasp: Sprite;
  komodo: Sprite;
  acorn: Sprite;
  gatePlus: Sprite;
  gateMinus: Sprite;
  gateMultiply: Sprite;
  gateDivide: Sprite;
  bgSky: Sprite;
  bgRoad: Sprite;
  bgFloor: Sprite;
}

function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${path}`));
    img.src = resolveSpritePath(path);
  });
}

export async function loadAllSprites(): Promise<GameSprites> {
  const [
    platypus,
    pNavy,
    pLeaf,
    pNavy2,
    snake,
    toad,
    wasp,
    komodo,
    acorn,
    gatePlus,
    gateMinus,
    gateMultiply,
    gateDivide,
    bgSky,
    bgRoad,
    bgFloor,
  ] = await Promise.all([
    loadImage("/sprites/characters/platypus-teal.png"),
    loadImage("/sprites/characters/platypus-navy.png"),
    loadImage("/sprites/characters/platypus-leaf.png"),
    loadImage("/sprites/characters/platypus-navy-2.png"),
    loadImage("/sprites/enemies/snake.png"),
    loadImage("/sprites/enemies/toad.png"),
    loadImage("/sprites/enemies/wasp.png"),
    loadImage("/sprites/enemies/komodo.png"),
    loadImage("/sprites/projectiles/acorn.png"),
    loadImage("/sprites/gates/gate-plus.png"),
    loadImage("/sprites/gates/gate-minus.png"),
    loadImage("/sprites/gates/gate-multiply.png"),
    loadImage("/sprites/gates/gate-divide.png"),
    loadImage("/sprites/background/forest-sky.png"),
    loadImage("/sprites/background/dirt-road.png"),
    loadImage("/sprites/background/forest-floor.png"),
  ]);

  return {
    platypus,
    platypusVariants: [platypus, pNavy, pLeaf, pNavy2],
    snake,
    toad,
    wasp,
    komodo,
    acorn,
    gatePlus,
    gateMinus,
    gateMultiply,
    gateDivide,
    bgSky,
    bgRoad,
    bgFloor,
  };
}

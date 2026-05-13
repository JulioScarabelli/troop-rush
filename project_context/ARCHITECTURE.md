# Architecture Map

## Key files

- `app/index.html`: Vite entry HTML
- `app/src/main.tsx`: React entry point
- `app/src/App.tsx`: Main app shell — loads config, manages game state, renders canvas + UI overlays
- `app/src/styles.css`: Tailwind base, dark theme, viewport CSS, button/panel styles
- `app/src/data/loadData.ts`: CSV loading + validation
- `app/src/ui/sprites.ts`: Theme-aware sprite path resolution
- `app/src/game/entities.ts`: Entity types (Troop, Enemy, Bullet, Gate), GameState, GameConfig
- `app/src/game/gameLoop.ts`: Core update logic — movement, shooting, spawning, collision
- `app/src/game/renderer.ts`: Canvas drawing — background, gates, troops, enemies, bullets, floating text
- `app/src/game/spawner.ts`: Gate and enemy wave generation
- `app/src/game/collision.ts`: Gate, bullet, and troop-enemy collision processing
- `app/src/game/GameCanvas.tsx`: Canvas component with requestAnimationFrame loop
- `app/src/components/HUD.tsx`: Score and troop count overlay
- `app/src/components/LaneButtons.tsx`: UP/DOWN lane selection buttons
- `app/src/components/MenuScreen.tsx`: Start screen with title and high score
- `app/src/components/GameOverScreen.tsx`: Game over screen with score and restart
- `data/config.csv`: Global game tuning (speed, troops, bullets)
- `data/gates.csv`: Gate generation parameters
- `data/enemies.csv`: Enemy wave parameters

## Data flow

- CSVs in `data/` loaded at runtime via `loadData.ts` (Vite `publicDir` points to `../data`)
- Game state is a mutable object held in a React ref, updated by the game loop
- React state (score, troopCount, phase) mirrors game state for HUD rendering
- Canvas renders at 60fps via `requestAnimationFrame`

## Where to change things

| What you're changing | Start here |
|---|---|
| Game speed, troop count, bullet damage | `data/config.csv` |
| Gate spacing, good/bad values | `data/gates.csv` |
| Enemy wave size, HP, speed | `data/enemies.csv` |
| How entities move and interact | `app/src/game/gameLoop.ts` |
| How things look on canvas | `app/src/game/renderer.ts` |
| Gate/enemy spawning rules | `app/src/game/spawner.ts` |
| Collision detection | `app/src/game/collision.ts` |
| HUD / menus / buttons | `app/src/components/*` |
| Visual theme / colors | `app/src/styles.css` |
| Sprite assets | `data/sprites/themes/default/...` |

## App render tree

- `app-shell` → phone-shaped frame
  - `game-screen` → fills app-shell
    - `<canvas>` → game rendering (absolute, fills parent)
    - `HUD` → score/troops overlay (z-10)
    - `LaneButtons` → UP/DOWN controls (z-10)
    - `MenuScreen` → start overlay (z-20)
    - `GameOverScreen` → game over overlay (z-20)

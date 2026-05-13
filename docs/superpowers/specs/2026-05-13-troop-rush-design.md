# Troop Rush — Game Design Spec

**Status:** Approved  
**Date:** 2026-05-13

## Overview

Troop Rush is a hypercasual side-scrolling endless runner. The player's squad auto-runs to the right. Gates appear with two lane choices — one good (+troops), one bad (-troops or multiplication). Between gates, enemy waves spawn and your troops auto-shoot them. The game ends when troop count drops to zero. Score = distance traveled.

## Tech Stack

- React 18 + TypeScript + Vite + Tailwind (bootstrapped via BOOTSTRAP_V2.md)
- `<canvas>` for gameplay rendering (troops, enemies, bullets, gates, background)
- React DOM for HUD overlay (score, troop count, buttons, game-over screen)
- Data-driven tuning via CSV files in `data/`

## Visual Style

Side-scrolling 2D, left-to-right. Clean and colorful.

- **Troops**: Green circles (player's squad), arranged in a loose cluster
- **Enemies**: Red circles, spawn ahead in formations
- **Gates**: Two rectangles spanning top-half and bottom-half of the play area, colored red (bad) and green (good), with large +/- numbers
- **Bullets**: Small yellow circles traveling from troops toward enemies
- **Background**: Scrolling ground plane with simple lane lines to convey motion
- **HUD**: Score (top-left), troop count (top-right), UP/DOWN buttons (bottom)

## Game Architecture

### Rendering Layer (Canvas)

Single `<canvas>` element fills the game area. Game loop runs at 60fps via `requestAnimationFrame`.

**Entity types:**
- `Troop` — position (x, y), alive state. Cluster follows player position with slight random offset for visual variety.
- `Enemy` — position, HP, alive state. Moves left toward player.
- `Bullet` — position, velocity, damage. Moves right toward nearest enemy.
- `Gate` — position, two choices (top value, bottom value). Scrolls left with the world.
- `FloatingText` — "+5", "-3" popups that fade out. Spawns on gate selection and enemy kills.

**World scrolling:** Entities have world-space X coordinates. Camera follows the player's X progress. Background tiles repeat.

### State Management

React state (via `useRef` for the game loop, `useState` for HUD):

```
GameState {
  phase: "menu" | "playing" | "gameover"
  score: number          // distance traveled
  troopCount: number     // current squad size (min 0, max from CSV)
  troops: Troop[]        // individual troop positions for rendering
  enemies: Enemy[]       // active enemy entities
  bullets: Bullet[]      // active bullet entities
  gates: Gate[]          // upcoming gates
  playerLane: "top" | "bottom"  // current lane choice
  worldX: number         // how far the world has scrolled
  speed: number          // current scroll speed (increases over time)
}
```

### Game Loop (per frame)

1. **Scroll world** — advance `worldX` by `speed * dt`
2. **Update score** — increment based on distance
3. **Spawn gates** — when next gate distance threshold reached, generate a gate pair
4. **Spawn enemies** — between gates, spawn enemy waves based on difficulty curve
5. **Move enemies** — enemies move left toward troops
6. **Auto-shoot** — troops fire bullets at nearest enemy at a fixed rate
7. **Bullet collision** — bullets hitting enemies reduce enemy HP; dead enemies removed
8. **Gate collision** — when troops pass through a gate, apply the value for the chosen lane (+/- troops)
9. **Troop-enemy collision** — if enemies reach troop cluster, each collision kills 1 troop and 1 enemy
10. **Check game over** — if troopCount <= 0, transition to gameover phase
11. **Render** — clear canvas, draw background, draw all entities, draw floating text

### Controls

- **Two buttons** at bottom of screen: UP (top lane) and DOWN (bottom lane)
- **Keyboard**: Arrow Up / Arrow Down (desktop)
- Player lane determines which gate value applies when passing through
- Troops smoothly transition between lanes (top third / bottom third of play area)

### Gate Generation

Each gate pair has:
- A "good" choice: positive value (+3 to +10, or x2 multiplier)
- A "bad" choice: negative value (-1 to -8) or smaller positive
- Random assignment to top or bottom lane (prevents always picking one side)
- Minimum spacing between gates (from CSV: `gate_spacing_min`, `gate_spacing_max`)

### Enemy Waves

Between gates, enemy waves spawn:
- Wave size increases with distance (difficulty curve from CSV)
- Enemies have HP (from CSV: `enemy_base_hp`)
- Enemies move left at a speed relative to world scroll
- When enemy HP hits 0, show floating damage text and remove

### Difficulty Curve

All tunable via CSV:
- `base_speed`: starting scroll speed
- `speed_increase_per_100m`: how much faster it gets
- `max_speed`: cap
- `gate_spacing_min` / `gate_spacing_max`: distance between gates
- `enemy_wave_size_base`: starting enemies per wave
- `enemy_wave_size_growth`: additional enemies per 100m distance
- `troop_fire_rate`: shots per second per troop (or per squad)
- `bullet_damage`: damage per bullet
- `enemy_base_hp`: starting enemy HP
- `max_troops`: cap on troop count
- `start_troops`: initial troop count

## CSV Data Files

### data/config.csv
```
key,value
app_name,Troop Rush
start_troops,5
max_troops,50
base_speed,120
speed_increase_per_100m,5
max_speed,300
troop_fire_rate,2
bullet_damage,1
bullet_speed,400
```

### data/gates.csv
```
key,value
gate_spacing_min,400
gate_spacing_max,700
good_value_min,3
good_value_max,10
bad_value_min,-8
bad_value_max,-1
multiplier_chance,0.1
multiplier_value,2
```

### data/enemies.csv
```
key,value
enemy_base_hp,1
enemy_speed,60
wave_size_base,3
wave_size_growth_per_100m,1
wave_spacing_min,200
wave_spacing_max,400
```

## UI Screens

### Menu Screen (React overlay)
- Game title "Troop Rush"
- "TAP TO START" button (ui-cta)
- High score display

### HUD (React overlay, visible during gameplay)
- Top-left: Score (distance)
- Top-right: Troop count with icon
- Bottom: UP / DOWN lane buttons

### Game Over Screen (React overlay)
- "GAME OVER" title
- Final score
- High score (persisted in localStorage)
- "PLAY AGAIN" button (ui-cta)

## File Structure (new files beyond bootstrap)

```
app/src/
  game/
    GameCanvas.tsx       — Canvas component + game loop
    gameLoop.ts          — Core update/render logic
    entities.ts          — Entity types and factory functions
    collision.ts         — Collision detection helpers
    renderer.ts          — Canvas drawing functions
    spawner.ts           — Gate and enemy wave spawning logic
  components/
    HUD.tsx              — Score, troop count overlay
    MenuScreen.tsx       — Start screen
    GameOverScreen.tsx   — Game over screen
    LaneButtons.tsx      — UP/DOWN control buttons
data/
  config.csv             — General game tuning
  gates.csv              — Gate generation parameters
  enemies.csv            — Enemy wave parameters
```

## Success Criteria

1. Game runs at 60fps on mobile browser
2. Gates appear with clear good/bad choices
3. Troops visually grow/shrink as you pick gates
4. Auto-shooting feels satisfying with visible bullets and enemy deaths
5. Difficulty ramps up noticeably over 60 seconds of play
6. Game over + restart loop works smoothly
7. All tuning values adjustable via CSV without code changes

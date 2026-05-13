# UI Standards

## Core Rule

Prefer existing utility classes before inventing one-off treatments.

## Button Hierarchy

| Class | Use | Examples |
|-------|-----|----------|
| `ui-cta` | Primary positive actions | Start, Play Again |
| `ui-button` | Secondary actions | Close, Settings |
| `ui-disabled` | Disabled state | Locked features |
| `lane-btn` | Lane selection buttons | UP, DOWN |
| `lane-btn-up` | Green UP lane button | |
| `lane-btn-down` | Blue DOWN lane button | |

## Panel Styles

| Class | Use |
|-------|-----|
| `ui-panel` | Dark themed panels, dialogs, score cards |

## Text

| Context | Class |
|---------|-------|
| Primary text | `ink-strong` (white) |
| Secondary / muted | `ink-soft` (gray) |
| Text on light backgrounds | `ink-inverse` |

## Viewport Classes

| Class | Use |
|-------|-----|
| `app-shell` | Phone-shaped frame, max-width capped |
| `game-screen` | Content area filling app-shell |
| `app-screen` | Full-viewport fixed layer for overlays |

## Game-Specific Patterns

- HUD elements use `bg-black/50 backdrop-blur-sm` for readability over canvas
- Game overlays (menu, game over) use `bg-black/60 backdrop-blur-sm` with z-20
- Lane buttons use active ring indicator for current lane
- Floating text on canvas uses alpha fade-out animation

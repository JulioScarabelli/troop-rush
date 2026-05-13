# Data Reference

All CSVs live in `data/` and are loaded at runtime as key-value pairs.

## data/config.csv

- **Schema**: `key,value`
- **Meaning**: Core game tuning parameters
- **Keys**:
  - `app_name`: Display name ("Troop Rush")
  - `start_troops`: Initial squad size (default: 5)
  - `max_troops`: Maximum squad size cap (default: 50)
  - `base_speed`: Starting scroll speed in px/sec (default: 120)
  - `speed_increase_per_100m`: Speed added per 100m distance (default: 5)
  - `max_speed`: Speed cap in px/sec (default: 300)
  - `troop_fire_rate`: Shots per second (default: 2)
  - `bullet_damage`: Damage per bullet (default: 1)
  - `bullet_speed`: Bullet travel speed in px/sec (default: 400)

## data/gates.csv

- **Schema**: `key,value`
- **Meaning**: Gate generation parameters
- **Keys**:
  - `gate_spacing_min` / `gate_spacing_max`: Distance between gates in world units
  - `good_value_min` / `good_value_max`: Range for positive gate values
  - `bad_value_min` / `bad_value_max`: Range for negative gate values (use negative numbers)
  - `multiplier_chance`: Probability of a multiplier gate (0.0 - 1.0)
  - `multiplier_value`: Multiplier factor (e.g., 2 = double troops)

## data/enemies.csv

- **Schema**: `key,value`
- **Meaning**: Enemy wave parameters
- **Keys**:
  - `enemy_base_hp`: HP per enemy (default: 1)
  - `enemy_speed`: Enemy movement speed in px/sec
  - `wave_size_base`: Starting enemies per wave
  - `wave_size_growth_per_100m`: Additional enemies per 100m distance
  - `wave_spacing_min` / `wave_spacing_max`: Distance between enemy waves

## Validation rules

- All CSVs use `key,value` schema loaded via `loadKeyValueCsv()`
- Values are parsed to numbers with `parseFloat()` at usage site
- Missing keys fall back to hardcoded defaults in `App.tsx`
- Column names: lowercase_snake_case

# Design

## North Star

A satisfying, fast-paced hypercasual experience where quick decisions and growing your army feel rewarding. The player should feel the tension of choosing gates and the satisfaction of watching their troops destroy enemies.

## Design Principles

### Immediate Feedback

**Statement**: Every player action produces visible, satisfying feedback within 200ms.

**Rationale**: Hypercasual games live or die on feel. Gate choices show floating text, troops visibly grow/shrink, bullets and enemy deaths create visual activity.

**Examples**: Floating "+5" text on good gates, "-3" on bad ones. Enemy death particles. Troop count visually changing.

### Data-Driven Everything

**Statement**: All tuning lives in CSV files, never hardcoded.

**Rationale**: Rapid iteration. Change a number, refresh the browser, see the result. No rebuild needed.

## Core Loop

1. Auto-run right at increasing speed
2. Choose lane (UP/DOWN) before each gate pair
3. Good gate: +troops. Bad gate: -troops. Occasional multiplier.
4. Enemy waves between gates — troops auto-shoot
5. Enemies reaching squad kill 1 troop each
6. Game over at 0 troops, score = distance

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-13 | Side-scrolling 2D (not top-down) | Simpler to implement, clear lane visibility |
| 2026-05-13 | Shooting combat (not auto-resolve) | More visual activity, closer to reference game |
| 2026-05-13 | Two buttons (not swipe or tap) | Most explicit control, works on desktop too |
| 2026-05-13 | Canvas rendering (not DOM) | Many moving entities at 60fps — DOM would struggle |

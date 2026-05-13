# Working Model

## Sources of truth

| Doc | What it covers |
|-----|----------------|
| PROJECT.md | What the repo is, how to run it, core gameplay |
| ARCHITECTURE.md | Code structure, data flow, where to change things |
| DATA.md | CSV schemas, column types, validation rules |
| DESIGN.md | Game mechanics, design principles, decision log |
| ui-ux/UI_STANDARDS.md | Button/panel/interaction patterns |

Feature plans live in `project_plans/active/` (move to `archive/` when shipped, to `backlog/` when deferred).

## How to treat docs vs active iteration

- **DATA.md is strict.** CSV schemas and invariants must be respected.
- **DESIGN.md is directional.** Latest chat messages override DESIGN.md during active experimentation.
- **PROJECT.md and ARCHITECTURE.md describe current behavior.** Update when behavior changes.

## Doc update rules

| What changed | Update |
|---|---|
| CSV schema (new column, new file, changed constraints) | DATA.md (required) |
| New game behavior or rule change | PROJECT.md |
| New file, moved file, changed file responsibility | ARCHITECTURE.md |
| Design decision or direction change | DESIGN.md |
| New button/panel pattern or visual rule | ui-ux/UI_STANDARDS.md |
| Major feature plan | `project_plans/active/*.md` |

## Commit conventions

**Never commit or push without explicit approval.**

When committing:
1. Stage only files relevant to the change (not `git add -A`)
2. First line: imperative summary, under 70 characters
3. Body: 1-3 sentences of context
4. Include doc updates in the same commit when needed

## Git workflow

| Branch | Purpose |
|---|---|
| `main` | Stable working version |
| Feature branches | Active work |

## Debugging rule

Prefer fail-fast errors and explicit logging over silent fallbacks.

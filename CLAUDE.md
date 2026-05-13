# Claude Code Instructions

Read these baseline docs at session start:

- @project_context/PROJECT.md
- @project_context/ARCHITECTURE.md
- @project_context/DATA.md
- @project_context/WORKING_MODEL.md
- @project_context/ui-ux/UI_STANDARDS.md

Read specialist docs only when working on those areas:

- `project_context/DESIGN.md` -- game mechanics, design principles
- `docs/superpowers/specs/2026-05-13-troop-rush-design.md` -- original game design spec

## Key rules

- Follow commit conventions and doc update rules in WORKING_MODEL.md.
- Prefer data-driven changes in `data/*.csv` over hard-coded tuning.
- Keep changes localized; avoid refactors unless required.
- React + TypeScript + Vite + Tailwind stack (`app/` directory).
- Canvas for game rendering, React DOM for UI overlays.
- **Sprites:** Always use `resolveSpritePath()` for image src attributes.
- **Debugging:** Prefer fail-fast errors over silent fallbacks.

## Commit conventions

**Never commit or push without explicit approval.**
**Only commit files from this session.**

When asked to commit:
1. Stage only the files relevant to the change (not `git add -A`).
2. Write a commit message: imperative summary under 70 chars, body with 1-3 sentences of context.
3. Include doc updates in the same commit when needed.
4. Do not commit secrets (.env, credentials, API keys).

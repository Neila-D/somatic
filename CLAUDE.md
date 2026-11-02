# Somatic — notes for Claude Code

Read `CLAUDE_MASTER_PROMPT.md` (vision, constraints) and `ROADMAP.md` (phases) first. Work one phase at a time; make the smallest useful, tested increment.

## Commands
- `npm install` · `npm run dev` · `npm test` · `npm run typecheck` · `npm run build`

## Architecture
- `src/core/` — pure, serializable logic (no DOM/canvas): `types`, `project` (schema, parse/validate, edits), `history` (undo/redo), `stamps` (resampling), `patterns` (brush metadata), `rng`.
- `src/render/` — canvas drawing from project data: `body`, `stamp` (brush patterns), `view` (compose + PNG export).
- `src/components/` — React UI. `Studio` owns history, tool and brush state.
- `src/storage.ts` — localStorage autosave and file download helpers.

## Rules
- Strokes are structured data in model space (300×700 per view), never pixels. Procedural texture uses `stroke.seed` so redraws are identical.
- Bump `SCHEMA_VERSION` and add a migration in `core/project.ts` for any schema change; keep old files openable.
- Synthetic data only. No network APIs (enforced by `privacy.test.ts`), no AI, no medical advice.
- Patterns are visual metaphors, not validated sensation mappings — keep UI copy neutral.
- Add tests for new core behavior; keep research/comparison code independent of the drawing engine.

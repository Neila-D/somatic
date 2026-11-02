# Somatic Roadmap

Build one phase at a time. Each phase is done only when its completion requirement is met and tested. Full vision and constraints: [CLAUDE_MASTER_PROMPT.md](CLAUDE_MASTER_PROMPT.md).

**Standing constraints (all phases):** synthetic data only · no AI/LLM/model APIs · no network requests · no diagnosis or treatment advice · works offline · automated tests for important behavior.

## Phase 1 — Stabilize the 2D prototype (current)

Status: **in progress** (core delivered, items below open)

Delivered in v0.1.0:
- [x] Front/back 2D body maps, paint and erase
- [x] Six visual patterns (diffuse glow, concentric pulse, fine particles, angular strokes, wavy lines, crosshatch)
- [x] Colour palette plus custom colour, intensity and radius controls
- [x] Undo / redo (buttons and Ctrl/⌘+Z, Ctrl/⌘+Shift+Z)
- [x] Strokes stored as structured data in model space (not pixels), with seeded procedural texture
- [x] Versioned project format (`schemaVersion`, `modelId`) with validation and a migration hook
- [x] Autosave in the browser; export/import editable JSON; export PNG
- [x] Synthetic comparison exercise and research notes pages
- [x] Tests: history, persistence round-trip, erase/overlap, resampling, offline guarantee

Still open before Phase 1 is complete:
- [ ] Browser end-to-end tests (Playwright) for paint → save → reopen
- [ ] Layer UI (data model already has layers)
- [ ] Select / move / delete individual strokes and edit brush properties after painting
- [ ] Keyboard-accessible painting alternative; touch testing
- [ ] Visual review against design on several screen sizes

**Completion requirement:** users can create, edit, save, reopen and export a 2D visualization without losing work.

## Phase 2 — 3D viewer

- Load a properly licensed neutral human model (record licence in the repo)
- Rotate, zoom, pan; preset front/back/side views
- Cursor-to-surface raycasting
- One basic brush painting on the model
- Compare UV texture painting vs geometry-attached strokes (seams, persistence, performance, animation) and record the decision

**Completion requirement:** paint a mark on a body location, rotate, and the mark stays on that location.

## Phase 3 — Complete 3D painting engine

- Multiple brush styles and parameter controls; animated effects
- Layers, erase, undo/redo
- Save and reopen full 3D scenes (strokes remain editable structured data)

**Completion requirement:** create and edit a multilayer 3D representation with several brushes and persist it reliably.

## Phase 4 — Timeline and pain movement

- Time-associated keyframes edited independently; scrubbing, playback, loop
- Recorded-state comparison; optional movement trails
- Transitions are clearly labelled as visual interpolation, never presented as reported observations, and can be disabled
- Animation export

**Completion requirement:** represent pain in several locations at several times and play back the chronology.

## Phase 5 — Research-oriented customization

- Custom brush editor, reproducible presets
- Configurable synthetic comparison exercises, ratings/rankings, analysis exports
- Accessibility and device compatibility

**Completion requirement:** researchers configure and reproduce synthetic comparison exercises without changing code.

## Phase 6 — Future research readiness

Only after ethics and privacy review and explicit authorization. No live human-subject data collection is built or activated before then.

## Architecture (target)

| Module | Responsibility | Today |
| --- | --- | --- |
| Viewer | model rendering, camera, raycasting | `src/render` (2D) |
| Painting engine | brush placement, stroke geometry, erasing | `src/core/project.ts`, `stamps.ts` |
| Brush library | brush rendering + parameters | `src/render/stamp.ts`, `core/patterns.ts` |
| Layer manager | overlapping, editable layers | data model only |
| Timeline engine | time-associated states | not started |
| Animation engine | procedural animation, labelled transitions | not started |
| Project storage | save/load, migration, export | `core/project.ts`, `storage.ts` |
| Research module | synthetic comparisons (kept independent) | `components/Compare.tsx` |

# Somatic

A web-based 3D pain visualization and research platform. People can communicate how pain feels, where it occurs, and how it changes over time through customizable brushes, body painting, animated sensations, and a timeline.

**Current version (v0.1.0): Phase 1 — a 2D studio.** Paint visual patterns on front and back body maps, erase, undo/redo, save, reopen and export. Everything runs in the browser, offline, with no AI and no network requests.

> Development uses synthetic data only. No real patient data is collected. Experimental visuals only — not a medical tool.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests
npm run build    # production build in dist/
```

Requires Node 18+.

## Using the studio

- Pick a **visual pattern**, **colour**, **intensity** and **brush radius**, then click or drag on a body map.
- **Erase** removes marks you touch. **Undo/redo** with the arrows or Ctrl/⌘+Z and Ctrl/⌘+Shift+Z.
- **Export scene** saves editable JSON (re-openable with *Open scene…*). **Export PNG** saves a picture. Work is also autosaved in this browser.
- **Compare visuals** is a small synthetic exercise; **Research notes** summarises methods and boundaries.

## Docs

- [CLAUDE_MASTER_PROMPT.md](CLAUDE_MASTER_PROMPT.md) — full product vision and constraints
- [ROADMAP.md](ROADMAP.md) — phases, acceptance criteria, architecture
- [CLAUDE.md](CLAUDE.md) — notes for coding agents

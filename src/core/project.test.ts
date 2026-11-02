import { describe, expect, it } from 'vitest';
import { commit, createHistory, redo, undo } from './history';
import {
  DEFAULT_LAYER_ID,
  ProjectError,
  SCHEMA_VERSION,
  addStroke,
  clearStrokes,
  createProject,
  parseProject,
  removeStrokesNear,
  sampleProject,
  serializeProject,
  upsertStroke,
} from './project';
import type { Stroke } from './types';

const stroke = (id: string, x: number, y: number, view: Stroke['view'] = 'anterior', radius = 20): Stroke => ({
  id,
  layerId: DEFAULT_LAYER_ID,
  view,
  brush: { pattern: 'glow', color: '#d9605a', intensity: 0.5, radius },
  points: [{ x, y }],
  seed: 1,
});

describe('project persistence', () => {
  it('round-trips a scene exactly (stroke positions, brushes, layers)', () => {
    const original = sampleProject(new Date('2026-01-01T00:00:00Z'));
    const restored = parseProject(serializeProject(original));
    expect(restored).toEqual(original);
  });

  it('keeps full precision of model-space coordinates', () => {
    const p = addStroke(createProject(), {
      ...stroke('a', 0, 0),
      points: [{ x: 123.456789, y: 654.321 }, { x: 1 / 3, y: 2 / 3 }],
    });
    const restored = parseProject(serializeProject(p));
    expect(restored.strokes[0].points).toEqual(p.strokes[0].points);
  });

  it('stores schema version and model id', () => {
    const json = JSON.parse(serializeProject(createProject()));
    expect(json.schemaVersion).toBe(SCHEMA_VERSION);
    expect(json.modelId).toMatch(/somatic/);
  });

  it('rejects invalid JSON, foreign files and future schema versions', () => {
    expect(() => parseProject('not json')).toThrow(ProjectError);
    expect(() => parseProject('{"hello":1}')).toThrow(ProjectError);
    const future = { ...createProject(), schemaVersion: SCHEMA_VERSION + 1 };
    expect(() => parseProject(JSON.stringify(future))).toThrow(/newer version/);
  });

  it('rejects scenes with invalid strokes', () => {
    const bad = addStroke(createProject(), { ...stroke('a', 1, 1), brush: { pattern: 'glow', color: 'red', intensity: 2, radius: 5 } });
    expect(() => parseProject(JSON.stringify(bad))).toThrow(ProjectError);
    const nan = JSON.parse(serializeProject(addStroke(createProject(), stroke('b', 1, 1))));
    nan.strokes[0].points = [{ x: 'a', y: 1 }];
    expect(() => parseProject(JSON.stringify(nan))).toThrow(ProjectError);
  });
});

describe('editing', () => {
  it('upsertStroke replaces by id while a stroke grows', () => {
    let p = createProject();
    p = upsertStroke(p, stroke('a', 10, 10));
    p = upsertStroke(p, { ...stroke('a', 10, 10), points: [{ x: 10, y: 10 }, { x: 20, y: 20 }] });
    expect(p.strokes).toHaveLength(1);
    expect(p.strokes[0].points).toHaveLength(2);
  });

  it('erases only strokes the eraser touches, on the same view', () => {
    let p = createProject();
    p = addStroke(p, stroke('near', 100, 100));
    p = addStroke(p, stroke('far', 250, 600));
    p = addStroke(p, stroke('other-view', 100, 100, 'posterior'));
    const erased = removeStrokesNear(p, 'anterior', { x: 105, y: 102 }, 10);
    expect(erased.strokes.map((s) => s.id).sort()).toEqual(['far', 'other-view']);
  });

  it('returns the same object when nothing is erased', () => {
    const p = addStroke(createProject(), stroke('a', 100, 100));
    expect(removeStrokesNear(p, 'anterior', { x: 290, y: 690 }, 5)).toBe(p);
  });

  it('overlapping strokes at the same spot are both kept and independently erasable', () => {
    let p = createProject();
    p = addStroke(p, stroke('under', 100, 100, 'anterior', 40));
    p = addStroke(p, stroke('over', 100, 100, 'anterior', 10));
    expect(p.strokes.map((s) => s.id)).toEqual(['under', 'over']);
    // Eraser far enough away only reaches the larger stroke.
    const erased = removeStrokesNear(p, 'anterior', { x: 100 + 25, y: 100 }, 5);
    expect(erased.strokes.map((s) => s.id)).toEqual(['over']);
  });

  it('clears one view or all strokes', () => {
    const p = sampleProject();
    expect(clearStrokes(p, 'anterior').strokes.every((s) => s.view === 'posterior')).toBe(true);
    expect(clearStrokes(p).strokes).toHaveLength(0);
  });
});

describe('undo/redo with projects', () => {
  it('restores a previous scene after paint and erase', () => {
    const empty = createProject();
    let h = createHistory(empty);
    h = commit(h, addStroke(h.present, stroke('a', 50, 50)));
    h = commit(h, removeStrokesNear(h.present, 'anterior', { x: 50, y: 50 }, 5));
    expect(h.present.strokes).toHaveLength(0);
    h = undo(h);
    expect(h.present.strokes.map((s) => s.id)).toEqual(['a']);
    h = undo(h);
    expect(h.present).toBe(empty);
    h = redo(h);
    expect(h.present.strokes).toHaveLength(1);
  });
});

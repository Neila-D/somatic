import { PATTERNS, VIEWS } from './types';
import type { BrushSettings, Layer, Point, Project, Stroke, ViewId } from './types';

export const SCHEMA_VERSION = 2;
export const MODEL_ID = 'somatic-simplified-body-2d@1';
export const DEFAULT_LAYER_ID = 'layer-1';

export class ProjectError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProjectError';
  }
}

export function createProject(name = 'Untitled scene', now = new Date()): Project {
  const iso = now.toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    app: 'somatic',
    modelId: MODEL_ID,
    name,
    createdAt: iso,
    updatedAt: iso,
    layers: [{ id: DEFAULT_LAYER_ID, name: 'Layer 1', visible: true }],
    strokes: [],
  };
}

export function touch(project: Project, now = new Date()): Project {
  return { ...project, updatedAt: now.toISOString() };
}

export function addStroke(project: Project, stroke: Stroke): Project {
  return { ...project, strokes: [...project.strokes, stroke] };
}

/** Insert the stroke, or replace the one with the same id (used while dragging). */
export function upsertStroke(project: Project, stroke: Stroke): Project {
  const i = project.strokes.findIndex((s) => s.id === stroke.id);
  if (i === -1) return addStroke(project, stroke);
  const strokes = project.strokes.slice();
  strokes[i] = stroke;
  return { ...project, strokes };
}

/**
 * Remove every stroke on `view` that the eraser touches. A stroke is touched if
 * any of its points is within the eraser radius plus part of its own radius.
 * Returns the same object if nothing was removed.
 */
export function removeStrokesNear(project: Project, view: ViewId, at: Point, eraserRadius: number): Project {
  const kept = project.strokes.filter((s) => {
    if (s.view !== view) return true;
    const reach = eraserRadius + s.brush.radius * 0.6;
    return !s.points.some((p) => Math.hypot(p.x - at.x, p.y - at.y) <= reach);
  });
  return kept.length === project.strokes.length ? project : { ...project, strokes: kept };
}

/** Remove all strokes (or all strokes on one view). */
export function clearStrokes(project: Project, view?: ViewId): Project {
  const strokes = view ? project.strokes.filter((s) => s.view !== view) : [];
  return strokes.length === project.strokes.length ? project : { ...project, strokes };
}

/** A synthetic example scene. No real data. */
export function sampleProject(now = new Date()): Project {
  const base = createProject('Synthetic example', now);
  const mk = (id: string, view: ViewId, brush: BrushSettings, points: Point[], seed: number): Stroke => ({
    id,
    layerId: DEFAULT_LAYER_ID,
    view,
    brush,
    points,
    seed,
  });
  return {
    ...base,
    strokes: [
      mk('sample-glow', 'anterior', { pattern: 'aching', color: '#d9605a', intensity: 0.7, radius: 38, speed: 1 }, [{ x: 170, y: 215 }], 11),
      mk('sample-pulse', 'anterior', { pattern: 'throbbing', color: '#7c6bc4', intensity: 0.8, radius: 18, speed: 1 }, [{ x: 82, y: 168 }], 22),
      mk(
        'sample-wavy',
        'posterior',
        { pattern: 'radiating', color: '#4a8aa6', intensity: 0.8, radius: 34, speed: 1 },
        [{ x: 150, y: 270 }],
        33,
      ),
    ],
  };
}

// ---------------------------------------------------------------------------
// Serialization, validation, migration
// ---------------------------------------------------------------------------

export function serializeProject(project: Project): string {
  return JSON.stringify(project, null, 2);
}

/** v1 used descriptive visual names; v2 names brushes after pain descriptors. */
const V1_TO_V2_PATTERN: Record<string, string> = {
  glow: 'aching',
  pulse: 'throbbing',
  particles: 'tingling',
  angular: 'stabbing',
  wavy: 'radiating',
  crosshatch: 'pressure',
};

/** Migrations upgrade a raw project from version N to N+1. */
const migrations: Record<number, (raw: Record<string, unknown>) => Record<string, unknown>> = {
  // v1 -> v2: rename patterns and add the per-brush animation `speed`.
  1: (raw) => ({
    ...raw,
    strokes: Array.isArray(raw.strokes)
      ? raw.strokes.map((s: unknown) =>
          isObj(s) && isObj(s.brush)
            ? {
                ...s,
                brush: {
                  ...s.brush,
                  pattern: V1_TO_V2_PATTERN[s.brush.pattern as string] ?? s.brush.pattern,
                  speed: 1,
                },
              }
            : s,
        )
      : raw.strokes,
  }),
};

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const HEX = /^#[0-9a-fA-F]{6}$/;

function validBrush(v: unknown): v is BrushSettings {
  return (
    isObj(v) &&
    PATTERNS.includes(v.pattern as never) &&
    isStr(v.color) &&
    HEX.test(v.color) &&
    isNum(v.intensity) &&
    v.intensity >= 0 &&
    v.intensity <= 1 &&
    isNum(v.radius) &&
    v.radius > 0 &&
    isNum(v.speed) &&
    v.speed >= 0 &&
    v.speed <= 3
  );
}

function validStroke(v: unknown): v is Stroke {
  return (
    isObj(v) &&
    isStr(v.id) &&
    isStr(v.layerId) &&
    VIEWS.includes(v.view as never) &&
    validBrush(v.brush) &&
    isNum(v.seed) &&
    Array.isArray(v.points) &&
    v.points.length > 0 &&
    v.points.every((p) => isObj(p) && isNum(p.x) && isNum(p.y))
  );
}

function validLayer(v: unknown): v is Layer {
  return isObj(v) && isStr(v.id) && isStr(v.name) && typeof v.visible === 'boolean';
}

/** Parse and validate untrusted JSON text into a Project. Throws ProjectError. */
export function parseProject(text: string): Project {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new ProjectError('This file is not valid JSON.');
  }
  if (!isObj(raw) || raw.app !== 'somatic') throw new ProjectError('This is not a Somatic scene file.');
  if (!Number.isInteger(raw.schemaVersion) || (raw.schemaVersion as number) < 1) {
    throw new ProjectError('The scene file has no valid schema version.');
  }
  let version = raw.schemaVersion as number;
  if (version > SCHEMA_VERSION) {
    throw new ProjectError(`This scene was saved by a newer version of Somatic (schema ${version}).`);
  }
  let current: Record<string, unknown> = raw;
  while (version < SCHEMA_VERSION) {
    const step = migrations[version];
    if (!step) throw new ProjectError(`No migration available from schema ${version}.`);
    current = step(current);
    version += 1;
    current.schemaVersion = version;
  }

  const p = current;
  if (
    !isStr(p.modelId) ||
    !isStr(p.name) ||
    !isStr(p.createdAt) ||
    !isStr(p.updatedAt) ||
    !Array.isArray(p.layers) ||
    !p.layers.every(validLayer) ||
    !Array.isArray(p.strokes) ||
    !p.strokes.every(validStroke)
  ) {
    throw new ProjectError('The scene file is missing data or contains invalid values.');
  }
  return p as unknown as Project;
}

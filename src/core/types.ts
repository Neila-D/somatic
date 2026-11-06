/**
 * Core data model. Everything here is plain, serializable data — no canvas or
 * DOM objects — so projects can be saved, migrated and reloaded exactly.
 *
 * Coordinates are "model space": each body view is a VIEW_WIDTH x VIEW_HEIGHT
 * box, independent of screen size or device pixel ratio.
 */

/** Brush ids. Names follow common pain descriptors; looks are metaphors only. */
export const PATTERNS = [
  'aching',
  'throbbing',
  'burning',
  'stabbing',
  'shooting',
  'tingling',
  'pressure',
  'radiating',
  'numbness',
] as const;
export type PatternId = (typeof PATTERNS)[number];

export const VIEWS = ['anterior', 'posterior'] as const;
export type ViewId = (typeof VIEWS)[number];

export const VIEW_WIDTH = 300;
export const VIEW_HEIGHT = 700;

export interface Point {
  x: number;
  y: number;
}

export interface BrushSettings {
  pattern: PatternId;
  /** Hex colour, #rrggbb */
  color: string;
  /** 0..1 */
  intensity: number;
  /** Radius in model units */
  radius: number;
  /** Animation speed multiplier. 0 = still. */
  speed: number;
}

export interface Stroke {
  id: string;
  layerId: string;
  view: ViewId;
  /** Snapshot of the brush used. Kept with the stroke so it stays editable. */
  brush: BrushSettings;
  points: Point[];
  /** Seed for deterministic procedural texture (particles, spikes...). */
  seed: number;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
}

export interface Project {
  schemaVersion: number;
  app: 'somatic';
  /** Identifies the body model the coordinates refer to. */
  modelId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  layers: Layer[];
  strokes: Stroke[];
}

export type Tool = 'paint' | 'erase' | 'pan';

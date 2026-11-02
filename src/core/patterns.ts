import type { BrushSettings, PatternId } from './types';

export interface PatternInfo {
  id: PatternId;
  label: string;
  description: string;
  /** Stamp spacing as a fraction of brush radius. */
  spacing: number;
}

/**
 * These are visual encodings to explore, NOT established mappings between
 * sensations and appearances. The person decides what represents their
 * experience.
 */
export const PATTERN_INFO: Record<PatternId, PatternInfo> = {
  glow: { id: 'glow', label: 'Diffuse glow', description: 'Soft, blurred colour', spacing: 0.45 },
  pulse: { id: 'pulse', label: 'Concentric pulse', description: 'Rings radiating outward', spacing: 1.1 },
  particles: { id: 'particles', label: 'Fine particles', description: 'Scattered small dots', spacing: 0.7 },
  angular: { id: 'angular', label: 'Angular strokes', description: 'Sharp, pointed marks', spacing: 0.8 },
  wavy: { id: 'wavy', label: 'Wavy lines', description: 'Flowing lines', spacing: 0.7 },
  crosshatch: { id: 'crosshatch', label: 'Crosshatch', description: 'Dense layered lines', spacing: 0.7 },
};

export const PALETTE = ['#d9605a', '#7c6bc4', '#4a8aa6', '#d49a4a', '#b5527f', '#5d6b80'] as const;

export const DEFAULT_BRUSH: BrushSettings = {
  pattern: 'glow',
  color: PALETTE[0],
  intensity: 0.7,
  radius: 28,
};

export const MIN_RADIUS = 6;
export const MAX_RADIUS = 60;

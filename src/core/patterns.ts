import type { BrushSettings, PatternId } from './types';

export interface PatternInfo {
  id: PatternId;
  label: string;
  /** Plain description of what the brush looks like and how it moves. */
  description: string;
  /** Stamp spacing as a fraction of brush radius. */
  spacing: number;
}

/**
 * Brush names borrow common pain-description words. The visuals are metaphors
 * to explore, NOT established mappings between sensations and appearances.
 * The person decides what represents their experience.
 */
export const PATTERN_INFO: Record<PatternId, PatternInfo> = {
  aching: { id: 'aching', label: 'Aching', description: 'A broad, soft glow that slowly breathes.', spacing: 0.45 },
  throbbing: { id: 'throbbing', label: 'Throbbing', description: 'Rings that pulse in a repeating beat.', spacing: 1.1 },
  burning: { id: 'burning', label: 'Burning', description: 'Flickering warmth that drifts upward.', spacing: 0.6 },
  stabbing: { id: 'stabbing', label: 'Stabbing', description: 'Sharp points that snap out, then recoil.', spacing: 0.8 },
  shooting: { id: 'shooting', label: 'Shooting', description: 'Crackling, jagged bolts that flash and move.', spacing: 1.0 },
  tingling: { id: 'tingling', label: 'Tingling', description: 'Scattered points that twinkle and drift.', spacing: 0.7 },
  pressure: { id: 'pressure', label: 'Pressure', description: 'A dense crosshatch that tightens and relaxes.', spacing: 0.7 },
  radiating: { id: 'radiating', label: 'Radiating', description: 'Wavy lines with waves travelling across them.', spacing: 0.7 },
  numbness: { id: 'numbness', label: 'Numbness', description: 'A grid of dots that fades in and out, like signal dropping.', spacing: 1.4 },
};

export const PALETTE = ['#d9605a', '#7c6bc4', '#4a8aa6', '#d49a4a', '#b5527f', '#5d6b80'] as const;

export const DEFAULT_BRUSH: BrushSettings = {
  pattern: 'aching',
  color: PALETTE[0],
  intensity: 0.7,
  radius: 28,
  speed: 1,
};

export const MIN_RADIUS = 6;
export const MAX_RADIUS = 60;
export const MIN_SPEED = 0;
export const MAX_SPEED = 2.5;

import { describe, expect, it } from 'vitest';
import { mulberry32 } from './rng';
import { resample } from './stamps';

describe('resample', () => {
  it('returns the single point for a click', () => {
    expect(resample([{ x: 5, y: 5 }], 3)).toEqual([{ x: 5, y: 5 }]);
  });

  it('spaces stamps evenly along a segment', () => {
    const out = resample([{ x: 0, y: 0 }, { x: 10, y: 0 }], 2);
    expect(out.map((p) => p.x)).toEqual([0, 2, 4, 6, 8, 10]);
  });

  it('carries spacing across segments', () => {
    const out = resample([{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 10, y: 0 }], 2);
    expect(out.map((p) => p.x)).toEqual([0, 2, 4, 6, 8, 10]);
  });

  it('does not depend on how finely the pointer was sampled', () => {
    const coarse = resample([{ x: 0, y: 0 }, { x: 20, y: 0 }], 4);
    const fine = resample(Array.from({ length: 21 }, (_, i) => ({ x: i, y: 0 })), 4);
    expect(fine.map((p) => Math.round(p.x))).toEqual(coarse.map((p) => Math.round(p.x)));
  });

  it('handles an empty path', () => {
    expect(resample([], 3)).toEqual([]);
  });
});

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('differs between seeds and stays in [0, 1)', () => {
    const a = mulberry32(1)();
    const b = mulberry32(2)();
    expect(a).not.toBe(b);
    for (const v of [a, b]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

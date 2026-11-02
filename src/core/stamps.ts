import type { Point } from './types';

/**
 * Walk a polyline and return points spaced `spacing` apart (always includes
 * the first point). Spacing carries across segments so stamp density does not
 * depend on how often the pointer reported a position.
 */
export function resample(points: Point[], spacing: number): Point[] {
  if (points.length === 0) return [];
  const step = Math.max(spacing, 0.5);
  const out: Point[] = [points[0]];
  let carry = 0; // distance travelled since the last stamp
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (seg === 0) continue;
    let d = step - carry;
    while (d <= seg) {
      const t = d / seg;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      d += step;
    }
    carry = seg - (d - step);
  }
  return out;
}

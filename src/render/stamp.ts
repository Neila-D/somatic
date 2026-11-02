import { PATTERN_INFO } from '../core/patterns';
import { mulberry32 } from '../core/rng';
import { resample } from '../core/stamps';
import type { PatternId, Point, Stroke } from '../core/types';

const TAU = Math.PI * 2;

function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a.toFixed(3)})`;
}

/** Draw one stamp of a pattern. Coordinates are model units. */
function drawStamp(
  ctx: CanvasRenderingContext2D,
  pattern: PatternId,
  p: Point,
  r: number,
  color: string,
  k: number,
  rand: () => number,
): void {
  ctx.save();
  switch (pattern) {
    case 'glow': {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, rgba(color, 0.3 * k));
      g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, TAU);
      ctx.fill();
      break;
    }
    case 'pulse': {
      ctx.lineWidth = 1.6;
      [0.34, 0.68, 1].forEach((f, i) => {
        ctx.strokeStyle = rgba(color, (0.95 - i * 0.22) * k);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * f, 0, TAU);
        ctx.stroke();
      });
      ctx.fillStyle = rgba(color, 0.6 * k);
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1.5, r * 0.1), 0, TAU);
      ctx.fill();
      break;
    }
    case 'particles': {
      const n = Math.min(80, Math.round(((r * r) / 40) * (0.3 + k)));
      for (let i = 0; i < n; i++) {
        const a = rand() * TAU;
        const d = Math.sqrt(rand()) * r;
        const size = 0.8 + rand() * 1.6;
        ctx.fillStyle = rgba(color, (0.35 + 0.6 * rand()) * k);
        ctx.beginPath();
        ctx.arc(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, size, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'angular': {
      const n = 5 + Math.round(k * 6);
      ctx.fillStyle = rgba(color, 0.4 + 0.45 * k);
      for (let i = 0; i < n; i++) {
        const a = rand() * TAU;
        const len = r * (0.5 + rand() * 0.6);
        const w = 1.2 + rand() * 1.8;
        const dx = Math.cos(a);
        const dy = Math.sin(a);
        ctx.beginPath();
        ctx.moveTo(p.x - dy * w, p.y + dx * w);
        ctx.lineTo(p.x + dy * w, p.y - dx * w);
        ctx.lineTo(p.x + dx * len, p.y + dy * len);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'wavy': {
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, TAU);
      ctx.clip();
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.strokeStyle = rgba(color, 0.85 * k);
      const amp = Math.max(2, r * 0.16);
      for (let row = -2; row <= 2; row++) {
        const y0 = p.y + row * r * 0.4;
        ctx.beginPath();
        for (let x = p.x - r; x <= p.x + r; x += 2) {
          const y = y0 + Math.sin(x * 0.14) * amp;
          if (x === p.x - r) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
    }
    case 'crosshatch': {
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, TAU);
      ctx.clip();
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = rgba(color, 0.6 * k);
      const gap = 5;
      const lo = Math.floor((p.x - r) / gap) * gap;
      const hi = p.x + r + gap;
      ctx.beginPath();
      // World-anchored grid so overlapping stamps line up instead of moiré.
      for (let c = Math.floor((p.x + p.y - 2 * r) / gap) * gap; c <= p.x + p.y + 2 * r; c += gap) {
        ctx.moveTo(lo, c - lo);
        ctx.lineTo(hi, c - hi);
      }
      for (let c = Math.floor((p.x - p.y - 2 * r) / gap) * gap; c <= p.x - p.y + 2 * r; c += gap) {
        ctx.moveTo(lo, lo - c);
        ctx.lineTo(hi, hi - c);
      }
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

/** Draw a whole stroke. Deterministic: same stroke data => same pixels. */
export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke): void {
  const { pattern, color, intensity, radius } = stroke.brush;
  const rand = mulberry32(stroke.seed);
  const stamps = resample(stroke.points, radius * PATTERN_INFO[pattern].spacing);
  for (const p of stamps) drawStamp(ctx, pattern, p, radius, color, intensity, rand);
}

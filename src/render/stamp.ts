import { PATTERN_INFO } from '../core/patterns';
import { mulberry32 } from '../core/rng';
import { resample } from '../core/stamps';
import type { PatternId, Point, Stroke } from '../core/types';

const TAU = Math.PI * 2;
const frac = (x: number) => x - Math.floor(x);

function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a.toFixed(3)})`;
}

/** Blend hex colour `a` toward `b` by f (0..1). */
function mix(a: string, b: string, f: number): string {
  const x = parseInt(a.slice(1), 16);
  const y = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(((x >> shift) & 255) * (1 - f) + ((y >> shift) & 255) * f);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}

function circle(ctx: CanvasRenderingContext2D, p: Point, r: number): void {
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, TAU);
}

/** Motion state for one stamp. `tau` is animation time (seconds x speed). */
interface Motion {
  tau: number;
  idx: number;
  seed: number;
}

/**
 * Draw one stamp. Static randomness comes from `rand` (same number of calls
 * every frame, so marks look identical at any moment). Motion comes only from
 * `m.tau`, so a still brush (speed 0) is simply a frozen frame.
 */
function drawStamp(
  ctx: CanvasRenderingContext2D,
  pattern: PatternId,
  p: Point,
  r: number,
  color: string,
  k: number,
  rand: () => number,
  m: Motion,
): void {
  const { tau, idx } = m;
  ctx.save();
  switch (pattern) {
    case 'aching': {
      // slow breathing
      const breath = 0.5 + 0.5 * Math.sin(tau * TAU * 0.22);
      const rr = r * (0.96 + 0.06 * breath);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr);
      g.addColorStop(0, rgba(color, 0.3 * k * (0.78 + 0.22 * breath)));
      g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g;
      circle(ctx, p, rr);
      ctx.fill();
      break;
    }
    case 'throbbing': {
      // double-beat, like a pulse; plus a ring that expands and fades
      const phi = frac(tau * 0.9);
      const beat = Math.min(1, Math.exp(-((phi / 0.1) ** 2)) + 0.6 * Math.exp(-(((phi - 0.28) / 0.1) ** 2)));
      ctx.lineWidth = 1.6;
      [0.34, 0.68, 1].forEach((f, i) => {
        ctx.strokeStyle = rgba(color, (0.95 - i * 0.22) * k * (0.6 + 0.4 * beat));
        circle(ctx, p, r * f * (0.88 + 0.14 * beat));
        ctx.stroke();
      });
      ctx.strokeStyle = rgba(color, (1 - phi) * 0.8 * k);
      circle(ctx, p, r * (0.2 + 0.9 * phi));
      ctx.stroke();
      ctx.fillStyle = rgba(color, 0.6 * k);
      circle(ctx, p, Math.max(1.5, r * 0.1 * (1 + 0.6 * beat)));
      ctx.fill();
      break;
    }
    case 'burning': {
      // layered gradients that flicker and rise, hotter toward the core
      for (let j = 0; j < 3; j++) {
        const f = j / 2;
        const flick =
          0.75 + 0.25 * Math.sin(tau * (9 + j * 3.3) + idx * 1.9 + j * 2.7) * Math.sin(tau * (5.1 + j) + idx * 0.7);
        const cx = p.x + Math.sin(tau * (2.1 + j * 0.9) + idx * 1.3 + j * 1.7) * r * 0.1;
        const cy = p.y - r * 0.06 * (1 + Math.sin(tau * (3 + j) + idx + j)) - r * 0.04 * j;
        const rr = r * (1 - 0.38 * f) * (1 + 0.07 * Math.sin(tau * (6 + j * 2) + idx * 2.1));
        const col = mix(color, '#ffd98a', f * 0.7);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
        g.addColorStop(0, rgba(col, (0.3 + 0.12 * f) * k * flick));
        g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g;
        circle(ctx, { x: cx, y: cy }, rr);
        ctx.fill();
      }
      break;
    }
    case 'stabbing': {
      // each spike snaps out quickly, then slowly recoils
      const n = 5 + Math.round(k * 6);
      for (let i = 0; i < n; i++) {
        const a = rand() * TAU;
        const len0 = r * (0.5 + rand() * 0.6);
        const w = 1.2 + rand() * 1.8;
        const ph = rand();
        const u = frac(tau * 1.1 + ph);
        const snap = u < 0.12 ? u / 0.12 : 1 - ((u - 0.12) / 0.88) * 0.6;
        const len = len0 * (0.45 + 0.55 * snap);
        const dx = Math.cos(a);
        const dy = Math.sin(a);
        ctx.fillStyle = rgba(color, (0.4 + 0.45 * k) * (0.55 + 0.45 * snap));
        ctx.beginPath();
        ctx.moveTo(p.x - dy * w, p.y + dx * w);
        ctx.lineTo(p.x + dy * w, p.y - dx * w);
        ctx.lineTo(p.x + dx * len, p.y + dy * len);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'shooting': {
      // jagged bolts that re-form several times a second and flash in bursts
      const step = Math.floor(tau * 7);
      const rr = mulberry32((m.seed ^ Math.imul(idx + 1, 2654435761) ^ Math.imul(step, 40503)) >>> 0);
      const gate = frac(tau * 1.3 + idx * 0.37 + (m.seed % 97) / 97);
      const power = gate < 0.65 ? 1 : 0.15;
      const bolts = 2 + Math.round(k * 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let b = 0; b < bolts; b++) {
        let x = p.x;
        let y = p.y;
        let ang = rr() * TAU;
        const segs = 3 + Math.floor(rr() * 3);
        const pts: Point[] = [{ x, y }];
        for (let s = 0; s < segs; s++) {
          ang += (rr() - 0.5) * 1.4;
          const len = (r / segs) * (0.8 + rr() * 0.7);
          x += Math.cos(ang) * len;
          y += Math.sin(ang) * len;
          pts.push({ x, y });
        }
        const bi = 1 + Math.floor(rr() * (segs - 1));
        const bAng = ang + (rr() - 0.5) * 2.2;
        const branch: Point[] = [pts[bi], { x: pts[bi].x + Math.cos(bAng) * r * 0.35, y: pts[bi].y + Math.sin(bAng) * r * 0.35 }];
        for (const [path, wide, thin] of [
          [pts, 3.2, 1.1],
          [branch, 2.4, 0.8],
        ] as [Point[], number, number][]) {
          ctx.beginPath();
          ctx.moveTo(path[0].x, path[0].y);
          for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
          ctx.lineWidth = wide;
          ctx.strokeStyle = rgba(color, 0.18 * k * power);
          ctx.stroke();
          ctx.lineWidth = thin;
          ctx.strokeStyle = rgba(mix(color, '#ffffff', 0.35), 0.9 * k * power);
          ctx.stroke();
        }
      }
      break;
    }
    case 'tingling': {
      // scattered points that twinkle and wander slightly
      const n = Math.min(80, Math.round(((r * r) / 40) * (0.3 + k)));
      for (let i = 0; i < n; i++) {
        const a = rand() * TAU;
        const d = Math.sqrt(rand()) * r;
        const size = 0.8 + rand() * 1.6;
        const ph = rand() * TAU;
        const sp = 0.5 + rand();
        const twinkle = 0.5 + 0.5 * Math.sin(tau * TAU * 0.5 * sp + ph);
        const x = p.x + Math.cos(a) * d + Math.sin(tau * 1.3 * sp + ph) * 1.6;
        const y = p.y + Math.sin(a) * d + Math.cos(tau * 1.1 * sp + ph) * 1.6;
        ctx.fillStyle = rgba(color, (0.15 + 0.85 * twinkle) * k);
        circle(ctx, { x, y }, size);
        ctx.fill();
      }
      break;
    }
    case 'pressure': {
      // dense crosshatch that tightens and relaxes, with a squeezing outline
      const squeeze = 0.5 + 0.5 * Math.sin(tau * TAU * 0.3);
      const haze = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      haze.addColorStop(0, rgba(color, 0.14 * k * (0.6 + 0.4 * (1 - squeeze))));
      haze.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = haze;
      circle(ctx, p, r);
      ctx.fill();

      ctx.strokeStyle = rgba(color, 0.5 * k);
      ctx.lineWidth = 1.2;
      circle(ctx, p, r * (0.95 - 0.04 * (1 - squeeze)));
      ctx.stroke();

      circle(ctx, p, r);
      ctx.clip();
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = rgba(color, 0.6 * k * (0.7 + 0.3 * (1 - squeeze)));
      const gap = 4 + 3 * squeeze;
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
    case 'radiating': {
      // wavy lines with waves travelling along them
      circle(ctx, p, r);
      ctx.clip();
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.strokeStyle = rgba(color, 0.85 * k);
      const amp = Math.max(2, r * 0.16) * (0.85 + 0.15 * Math.sin(tau * 1.3));
      for (let row = -2; row <= 2; row++) {
        const y0 = p.y + row * r * 0.4;
        ctx.beginPath();
        for (let x = p.x - r; x <= p.x + r; x += 2) {
          const y = y0 + Math.sin(x * 0.14 - tau * TAU * 0.45) * amp;
          if (x === p.x - r) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
    }
    case 'numbness': {
      // a grid of dots whose brightness rolls across it, like signal dropping out
      const haze = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      haze.addColorStop(0, rgba(color, 0.1 * k));
      haze.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = haze;
      circle(ctx, p, r);
      ctx.fill();

      const gap = Math.max(4.5, r / 6);
      const buckets = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      const r2 = r * r;
      for (let gx = Math.floor((p.x - r) / gap); gx <= Math.ceil((p.x + r) / gap); gx++) {
        for (let gy = Math.floor((p.y - r) / gap); gy <= Math.ceil((p.y + r) / gap); gy++) {
          const x = gx * gap;
          const y = gy * gap;
          if ((x - p.x) ** 2 + (y - p.y) ** 2 > r2) continue;
          const wave = 0.5 + 0.5 * Math.sin(tau * TAU * 0.18 + (gx + gy) * 0.45);
          buckets[Math.min(3, Math.floor(wave * 4))].rect(x - 0.8, y - 0.8, 1.6, 1.6);
        }
      }
      buckets.forEach((path, b) => {
        ctx.fillStyle = rgba(color, (0.1 + 0.2 * b) * k * 1.4);
        ctx.fill(path);
      });
      break;
    }
  }
  ctx.restore();
}

/**
 * Draw a whole stroke at time `t` seconds. Deterministic: same stroke data
 * and same time give the same pixels.
 */
export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, t = 0): void {
  const { pattern, color, intensity, radius, speed } = stroke.brush;
  const rand = mulberry32(stroke.seed);
  const stamps = resample(stroke.points, radius * PATTERN_INFO[pattern].spacing);
  const tau = t * speed;
  stamps.forEach((p, idx) => drawStamp(ctx, pattern, p, radius, color, intensity, rand, { tau, idx, seed: stroke.seed }));
}

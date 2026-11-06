import { VIEW_WIDTH } from '../core/types';
import type { Point, ViewId } from '../core/types';

/**
 * Simplified body silhouette in model space (300 x 700), built as ONE outline
 * so it can be used both to draw the body and to clip/hit-test paint.
 * The right half is defined; the left half is its mirror, traversed in
 * reverse so the whole outline has a single winding direction.
 */
interface Seg {
  /** Bezier control points (x1, y1, x2, y2). Omit for a straight line. */
  c?: [number, number, number, number];
  p: [number, number];
}

const START: [number, number] = [163, 118];
const RIGHT: Seg[] = [
  { c: [180, 117, 200, 122], p: [206, 134] }, // neck base to shoulder
  { c: [226, 136, 238, 160], p: [242, 190] }, // outer upper arm
  { p: [254, 292] }, // outer forearm
  { c: [256, 312, 252, 330], p: [244, 344] }, // hand
  { c: [238, 352, 224, 350], p: [222, 340] },
  { c: [220, 322, 218, 304], p: [212, 286] }, // inner forearm
  { p: [196, 208] }, // armpit
  { p: [199, 300] }, // torso side to hip
  { c: [200, 360, 202, 430], p: [201, 470] }, // outer thigh
  { c: [201, 520, 191, 580], p: [190, 640] }, // outer calf
  { c: [190, 652, 190, 662], p: [192, 672] },
  { p: [158, 672] }, // sole of foot
  { c: [160, 660, 160, 652], p: [160, 640] },
  { c: [158, 580, 152, 520], p: [152, 470] }, // inner leg
  { p: [152, 306] },
  { p: [150, 304] }, // crotch
];

const FILL = '#ececf2';
const EDGE = '#d4d4e0';

let cached: Path2D | null = null;

/** The whole body (head, neck, torso, arms, legs) as one Path2D. */
export function bodyOutline(): Path2D {
  if (cached) return cached;
  const path = new Path2D();
  const mx = (x: number) => VIEW_WIDTH - x;

  path.moveTo(START[0], START[1]);
  for (const s of RIGHT) {
    if (s.c) path.bezierCurveTo(s.c[0], s.c[1], s.c[2], s.c[3], s.p[0], s.p[1]);
    else path.lineTo(s.p[0], s.p[1]);
  }
  const starts: [number, number][] = [START, ...RIGHT.map((s) => s.p)];
  for (let i = RIGHT.length - 1; i >= 0; i--) {
    const s = RIGHT[i];
    const to = starts[i];
    if (s.c) path.bezierCurveTo(mx(s.c[2]), s.c[3], mx(s.c[0]), s.c[1], mx(to[0]), to[1]);
    else path.lineTo(mx(to[0]), to[1]);
  }
  path.closePath();

  path.roundRect(137, 92, 26, 32, 6); // neck
  path.moveTo(179, 62);
  path.ellipse(150, 62, 29, 37, 0, 0, Math.PI * 2); // head
  cached = path;
  return path;
}

export function drawBody(ctx: CanvasRenderingContext2D, view: ViewId): void {
  const outline = bodyOutline();
  ctx.save();
  ctx.lineJoin = 'round';
  // Stroke first, then fill: the fill hides the inner half of the line, so
  // overlaps (neck into head) leave no stray edges.
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = EDGE;
  ctx.stroke(outline);
  ctx.fillStyle = FILL;
  ctx.fill(outline);

  ctx.strokeStyle = '#d2d2de';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  if (view === 'posterior') {
    ctx.moveTo(150, 124);
    ctx.lineTo(150, 300);
  } else {
    ctx.moveTo(150, 126);
    ctx.lineTo(150, 168);
  }
  ctx.stroke();
  ctx.restore();
}

let hitCtx: CanvasRenderingContext2D | null = null;

/** True if a model-space point lies on the body silhouette. */
export function isOnBody(p: Point): boolean {
  if (!hitCtx) hitCtx = document.createElement('canvas').getContext('2d');
  return hitCtx ? hitCtx.isPointInPath(bodyOutline(), p.x, p.y) : false;
}

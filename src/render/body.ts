import { VIEW_WIDTH } from '../core/types';
import type { ViewId } from '../core/types';

/**
 * Simplified body silhouette in model space (300 x 700). One side is defined
 * and mirrored across x = 150.
 */
const ARM = 'M96 132 C74 136 62 160 58 190 L46 292 C44 312 48 330 56 344 C62 352 76 350 78 340 C80 322 82 304 88 286 L104 208 Z';
const LEG =
  'M104 296 L148 300 L148 470 C148 520 142 580 140 640 C140 656 140 662 142 672 L108 672 C110 660 110 650 110 640 C108 580 100 520 100 470 Z';
const TORSO =
  'M104 126 C120 118 180 118 196 126 C208 130 206 150 202 180 L198 300 C175 312 125 312 102 300 L98 180 C94 150 92 130 104 126 Z';

const FILL = '#ececf2';
const EDGE = '#d9d9e4';

export function drawBody(ctx: CanvasRenderingContext2D, view: ViewId): void {
  ctx.save();
  ctx.fillStyle = FILL;
  ctx.strokeStyle = EDGE;
  ctx.lineWidth = 1.2;
  ctx.lineJoin = 'round';

  const arm = new Path2D(ARM);
  const leg = new Path2D(LEG);
  for (const mirrored of [false, true]) {
    ctx.save();
    if (mirrored) {
      ctx.translate(VIEW_WIDTH, 0);
      ctx.scale(-1, 1);
    }
    ctx.fill(leg);
    ctx.stroke(leg);
    ctx.fill(arm);
    ctx.stroke(arm);
    ctx.restore();
  }

  const torso = new Path2D(TORSO);
  ctx.fill(torso);
  ctx.stroke(torso);

  // neck
  ctx.beginPath();
  ctx.roundRect(137, 94, 26, 30, 6);
  ctx.fill();
  ctx.stroke();

  // head
  ctx.beginPath();
  ctx.ellipse(150, 62, 29, 37, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // subtle landmarks
  ctx.strokeStyle = '#d2d2de';
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

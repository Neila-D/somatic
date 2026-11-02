import { VIEW_HEIGHT, VIEW_WIDTH, VIEWS } from '../core/types';
import type { Project, ViewId } from '../core/types';
import { drawBody } from './body';
import { drawStroke } from './stamp';

/** Draw the body and all visible strokes for one view, in model space. */
export function renderView(ctx: CanvasRenderingContext2D, project: Project, view: ViewId): void {
  drawBody(ctx, view);
  const hidden = new Set(project.layers.filter((l) => !l.visible).map((l) => l.id));
  for (const stroke of project.strokes) {
    if (stroke.view === view && !hidden.has(stroke.layerId)) drawStroke(ctx, stroke);
  }
}

/** Render both views side by side to a PNG blob. */
export function exportPng(project: Project, scale = 2): Promise<Blob> {
  const gap = 40;
  const labelH = 40;
  const canvas = document.createElement('canvas');
  canvas.width = (VIEW_WIDTH * 2 + gap * 3) * scale;
  canvas.height = (VIEW_HEIGHT + labelH + gap) * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas is not available.'));
  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  VIEWS.forEach((view, i) => {
    ctx.save();
    ctx.translate(gap + i * (VIEW_WIDTH + gap), labelH);
    ctx.fillStyle = '#5d6b80';
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.fillText(view === 'anterior' ? 'Anterior (front)' : 'Posterior (back)', 0, -14);
    renderView(ctx, project, view);
    ctx.restore();
  });
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create PNG.'))), 'image/png'),
  );
}

import { VIEW_HEIGHT, VIEW_WIDTH } from './types';
import type { Point } from './types';

/** Which part of a body view is visible: a zoom factor and the centre, in model units. */
export interface Viewport {
  zoom: number;
  cx: number;
  cy: number;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 8;
export const DEFAULT_VIEWPORT: Viewport = { zoom: 1, cx: VIEW_WIDTH / 2, cy: VIEW_HEIGHT / 2 };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export interface ViewRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function viewRect(v: Viewport): ViewRect {
  const width = VIEW_WIDTH / v.zoom;
  const height = VIEW_HEIGHT / v.zoom;
  return { left: v.cx - width / 2, top: v.cy - height / 2, width, height };
}

/** Keep the zoom in range and the visible window inside the body view. */
export function clampViewport(v: Viewport): Viewport {
  const zoom = clamp(v.zoom, MIN_ZOOM, MAX_ZOOM);
  const halfW = VIEW_WIDTH / zoom / 2;
  const halfH = VIEW_HEIGHT / zoom / 2;
  return {
    zoom,
    cx: clamp(v.cx, halfW, VIEW_WIDTH - halfW),
    cy: clamp(v.cy, halfH, VIEW_HEIGHT - halfH),
  };
}

/** Convert a position inside the canvas (0..1 on each axis) to model space. */
export function toModel(v: Viewport, u: number, w: number): Point {
  const r = viewRect(v);
  return { x: r.left + u * r.width, y: r.top + w * r.height };
}

/** Zoom by `factor`, keeping the model point under (u, w) fixed on screen. */
export function zoomAt(v: Viewport, factor: number, u: number, w: number): Viewport {
  const anchor = toModel(v, u, w);
  const zoom = clamp(v.zoom * factor, MIN_ZOOM, MAX_ZOOM);
  const width = VIEW_WIDTH / zoom;
  const height = VIEW_HEIGHT / zoom;
  return clampViewport({
    zoom,
    cx: anchor.x - u * width + width / 2,
    cy: anchor.y - w * height + height / 2,
  });
}

/** Move the window by a distance in model units. */
export function panBy(v: Viewport, dx: number, dy: number): Viewport {
  return clampViewport({ ...v, cx: v.cx + dx, cy: v.cy + dy });
}

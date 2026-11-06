import { describe, expect, it } from 'vitest';
import { VIEW_HEIGHT, VIEW_WIDTH } from './types';
import { DEFAULT_VIEWPORT, MAX_ZOOM, MIN_ZOOM, clampViewport, panBy, toModel, viewRect, zoomAt } from './viewport';

describe('viewport', () => {
  it('shows the whole body at zoom 1', () => {
    const r = viewRect(DEFAULT_VIEWPORT);
    expect(r).toEqual({ left: 0, top: 0, width: VIEW_WIDTH, height: VIEW_HEIGHT });
  });

  it('keeps the point under the cursor fixed while zooming', () => {
    const u = 0.3;
    const w = 0.2;
    const before = toModel(DEFAULT_VIEWPORT, u, w);
    const zoomed = zoomAt(DEFAULT_VIEWPORT, 3, u, w);
    const after = toModel(zoomed, u, w);
    expect(zoomed.zoom).toBe(3);
    expect(after.x).toBeCloseTo(before.x, 6);
    expect(after.y).toBeCloseTo(before.y, 6);
  });

  it('keeps the cursor point fixed on a second zoom from an off-centre view', () => {
    const a = zoomAt(DEFAULT_VIEWPORT, 2.5, 0.7, 0.4);
    const before = toModel(a, 0.6, 0.55);
    const b = zoomAt(a, 1.6, 0.6, 0.55);
    const after = toModel(b, 0.6, 0.55);
    expect(after.x).toBeCloseTo(before.x, 6);
    expect(after.y).toBeCloseTo(before.y, 6);
  });

  it('limits zoom to the allowed range', () => {
    expect(zoomAt(DEFAULT_VIEWPORT, 100, 0.5, 0.5).zoom).toBe(MAX_ZOOM);
    expect(zoomAt(DEFAULT_VIEWPORT, 0.001, 0.5, 0.5).zoom).toBe(MIN_ZOOM);
  });

  it('never lets the window leave the body view', () => {
    const v = clampViewport({ zoom: 4, cx: -500, cy: 5000 });
    const r = viewRect(v);
    expect(r.left).toBeGreaterThanOrEqual(0);
    expect(r.top + r.height).toBeLessThanOrEqual(VIEW_HEIGHT + 1e-9);
  });

  it('pans, and cannot pan at zoom 1', () => {
    expect(panBy(DEFAULT_VIEWPORT, 50, 50)).toEqual(DEFAULT_VIEWPORT);
    const z = zoomAt(DEFAULT_VIEWPORT, 4, 0.5, 0.5);
    const moved = panBy(z, 20, -30);
    expect(moved.cx).toBeCloseTo(z.cx + 20);
    expect(moved.cy).toBeCloseTo(z.cy - 30);
  });

  it('maps pointer positions back to the same model point after zooming', () => {
    const z = zoomAt(DEFAULT_VIEWPORT, 4, 0.25, 0.75);
    const p = toModel(z, 0.5, 0.5);
    expect(p.x).toBeCloseTo(z.cx);
    expect(p.y).toBeCloseTo(z.cy);
  });
});

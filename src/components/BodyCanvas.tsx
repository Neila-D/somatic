import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../core/types';
import type { Point, Project, Tool, ViewId } from '../core/types';
import { DEFAULT_VIEWPORT, MAX_ZOOM, MIN_ZOOM, panBy, toModel, viewRect, zoomAt } from '../core/viewport';
import type { Viewport } from '../core/viewport';
import { useTicker } from '../motion';
import { renderView } from '../render/view';

interface Props {
  view: ViewId;
  project: Project;
  tool: Tool;
  /** Whether brush animation is running. */
  playing: boolean;
  onBegin: (view: ViewId, p: Point) => void;
  onMove: (view: ViewId, p: Point) => void;
  onEnd: () => void;
}

export function BodyCanvas({ view, project, tool, playing, onBegin, onMove, onEnd }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [vp, setVp] = useState<Viewport>(DEFAULT_VIEWPORT);
  const latest = useRef({ project, vp });
  latest.current = { project, vp };
  const clock = useRef(0);
  const mode = useRef<'draw' | 'pan' | null>(null);
  const panFrom = useRef<{ x: number; y: number } | null>(null);

  const draw = useCallback(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return; // hidden
    // Backing store follows the on-screen size, so zoomed-in marks stay sharp.
    const w = Math.max(1, Math.round(rect.width * (window.devicePixelRatio || 1)));
    const h = Math.round((w * VIEW_HEIGHT) / VIEW_WIDTH);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const { project: pr, vp: v } = latest.current;
    const r = viewRect(v);
    const s = w / r.width;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.setTransform(s, 0, 0, s, -r.left * s, -r.top * s);
    renderView(ctx, pr, view, clock.current);
  }, [view]);

  useLayoutEffect(() => {
    draw();
  }, [project, vp, draw]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  // Scroll wheel (or trackpad pinch) zooms around the pointer.
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const lines = e.deltaMode === 1 ? 16 : 1;
      const factor = Math.exp(-e.deltaY * lines * (e.ctrlKey ? 0.01 : 0.0015));
      const u = (e.clientX - rect.left) / rect.width;
      const w = (e.clientY - rect.top) / rect.height;
      setVp((v) => zoomAt(v, factor, u, w));
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  const animated = playing && project.strokes.some((s) => s.view === view && s.brush.speed > 0);
  useTicker((dt) => {
    clock.current += dt;
    draw();
  }, animated);

  const pointerModel = (e: React.PointerEvent): Point => {
    const rect = ref.current!.getBoundingClientRect();
    const p = toModel(latest.current.vp, (e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height);
    return { x: Math.max(0, Math.min(VIEW_WIDTH, p.x)), y: Math.max(0, Math.min(VIEW_HEIGHT, p.y)) };
  };

  const finish = () => {
    if (mode.current === 'draw') onEnd();
    mode.current = null;
    panFrom.current = null;
  };

  const zoomButton = (factor: number) => setVp((v) => zoomAt(v, factor, 0.5, 0.5));

  return (
    <div className="canvas-wrap">
      <canvas
        ref={ref}
        className={`body-canvas tool-${tool}`}
        aria-label={`${view === 'anterior' ? 'Front' : 'Back'} body map. Current tool: ${tool}. Scroll to zoom.`}
        onPointerDown={(e) => {
          if (e.button === 1 || (e.button === 0 && tool === 'pan')) {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            mode.current = 'pan';
            panFrom.current = { x: e.clientX, y: e.clientY };
            return;
          }
          if (e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          mode.current = 'draw';
          onBegin(view, pointerModel(e));
        }}
        onPointerMove={(e) => {
          if (mode.current === 'pan' && panFrom.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const r = viewRect(latest.current.vp);
            const dx = ((e.clientX - panFrom.current.x) / rect.width) * r.width;
            const dy = ((e.clientY - panFrom.current.y) / rect.height) * r.height;
            panFrom.current = { x: e.clientX, y: e.clientY };
            setVp((v) => panBy(v, -dx, -dy));
          } else if (mode.current === 'draw') {
            onMove(view, pointerModel(e));
          }
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
      />
      <div className="zoom-ctl" role="group" aria-label={`${view} zoom`}>
        <button onClick={() => zoomButton(1 / 1.5)} disabled={vp.zoom <= MIN_ZOOM} aria-label="Zoom out" title="Zoom out">
          −
        </button>
        <button
          className="zoom-level"
          onClick={() => setVp(DEFAULT_VIEWPORT)}
          disabled={vp.zoom === MIN_ZOOM}
          aria-label="Reset zoom"
          title="Reset zoom"
        >
          {vp.zoom.toFixed(1)}×
        </button>
        <button onClick={() => zoomButton(1.5)} disabled={vp.zoom >= MAX_ZOOM} aria-label="Zoom in" title="Zoom in">
          +
        </button>
      </div>
    </div>
  );
}

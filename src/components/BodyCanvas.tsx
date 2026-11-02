import { useEffect, useRef } from 'react';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../core/types';
import type { Point, Project, Tool, ViewId } from '../core/types';
import { renderView } from '../render/view';

const BACKING_SCALE = 2;

interface Props {
  view: ViewId;
  project: Project;
  tool: Tool;
  onBegin: (view: ViewId, p: Point) => void;
  onMove: (view: ViewId, p: Point) => void;
  onEnd: () => void;
}

export function BodyCanvas({ view, project, tool, onBegin, onMove, onEnd }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const active = useRef(false);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(BACKING_SCALE, BACKING_SCALE);
    renderView(ctx, project, view);
  }, [project, view]);

  const toModel = (e: React.PointerEvent): Point => {
    const rect = ref.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * VIEW_WIDTH;
    const y = ((e.clientY - rect.top) / rect.height) * VIEW_HEIGHT;
    return { x: Math.max(0, Math.min(VIEW_WIDTH, x)), y: Math.max(0, Math.min(VIEW_HEIGHT, y)) };
  };

  return (
    <canvas
      ref={ref}
      className={`body-canvas tool-${tool}`}
      width={VIEW_WIDTH * BACKING_SCALE}
      height={VIEW_HEIGHT * BACKING_SCALE}
      aria-label={`${view === 'anterior' ? 'Front' : 'Back'} body map. Click or drag to ${tool}.`}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        active.current = true;
        onBegin(view, toModel(e));
      }}
      onPointerMove={(e) => {
        if (active.current) onMove(view, toModel(e));
      }}
      onPointerUp={() => {
        if (!active.current) return;
        active.current = false;
        onEnd();
      }}
      onPointerCancel={() => {
        if (!active.current) return;
        active.current = false;
        onEnd();
      }}
    />
  );
}

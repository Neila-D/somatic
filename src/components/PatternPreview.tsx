import { useEffect, useRef } from 'react';
import type { PatternId, Stroke } from '../core/types';
import { drawStroke } from '../render/stamp';

interface Props {
  pattern: PatternId;
  color: string;
  intensity: number;
  radius?: number;
  width?: number;
  height?: number;
}

const SCALE = 2;

/** Small canvas showing a short sample stroke of a pattern. */
export function PatternPreview({ pattern, color, intensity, radius = 14, width = 64, height = 44 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(SCALE, SCALE);
    const stroke: Stroke = {
      id: 'preview',
      layerId: 'preview',
      view: 'anterior',
      brush: { pattern, color, intensity, radius },
      points: [
        { x: width / 2 - 4, y: height / 2 },
        { x: width / 2 + 4, y: height / 2 },
      ],
      seed: 7,
    };
    drawStroke(ctx, stroke);
  }, [pattern, color, intensity, radius, width, height]);

  return (
    <canvas
      ref={ref}
      width={width * SCALE}
      height={height * SCALE}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

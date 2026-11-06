import { useCallback, useEffect, useRef } from 'react';
import type { PatternId, Stroke } from '../core/types';
import { useTicker } from '../motion';
import { drawStroke } from '../render/stamp';

interface Props {
  pattern: PatternId;
  color: string;
  intensity: number;
  speed?: number;
  radius?: number;
  width?: number;
  height?: number;
  /** Run the animation. When false the preview shows a still frame. */
  animate?: boolean;
}

const SCALE = 2;

/** Small canvas showing a short sample stroke of a brush, animated. */
export function PatternPreview({
  pattern,
  color,
  intensity,
  speed = 1,
  radius = 14,
  width = 64,
  height = 44,
  animate = true,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const clock = useRef(0);

  const draw = useCallback(() => {
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
      brush: { pattern, color, intensity, radius, speed },
      points: [
        { x: width / 2 - 4, y: height / 2 },
        { x: width / 2 + 4, y: height / 2 },
      ],
      seed: 7,
    };
    drawStroke(ctx, stroke, clock.current);
  }, [pattern, color, intensity, radius, speed, width, height]);

  useEffect(() => {
    draw();
  }, [draw]);

  useTicker(
    (dt) => {
      clock.current += dt;
      draw();
    },
    animate && speed > 0,
  );

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

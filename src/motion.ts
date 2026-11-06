import { useEffect, useRef } from 'react';

/** True if the person has asked their system to reduce motion. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Call `cb(dtSeconds)` about `fps` times a second while `enabled`.
 * The callback may change every render without restarting the loop.
 */
export function useTicker(cb: (dt: number) => void, enabled: boolean, fps = 30): void {
  const latest = useRef(cb);
  latest.current = cb;
  useEffect(() => {
    if (!enabled) return;
    const minGap = 1000 / fps;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const gap = now - last;
      if (gap >= minGap) {
        last = now;
        latest.current(Math.min(gap, 100) / 1000);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, fps]);
}

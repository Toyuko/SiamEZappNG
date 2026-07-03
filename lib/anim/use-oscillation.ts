import { useEffect } from 'react';
import { type SharedValue, useSharedValue } from 'react-native-reanimated';

/**
 * Returns a shared value that smoothly oscillates between 0 → 1 → 0 forever,
 * driven by `requestAnimationFrame`. We use rAF rather than reanimated's
 * `withRepeat` because infinite repeats don't run reliably on react-native-web.
 *
 * @param durationMs full 0→1→0 cycle length
 * @param phaseOffset 0..1 starting offset (use to stagger multiple animators)
 */
export function useOscillation(durationMs = 3000, phaseOffset = 0): SharedValue<number> {
  const value = useSharedValue(0);

  useEffect(() => {
    let raf = 0;
    let start = 0;
    const loop = (ts: number) => {
      if (!start) {
        start = ts - phaseOffset * durationMs;
      }
      const phase = ((((ts - start) % durationMs) + durationMs) % durationMs) / durationMs;
      value.value = 0.5 - 0.5 * Math.cos(phase * 2 * Math.PI);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [durationMs, phaseOffset, value]);

  return value;
}

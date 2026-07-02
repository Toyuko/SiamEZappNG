import { useEffect, useMemo, useState } from 'react';
import { Text, type TextStyle, type StyleProp } from 'react-native';

type CountUpProps = {
  /** Full label to animate, e.g. "1000+", "10+", "100%". */
  value: string;
  duration?: number;
  delay?: number;
  className?: string;
  style?: StyleProp<TextStyle>;
};

/**
 * Animates the numeric portion of a label from 0 to its target on mount, keeping
 * any prefix/suffix (e.g. "+", "%"). Uses `requestAnimationFrame` so it works on
 * both native and web.
 */
export function CountUp({ value, duration = 1100, delay = 200, className, style }: CountUpProps) {
  const parsed = useMemo(() => {
    const match = value.match(/[\d.,]+/);
    if (!match) {
      return { target: 0, prefix: value, suffix: '', decimals: 0 };
    }
    const numStr = match[0];
    const index = match.index ?? 0;
    const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
    return {
      target: parseFloat(numStr.replace(/,/g, '')) || 0,
      prefix: value.slice(0, index),
      suffix: value.slice(index + numStr.length),
      decimals,
    };
  }, [value]);

  const { target, prefix, suffix, decimals } = parsed;
  const format = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;
  const [display, setDisplay] = useState(() => format(0));

  useEffect(() => {
    let raf = 0;
    let startTime = 0;
    const timer = setTimeout(() => {
      const step = (ts: number) => {
        if (!startTime) {
          startTime = ts;
        }
        const t = Math.min(1, (ts - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(format(target * eased));
        if (t < 1) {
          raf = requestAnimationFrame(step);
        } else {
          setDisplay(format(target));
        }
      };
      raf = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, prefix, suffix, decimals, duration, delay]);

  return (
    <Text className={className} style={style}>
      {display}
    </Text>
  );
}

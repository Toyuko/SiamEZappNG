import type { ReactNode } from 'react';
import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

type FadeInViewProps = {
  children: ReactNode;
  /** Delay before the entrance starts (ms) — use for staggering. */
  delay?: number;
  /** Entrance duration (ms). */
  duration?: number;
  /** Vertical travel distance (px). Positive rises up, negative drops down. */
  distance?: number;
  /** Start slightly scaled for a subtle "pop". */
  scaleFrom?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Lightweight mount entrance (fade + rise + optional pop). Uses timing-based
 * shared values (rather than layout animations) so it behaves consistently on
 * both native and web.
 */
export function FadeInView({
  children,
  delay = 0,
  duration = 480,
  distance = 18,
  scaleFrom = 1,
  className,
  style,
}: FadeInViewProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
  }, [delay, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * distance },
      { scale: scaleFrom + (1 - scaleFrom) * progress.value },
    ],
  }));

  return (
    <Animated.View className={className} style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

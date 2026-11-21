import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '../../lib/theme/motion';
import { heroGradient, siam } from '../../lib/theme/tokens';

const LOGO = require('../../assets/brand/siamez-logo-circle.png');

const FULL_EXIT_MS = 420;
const BRIEF_EXIT_MS = 280;
const BRIEF_EXIT_DELAY_MS = 180;
const FULL_HOLD_MS = 520;

type LaunchAnimationProps = {
  /** App bootstrap (auth + fonts) is finished — play the reveal / exit sequence. */
  ready: boolean;
  /** Full branded sequence for login; brief pulse for returning users. */
  variant: 'full' | 'brief';
  onComplete: () => void;
};

/**
 * Lightweight branded splash — gradient + logo (no video on cold start).
 */
export function LaunchAnimation({ ready, variant, onComplete }: LaunchAnimationProps) {
  const isFull = variant === 'full';
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const completedRef = useRef(false);
  const notifyComplete = useCallback(() => {
    if (completedRef.current) {
      return;
    }
    completedRef.current = true;
    onCompleteRef.current();
  }, []);

  const overlay = useSharedValue(1);
  const logoScale = useSharedValue(0.88);
  const logoOpacity = useSharedValue(0);
  const wordmarkOpacity = useSharedValue(0);
  const accentOpacity = useSharedValue(0);
  const exitStarted = useRef(false);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: motion.heroEntrance - 100, easing: Easing.out(Easing.cubic) });
    wordmarkOpacity.value = withDelay(160, withTiming(1, { duration: 280 }));
    accentOpacity.value = withDelay(280, withTiming(1, { duration: 240 }));
  }, [accentOpacity, logoOpacity, logoScale, wordmarkOpacity]);

  useEffect(() => {
    if (!ready || exitStarted.current) {
      return;
    }

    exitStarted.current = true;

    const finish = (finished?: boolean) => {
      'worklet';
      if (finished === false) {
        return;
      }
      runOnJS(notifyComplete)();
    };

    const exitDelay = isFull ? FULL_HOLD_MS : BRIEF_EXIT_DELAY_MS;
    const exitDuration = isFull ? FULL_EXIT_MS : BRIEF_EXIT_MS;

    overlay.value = withDelay(
      exitDelay,
      withTiming(0, { duration: exitDuration, easing: Easing.inOut(Easing.cubic) }, finish),
    );
  }, [isFull, notifyComplete, overlay, ready]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlay.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
  }));

  const accentStyle = useAnimatedStyle(() => ({
    opacity: accentOpacity.value,
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, overlayStyle]}
      pointerEvents={ready ? 'none' : 'auto'}
    >
      <LinearGradient
        colors={[...heroGradient.colors]}
        start={heroGradient.start}
        end={heroGradient.end}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.wave} pointerEvents="none" />
      <Animated.View style={[styles.content, logoStyle]}>
        <Image source={LOGO} style={styles.logo} accessibilityIgnoresInvertColors />
        <Animated.Text style={[styles.wordmark, wordmarkStyle]}>SiamEZ</Animated.Text>
        <Animated.Text style={[styles.tagline, accentStyle]}>Making life in Thailand EZ</Animated.Text>
        <Animated.View style={[styles.accentBar, accentStyle]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: '#052A70',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '28%',
    backgroundColor: 'rgba(16, 44, 118, 0.55)',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  wordmark: {
    marginTop: 18,
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  tagline: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '500',
    color: siam.yellow.DEFAULT,
    textAlign: 'center',
  },
  accentBar: {
    marginTop: 16,
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: siam.yellow.DEFAULT,
  },
});

import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { t } from '../../lib/i18n/i18n';
import { heroGradient, siam } from '../../lib/theme/tokens';

const LOGO_SIZE = 96;
const FULL_HOLD_MS = 900;
const FULL_EXIT_MS = 750;
const BRIEF_EXIT_MS = 500;

type LaunchAnimationProps = {
  /** App bootstrap (auth + fonts) is finished — play the reveal / exit sequence. */
  ready: boolean;
  /** Full branded sequence for login; brief pulse for returning users. */
  variant: 'full' | 'brief';
  onComplete: () => void;
};

/**
 * Branded cold-start overlay: gradient, logo reveal, tagline, then a soft fade
 * that hands off to the screen underneath (login or home).
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
  const logoScale = useSharedValue(0.9);
  const logoOpacity = useSharedValue(1);
  const ringScale = useSharedValue(0.6);
  const ringOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(14);
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(10);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withSequence(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
    );
  }, [shimmer]);

  useEffect(() => {
    if (!ready) {
      logoScale.value = withRepeat(
        withSequence(
          withTiming(0.94, { duration: 900, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      );
      return () => {
        cancelAnimation(logoScale);
      };
    }

    const finish = (finished?: boolean) => {
      'worklet';
      if (finished === false) {
        return;
      }
      runOnJS(notifyComplete)();
    };

    cancelAnimation(logoScale);
    cancelAnimation(overlay);

    if (isFull) {
      logoScale.value = withSequence(
        withTiming(1.06, { duration: 520, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 280, easing: Easing.inOut(Easing.quad) }),
      );
      logoOpacity.value = withTiming(1, { duration: 400 });

      ringScale.value = withDelay(
        280,
        withTiming(1.65, { duration: 900, easing: Easing.out(Easing.cubic) }),
      );
      ringOpacity.value = withDelay(
        280,
        withSequence(
          withTiming(0.45, { duration: 200 }),
          withTiming(0, { duration: 700, easing: Easing.out(Easing.quad) }),
        ),
      );

      titleOpacity.value = withDelay(520, withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }));
      titleY.value = withDelay(520, withTiming(0, { duration: 480, easing: Easing.out(Easing.cubic) }));

      taglineOpacity.value = withDelay(820, withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }));
      taglineY.value = withDelay(820, withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) }));

      const exitDelay = 520 + 480 + 420 + FULL_HOLD_MS;
      overlay.value = withDelay(
        exitDelay,
        withTiming(0, { duration: FULL_EXIT_MS, easing: Easing.inOut(Easing.cubic) }, finish),
      );
      logoScale.value = withDelay(
        exitDelay,
        withTiming(1.08, { duration: FULL_EXIT_MS, easing: Easing.inOut(Easing.cubic) }),
      );
    } else {
      logoScale.value = withSequence(
        withTiming(1.04, { duration: 320, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 220, easing: Easing.inOut(Easing.quad) }),
      );
      overlay.value = withDelay(
        380,
        withTiming(0, { duration: BRIEF_EXIT_MS, easing: Easing.inOut(Easing.cubic) }, finish),
      );
    }

    return () => {
      cancelAnimation(logoScale);
      cancelAnimation(overlay);
      cancelAnimation(ringScale);
      cancelAnimation(ringOpacity);
      cancelAnimation(titleOpacity);
      cancelAnimation(titleY);
      cancelAnimation(taglineOpacity);
      cancelAnimation(taglineY);
    };
  }, [
    isFull,
    logoOpacity,
    logoScale,
    notifyComplete,
    overlay,
    ready,
    ringOpacity,
    ringScale,
    taglineOpacity,
    taglineY,
    titleOpacity,
    titleY,
  ]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlay.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + shimmer.value * 0.18,
    transform: [{ translateX: -120 + shimmer.value * 240 }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, overlayStyle]} pointerEvents="auto">
      <LinearGradient
        colors={[...heroGradient.colors]}
        start={heroGradient.start}
        end={heroGradient.end}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.shimmer, shimmerStyle]} />

      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Animated.View style={[styles.ring, ringStyle]} />
          <Animated.View style={logoStyle}>
            <Image
              source={require('../../assets/siamez-logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="SiamEZ logo"
            />
          </Animated.View>
        </View>

        {isFull ? (
          <View style={styles.copy}>
            <Animated.Text style={[styles.title, titleStyle]}>SiamEZ</Animated.Text>
            <Animated.Text style={[styles.tagline, taglineStyle]}>{t('launch.tagline')}</Animated.Text>
          </View>
        ) : null}
      </View>

      {!ready ? (
        <View style={styles.loader}>
          <View style={styles.loaderDot} />
          <View style={[styles.loaderDot, styles.loaderDotMid]} />
          <View style={styles.loaderDot} />
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 9999,
    elevation: 9999,
  },
  shimmer: {
    position: 'absolute',
    top: '18%',
    left: '10%',
    width: '80%',
    height: '42%',
    borderRadius: 999,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoWrap: {
    width: LOGO_SIZE + 48,
    height: LOGO_SIZE + 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: LOGO_SIZE + 20,
    height: LOGO_SIZE + 20,
    borderRadius: (LOGO_SIZE + 20) / 2,
    borderWidth: 2,
    borderColor: siam.yellow.light,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
  },
  copy: {
    alignItems: 'center',
    marginTop: 28,
    gap: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#ffffff',
  },
  tagline: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.82)',
    maxWidth: 280,
  },
  loader: {
    position: 'absolute',
    bottom: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loaderDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  loaderDotMid: {
    backgroundColor: siam.yellow.DEFAULT,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

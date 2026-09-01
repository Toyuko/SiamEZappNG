import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { RankedMatch } from '../../features/matching/matching.types';
import { MatchCardFace } from './MatchCardFace';

const SWIPE_X = 110;
const SWIPE_Y = 95;

type SwipeDeckProps = {
  items: RankedMatch[];
  onLike: (id: string) => void;
  onPass: (id: string) => void;
  onSuper: (id: string) => void;
  onOpenProfile: (id: string) => void;
  programmaticAction?: { type: 'like' | 'pass' | 'super'; token: number } | null;
};

export function SwipeDeck({ items, onLike, onPass, onSuper, onOpenProfile, programmaticAction }: SwipeDeckProps) {
  const { width } = useWindowDimensions();
  const [reduceMotion, setReduceMotion] = useState(false);
  const current = items[0] ?? null;
  const next = items[1] ?? null;

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduceMotion(value);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const leaving = useSharedValue(false);

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    leaving.value = false;
  }, [current?.freelancer.id, leaving, translateX, translateY]);

  const emit = useCallback(
    (type: 'like' | 'pass' | 'super') => {
      if (!current) return;
      if (type === 'like') onLike(current.freelancer.id);
      else if (type === 'pass') onPass(current.freelancer.id);
      else onSuper(current.freelancer.id);
    },
    [current, onLike, onPass, onSuper],
  );

  const flyOff = useCallback(
    (type: 'like' | 'pass' | 'super') => {
      if (!current) return;
      if (reduceMotion) {
        emit(type);
        return;
      }
      const x = type === 'pass' ? -width * 1.2 : type === 'like' ? width * 1.2 : 0;
      const y = type === 'super' ? -720 : -40;
      leaving.value = true;
      translateX.value = withTiming(x, { duration: 240 });
      translateY.value = withTiming(y, { duration: 240 }, (finished) => {
        if (finished) runOnJS(emit)(type);
      });
    },
    [current, emit, leaving, reduceMotion, translateX, translateY, width],
  );

  useEffect(() => {
    if (!programmaticAction || !current) return;
    flyOff(programmaticAction.type);
    // Only the token should retrigger a button-driven swipe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programmaticAction?.token]);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .activeOffsetY([-12, 12])
    .onUpdate((event) => {
      if (leaving.value || reduceMotion) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (leaving.value || reduceMotion) return;
      const absX = Math.abs(event.translationX);
      const absY = Math.abs(event.translationY);
      if (event.translationY < -SWIPE_Y && absY > absX) {
        leaving.value = true;
        translateY.value = withTiming(-720, { duration: 240 }, (finished) => {
          if (finished) runOnJS(emit)('super');
        });
        return;
      }
      if (event.translationX > SWIPE_X) {
        leaving.value = true;
        translateX.value = withTiming(width * 1.2, { duration: 240 }, (finished) => {
          if (finished) runOnJS(emit)('like');
        });
        return;
      }
      if (event.translationX < -SWIPE_X) {
        leaving.value = true;
        translateX.value = withTiming(-width * 1.2, { duration: 240 }, (finished) => {
          if (finished) runOnJS(emit)('pass');
        });
        return;
      }
      translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-220, 0, 220], [-12, 0, 12], Extrapolation.CLAMP);
    return {
      transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { rotate: `${rotate}deg` }],
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [28, 110], [0, 1], Extrapolation.CLAMP),
  }));
  const passStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-110, -28], [1, 0], Extrapolation.CLAMP),
  }));
  const superStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [-110, -40], [1, 0], Extrapolation.CLAMP),
  }));

  if (!current) return <View style={{ flex: 1 }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
      {next ? (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { transform: [{ scale: 0.96 }, { translateY: 14 }], opacity: 0.72 }]}
        >
          <MatchCardFace item={next} />
        </View>
      ) : null}
      <GestureDetector gesture={pan}>
        <Animated.View style={[{ flex: 1 }, cardStyle]}>
          <MatchCardFace item={current} onOpenProfile={() => onOpenProfile(current.freelancer.id)} />
          <Animated.View pointerEvents="none" style={[stampBox('right'), likeStyle]}>
            <Stamp label="LIKE" color="#16a34a" tilt="18deg" />
          </Animated.View>
          <Animated.View pointerEvents="none" style={[stampBox('left'), passStyle]}>
            <Stamp label="PASS" color="#ef4444" tilt="-18deg" />
          </Animated.View>
          <Animated.View pointerEvents="none" style={[stampBox('center'), superStyle]}>
            <Stamp label="SUPER MATCH" color="#7c3aed" tilt="0deg" />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

function stampBox(align: 'left' | 'right' | 'center') {
  return {
    position: 'absolute' as const,
    top: 28,
    left: align === 'left' || align === 'center' ? 18 : undefined,
    right: align === 'right' ? 18 : undefined,
    alignSelf: align === 'center' ? ('center' as const) : undefined,
  };
}

function Stamp({ label, color, tilt }: { label: string; color: string; tilt: string }) {
  return (
    <View
      style={{
        borderWidth: 4,
        borderColor: color,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.92)',
        transform: [{ rotate: tilt }],
      }}
    >
      <Text style={{ color, fontWeight: '900', fontSize: 22, letterSpacing: 1 }}>{label}</Text>
    </View>
  );
}

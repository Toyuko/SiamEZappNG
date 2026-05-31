import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../lib/theme/theme';

const BAR_COUNT = 5;
const BAR_WIDTH = 6;
const BAR_GAP = 5;
const MIN_HEIGHT = 10;
const MAX_HEIGHT = 44;

type VoiceWaveformProps = {
  active: boolean;
};

function WaveBar({ index, active }: { index: number; active: boolean }) {
  const { colors } = useTheme();
  const height = useSharedValue(MIN_HEIGHT);

  useEffect(() => {
    if (!active) {
      cancelAnimation(height);
      height.value = withTiming(MIN_HEIGHT, { duration: 200 });
      return;
    }

    const peak = MAX_HEIGHT - index * 4;
    height.value = withRepeat(
      withSequence(
        withTiming(peak, { duration: 280 + index * 40, easing: Easing.out(Easing.cubic) }),
        withTiming(MIN_HEIGHT + 6, { duration: 260 + index * 30, easing: Easing.in(Easing.cubic) }),
      ),
      -1,
      true,
    );

    return () => {
      cancelAnimation(height);
    };
  }, [active, height, index]);

  const style = useAnimatedStyle(() => ({
    height: height.value,
    width: BAR_WIDTH,
    borderRadius: BAR_WIDTH / 2,
    backgroundColor: colors.primary,
  }));

  return <Animated.View style={style} />;
}

export function VoiceWaveform({ active }: VoiceWaveformProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: BAR_GAP,
        height: MAX_HEIGHT + 8,
      }}
    >
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <WaveBar key={index} index={index} active={active} />
      ))}
    </View>
  );
}

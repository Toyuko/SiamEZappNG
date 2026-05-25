import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

import { t } from '../../lib/i18n/i18n';

type LiveIndicatorProps = {
  active: boolean;
};

export function LiveIndicator({ active }: LiveIndicatorProps) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) {
      pulse.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.35, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [active, pulse]);

  if (!active) {
    return null;
  }

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={t('tracking.liveConnected')}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
    >
      <Animated.View
        style={{
          transform: [{ scale: pulse }],
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#22c55e',
        }}
      />
      <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 12, fontWeight: '600' }}>
        {t('tracking.liveLabel')}
      </Text>
    </View>
  );
}

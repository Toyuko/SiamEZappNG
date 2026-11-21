import { Text, View } from 'react-native';

import { radius, siam } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export type BookingStage = { id: string; label: string };

type BookingProgressProps = {
  stages: BookingStage[];
  currentIndex: number;
};

export function BookingProgress({ stages, currentIndex }: BookingProgressProps) {
  const { colors } = useTheme();
  const safeIndex = Math.max(0, Math.min(currentIndex, stages.length - 1));
  const current = stages[safeIndex];
  const pct =
    stages.length <= 1 ? 100 : Math.round((safeIndex / (stages.length - 1)) * 100);

  return (
    <View
      style={{
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        paddingHorizontal: 14,
        paddingVertical: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>
          {current?.label ?? 'Booking'}
        </Text>
        <Text style={{ color: colors.mutedText, fontSize: 12, fontWeight: '600' }}>
          Step {safeIndex + 1} of {stages.length}
        </Text>
      </View>
      <View
        style={{
          marginTop: 10,
          height: 6,
          borderRadius: 999,
          backgroundColor: `${siam.blue.DEFAULT}18`,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${Math.max(pct, stages.length ? 100 / stages.length : 0)}%`,
            height: '100%',
            borderRadius: 999,
            backgroundColor: siam.blue.DEFAULT,
          }}
        />
      </View>
      <View style={{ marginTop: 10, flexDirection: 'row', gap: 6 }}>
        {stages.map((stage, index) => {
          const done = index < safeIndex;
          const active = index === safeIndex;
          return (
            <View key={stage.id} style={{ flex: 1, alignItems: 'center' }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    done || active ? siam.blue.DEFAULT : `${colors.border}`,
                }}
              >
                <Text style={{ color: done || active ? '#fff' : colors.mutedText, fontSize: 11, fontWeight: '800' }}>
                  {done ? '✓' : index + 1}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                style={{
                  marginTop: 4,
                  fontSize: 10,
                  fontWeight: active ? '700' : '500',
                  color: active || done ? colors.text : colors.mutedText,
                }}
              >
                {stage.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

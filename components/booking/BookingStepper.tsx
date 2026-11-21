import { Text, View } from 'react-native';

import { t } from '../../lib/i18n/i18n';
import { accentForeground, radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type BookingStepperProps = {
  /** 1-based active step */
  step: 1 | 2 | 3;
};

const STEPS = [
  { id: 1, labelKey: 'book.steps.service' },
  { id: 2, labelKey: 'book.steps.details' },
  { id: 3, labelKey: 'book.steps.confirm' },
] as const;

/**
 * Capsule progress indicator — yellow active step, compact for the booking header.
 */
export function BookingStepper({ step }: BookingStepperProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.compact,
        backgroundColor: isDark ? colors.card : '#FFFFFF',
        borderRadius: radius.full,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: isDark ? colors.border : 'rgba(255,255,255,0.65)',
      }}
    >
      {STEPS.map((item, index) => {
        const active = item.id === step;
        const done = item.id < step;
        const showLine = index < STEPS.length - 1;

        return (
          <View key={item.id} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active || done ? siam.yellow.DEFAULT : isDark ? colors.border : '#E8EEF9',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: active || done ? accentForeground : colors.muted,
                  }}
                >
                  {item.id}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 12,
                  fontWeight: active ? '700' : '600',
                  color: active ? accentForeground : done ? siam.blue.navy : colors.muted,
                  flexShrink: 1,
                }}
              >
                {t(item.labelKey)}
              </Text>
            </View>
            {showLine ? (
              <View
                style={{
                  flex: 1,
                  height: 3,
                  marginHorizontal: 6,
                  borderRadius: 2,
                  backgroundColor: done || active ? siam.yellow.DEFAULT : isDark ? colors.border : '#E8EEF9',
                }}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

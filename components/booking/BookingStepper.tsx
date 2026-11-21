import { Text, View } from 'react-native';

import { t } from '../../lib/i18n/i18n';
import { radius, siam, spacing } from '../../lib/theme/tokens';
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
 * Compact 3-step progress indicator for the booking wizard.
 */
export function BookingStepper({ step }: BookingStepperProps) {
  const { colors, isDark } = useTheme();

  return (
    <View className="flex-row items-center justify-between" style={{ gap: spacing.compact }}>
      {STEPS.map((item) => {
        const active = item.id === step;
        const done = item.id < step;
        const barColor = active || done ? siam.yellow.DEFAULT : isDark ? colors.border : '#E8EEF9';
        const textColor = active || done ? siam.blue.navy : colors.muted;

        return (
          <View key={item.id} className="min-w-0 flex-1 items-center">
            <View
              style={{
                width: '100%',
                height: 4,
                borderRadius: radius.full,
                backgroundColor: barColor,
                marginBottom: 8,
              }}
            />
            <Text
              className="text-center text-[11px] font-semibold"
              numberOfLines={1}
              style={{ color: active ? colors.foreground : textColor }}
            >
              {`${item.id} ${t(item.labelKey)}`}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

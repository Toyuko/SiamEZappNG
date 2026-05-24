import { ActivityIndicator, Switch, Text, View } from 'react-native';

import { Card } from '../ui/Card';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type LiveTransitToggleProps = {
  active: boolean;
  busy: boolean;
  disabled?: boolean;
  onToggle: (active: boolean) => void;
};

export function LiveTransitToggle({ active, busy, disabled, onToggle }: LiveTransitToggleProps) {
  const { colors } = useTheme();

  return (
    <Card>
      <View className="flex-row items-center justify-between" style={{ gap: spacing.stackMd }}>
        <View style={{ flex: 1, gap: spacing.stackSm }}>
          <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
            {t('tracking.liveTransitTitle')}
          </Text>
          <Text className="text-sm leading-5" style={{ color: colors.muted }}>
            {active ? t('tracking.liveTransitActiveHint') : t('tracking.liveTransitHint')}
          </Text>
          {active ? (
            <Text className="text-xs font-medium" style={{ color: colors.success }}>
              {t('tracking.liveTransitActive')}
            </Text>
          ) : null}
        </View>
        {busy ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Switch
            value={active}
            disabled={disabled || busy}
            onValueChange={(value) => onToggle(value)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#ffffff"
            accessibilityLabel={t('tracking.liveTransitTitle')}
          />
        )}
      </View>
    </Card>
  );
}

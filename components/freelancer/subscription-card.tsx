import { Text, View } from 'react-native';
import { Crown, Sparkles } from 'lucide-react-native';

import { Button } from '../ui/Button';
import { t } from '../../lib/i18n/i18n';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const BENEFIT_KEYS = [
  'freelancer.subscriptionBenefit1',
  'freelancer.subscriptionBenefit2',
  'freelancer.subscriptionBenefit3',
] as const;

export function SubscriptionCard() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        borderRadius: radius.xl,
        borderWidth: 2,
        borderColor: `${siam.yellow.DEFAULT}66`,
        backgroundColor: colors.card,
        padding: spacing.cardPadding,
        gap: spacing.stackMd,
      }}
    >
      <View className="flex-row items-center gap-2">
        <Crown size={20} color={siam.yellow.DEFAULT} strokeWidth={2} />
        <Text className="text-base font-semibold" style={{ color: siam.blue.dark }}>
          {t('freelancer.subscriptionTitle')}
        </Text>
      </View>
      <Text className="text-sm leading-5" style={{ color: colors.muted }}>
        {t('freelancer.subscriptionDescription')}
      </Text>
      <View style={{ gap: spacing.stackSm }}>
        {BENEFIT_KEYS.map((key) => (
          <View key={key} className="flex-row items-start gap-2">
            <Sparkles size={16} color={siam.yellow.DEFAULT} strokeWidth={2} />
            <Text className="flex-1 text-sm leading-5" style={{ color: colors.foreground }}>
              {t(key)}
            </Text>
          </View>
        ))}
      </View>
      <Button label={t('freelancer.upgradeSubscription')} onPress={() => {}} />
    </View>
  );
}

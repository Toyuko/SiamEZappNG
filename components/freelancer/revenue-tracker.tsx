import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, TrendingUp } from 'lucide-react-native';

import type { FreelancerRevenue } from '../../features/freelancer/freelancer.types';
import { t } from '../../lib/i18n/i18n';
import { formatJobAmount } from '../../lib/jobs/format-amount';
import { heroGradient, siam, spacing } from '../../lib/theme/tokens';

type RevenueTrackerProps = {
  revenue: FreelancerRevenue;
};

export function RevenueTracker({ revenue }: RevenueTrackerProps) {
  const currency = revenue.currency || 'THB';

  return (
    <LinearGradient
      colors={[...heroGradient.colors]}
      start={heroGradient.start}
      end={heroGradient.end}
      style={{ borderRadius: 16, padding: spacing.cardPadding, gap: spacing.stackMd }}
    >
      <View className="flex-row items-center gap-2">
        <TrendingUp size={20} color="#ffffff" strokeWidth={2} />
        <Text className="text-base font-semibold text-white">{t('freelancer.revenueTracker')}</Text>
      </View>

      <View className="flex-row gap-3">
        <View
          style={{
            flex: 1,
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.12)',
            padding: spacing.cardPaddingCompact,
            minHeight: 48,
          }}
        >
          <Text className="text-sm text-white/80">{t('freelancer.totalEarned')}</Text>
          <Text className="mt-1 text-xl font-bold text-white">
            {formatJobAmount(revenue.totalEarned, currency)}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            borderRadius: 12,
            backgroundColor: `${siam.yellow.DEFAULT}33`,
            padding: spacing.cardPaddingCompact,
            minHeight: 48,
          }}
        >
          <View className="flex-row items-center gap-1">
            <Clock size={14} color={siam.yellow.light} strokeWidth={2} />
            <Text className="text-sm" style={{ color: siam.yellow.light }}>
              {t('freelancer.pendingClearance')}
            </Text>
          </View>
          <Text className="mt-1 text-xl font-bold" style={{ color: siam.yellow.DEFAULT }}>
            {formatJobAmount(revenue.pendingClearance, currency)}
          </Text>
          <Text className="mt-1 text-xs text-white/70">{t('freelancer.pendingClearanceHint')}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

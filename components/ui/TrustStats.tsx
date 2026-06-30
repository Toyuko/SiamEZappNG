import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { t } from '../../lib/i18n/i18n';
import { heroGradient, radius, shadows, spacing } from '../../lib/theme/tokens';

const STATS = [
  { value: '1000+', labelKey: 'trust.happyClients' },
  { value: '10+', labelKey: 'trust.yearsExperience' },
  { value: '100%', labelKey: 'trust.successRate' },
] as const;

export function TrustStats() {
  return (
    <LinearGradient
      colors={[...heroGradient.colors]}
      start={heroGradient.start}
      end={heroGradient.end}
      style={{
        borderRadius: radius.xl,
        paddingVertical: spacing.cardPadding,
        paddingHorizontal: spacing.stackMd,
        ...shadows.cardMedium,
      }}
    >
      <View className="flex-row justify-between">
        {STATS.map((stat) => (
          <View key={stat.value} className="min-w-0 flex-1 items-center px-1">
            <Text className="text-2xl font-bold tabular-nums" style={{ color: '#ffffff' }}>
              {stat.value}
            </Text>
            <Text
              className="mt-1.5 text-center text-[11px] font-semibold uppercase leading-4"
              style={{ color: 'rgba(255,255,255,0.85)', letterSpacing: 0.4 }}
            >
              {t(stat.labelKey)}
            </Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

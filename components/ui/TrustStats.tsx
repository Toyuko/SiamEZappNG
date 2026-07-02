import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { t } from '../../lib/i18n/i18n';
import { heroGradient, radius, shadows, siam, spacing } from '../../lib/theme/tokens';
import { CountUp } from './CountUp';
import { FadeInView } from './FadeInView';

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
        {STATS.map((stat, index) => (
          <FadeInView key={stat.value} delay={index * 140} distance={12} scaleFrom={0.85} style={{ flex: 1 }}>
            <View className="min-w-0 items-center px-1">
              <CountUp
                value={stat.value}
                delay={index * 140 + 120}
                className="text-2xl font-bold tabular-nums"
                style={{ color: '#ffffff' }}
              />
              <View
                style={{ height: 3, width: 22, borderRadius: 999, backgroundColor: siam.yellow.DEFAULT, marginTop: 6 }}
              />
              <Text
                className="mt-1.5 text-center text-[11px] font-semibold uppercase leading-4"
                style={{ color: 'rgba(255,255,255,0.85)', letterSpacing: 0.4 }}
              >
                {t(stat.labelKey)}
              </Text>
            </View>
          </FadeInView>
        ))}
      </View>
    </LinearGradient>
  );
}

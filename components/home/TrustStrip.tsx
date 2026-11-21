import { CalendarCheck2, Headset, ShieldCheck, Users } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { t } from '../../lib/i18n/i18n';
import { radius, shadows, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { FadeInView } from '../ui/FadeInView';

const ITEMS = [
  { key: 'easyBooking', Icon: CalendarCheck2 },
  { key: 'localExperts', Icon: Users },
  { key: 'trusted', Icon: ShieldCheck },
  { key: 'support', Icon: Headset },
] as const;

/**
 * Compact trust strip — keeps social proof without pushing services down.
 */
export function TrustStrip() {
  const { colors, isDark } = useTheme();

  return (
    <FadeInView delay={60} distance={10}>
      <View
        className="flex-row"
        style={{
          borderRadius: radius.lg,
          backgroundColor: colors.card,
          paddingVertical: spacing.small,
          paddingHorizontal: spacing.compact,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.cardLight,
        }}
      >
        {ITEMS.map(({ key, Icon }) => (
          <View key={key} className="min-w-0 flex-1 items-center px-0.5">
            <View
              className="mb-1.5 h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: isDark ? 'rgba(53,103,246,0.2)' : `${siam.blue.DEFAULT}14` }}
            >
              <Icon size={16} color={colors.primary} strokeWidth={2.2} />
            </View>
            <Text
              className="text-center text-[10px] font-semibold leading-3"
              numberOfLines={2}
              style={{ color: colors.foreground }}
            >
              {t(`home.trustStrip.${key}`)}
            </Text>
          </View>
        ))}
      </View>
    </FadeInView>
  );
}

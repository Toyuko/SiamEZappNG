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

export function TrustStrip() {
  const { colors, isDark } = useTheme();

  return (
    <FadeInView delay={50} distance={8}>
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
        {ITEMS.map(({ key, Icon }, index) => (
          <View
            key={key}
            className="min-w-0 flex-1 items-center px-0.5"
            style={
              index < ITEMS.length - 1
                ? { borderRightWidth: 1, borderRightColor: isDark ? colors.border : siam.blue.tint }
                : undefined
            }
          >
            <Icon size={18} color={colors.primary} strokeWidth={2} />
            <Text
              className="mt-1.5 text-center text-[10px] font-semibold leading-3"
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

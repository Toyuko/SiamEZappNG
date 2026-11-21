import { useRouter } from 'expo-router';
import { Bell, UserRound } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';

import { t } from '../../lib/i18n/i18n';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

const LOGO = require('../../assets/brand/siamez-logo-circle.png');

type HomeHeaderProps = {
  /** When true, render on blue hero (white icons/text). */
  onBrand?: boolean;
};

/**
 * Compact branded header — logo + wordmark left; notifications + profile right.
 */
export function HomeHeader({ onBrand = false }: HomeHeaderProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const isGuest = useAuthStore((s) => s.isGuest);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isMember = Boolean(accessToken) && !isGuest;

  const iconColor = onBrand ? '#FFFFFF' : colors.foreground;
  const mutedColor = onBrand ? 'rgba(255,255,255,0.78)' : colors.muted;
  const chipBg = onBrand ? 'rgba(255,255,255,0.16)' : isDark ? 'rgba(255,255,255,0.08)' : `${siam.blue.DEFAULT}12`;

  const openProfile = () => {
    if (isMember) {
      router.push('/(tabs)/profile');
      return;
    }
    router.push('/(tabs)/account');
  };

  const openNotifications = () => {
    if (isMember) {
      router.push('/(tabs)/cases');
      return;
    }
    router.push('/(tabs)/contact');
  };

  return (
    <View
      className="flex-row items-center justify-between"
      style={{ minHeight: 56, paddingVertical: spacing.compact }}
    >
      <View className="flex-row items-center gap-2.5">
        <Image
          source={LOGO}
          style={{ width: 36, height: 36, borderRadius: 18 }}
          accessibilityIgnoresInvertColors
        />
        <Text
          className="text-xl font-bold tracking-tight"
          style={{ color: onBrand ? '#FFFFFF' : colors.foreground }}
        >
          SiamEZ
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.header.notifications')}
          onPress={openNotifications}
          hitSlop={8}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: radius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: chipBg,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Bell size={20} color={iconColor} strokeWidth={2.2} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.header.profile')}
          onPress={openProfile}
          hitSlop={8}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: radius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: chipBg,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <UserRound size={20} color={onBrand ? siam.yellow.DEFAULT : mutedColor} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}

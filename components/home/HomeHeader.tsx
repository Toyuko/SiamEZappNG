import { useRouter } from 'expo-router';
import { Bell, UserRound } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';

import { t } from '../../lib/i18n/i18n';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

const LOGO = require('../../assets/brand/siamez-logo-circle.png');

/**
 * Compact white header — logo + wordmark left; outline notification + profile right.
 */
export function HomeHeader() {
  const router = useRouter();
  const { colors } = useTheme();
  const isGuest = useAuthStore((s) => s.isGuest);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isMember = Boolean(accessToken) && !isGuest;

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
      style={{ minHeight: 52, paddingVertical: spacing.compact }}
    >
      <View className="flex-row items-center gap-2.5">
        <Image
          source={LOGO}
          style={{ width: 34, height: 34, borderRadius: 17 }}
          accessibilityIgnoresInvertColors
        />
        <Text className="text-[20px] font-bold tracking-tight" style={{ color: colors.foreground }}>
          SiamEZ
        </Text>
      </View>

      <View className="flex-row items-center gap-1.5">
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
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Bell size={22} color={colors.foreground} strokeWidth={1.8} />
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
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <UserRound size={22} color={siam.blue.DEFAULT} strokeWidth={1.8} />
        </Pressable>
      </View>
    </View>
  );
}

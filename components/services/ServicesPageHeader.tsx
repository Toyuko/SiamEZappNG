import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell, UserRound } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '../../lib/i18n/i18n';
import { heroGradient, radius, siam, spacing } from '../../lib/theme/tokens';
import { useAuthStore } from '../../store/auth-store';

const LOGO = require('../../assets/brand/siamez-logo-circle.png');

/**
 * Branded blue Services header — logo, notifications, profile, title.
 */
export function ServicesPageHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isGuest = useAuthStore((s) => s.isGuest);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isMember = Boolean(accessToken) && !isGuest;

  return (
    <LinearGradient
      colors={[...heroGradient.colors]}
      start={heroGradient.start}
      end={heroGradient.end}
      style={{
        paddingTop: insets.top + spacing.compact,
        paddingBottom: spacing.cardPadding,
        paddingHorizontal: spacing.medium,
        overflow: 'hidden',
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -40,
          top: insets.top - 10,
          width: 140,
          height: 140,
          borderRadius: 70,
          backgroundColor: 'rgba(255, 212, 0, 0.16)',
        }}
      />

      <View className="flex-row items-center justify-between" style={{ minHeight: 44 }}>
        <View className="flex-row items-center gap-2.5">
          <Image source={LOGO} style={{ width: 36, height: 36, borderRadius: 18 }} />
          <Text className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
            SiamEZ
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.header.notifications')}
            hitSlop={8}
            onPress={() => router.push(isMember ? '/(tabs)/cases' : '/(tabs)/contact')}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Bell size={22} color="#FFFFFF" strokeWidth={1.9} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.header.profile')}
            hitSlop={8}
            onPress={() => router.push(isMember ? '/(tabs)/profile' : '/(tabs)/account')}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <UserRound size={22} color={siam.yellow.DEFAULT} strokeWidth={1.9} />
          </Pressable>
        </View>
      </View>

      <Text className="mt-3 text-[24px] font-bold tracking-tight" style={{ color: '#FFFFFF' }}>
        {t('services.title')}
      </Text>
      <Text className="mt-1 text-[14px] leading-5" style={{ color: 'rgba(255,255,255,0.88)' }}>
        {t('services.subtitle')}
      </Text>
    </LinearGradient>
  );
}

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell, UserRound } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '../../lib/i18n/i18n';
import { heroGradient, radius, siam, spacing } from '../../lib/theme/tokens';
import { useAuthStore } from '../../store/auth-store';

const LOGO = require('../../assets/brand/siamez-logo-circle.png');

type ServicesPageHeaderProps = {
  /** Tighter header so the service directory can sit above the fold. */
  compact?: boolean;
};

/**
 * Branded blue Services header — logo, notifications, profile, title.
 */
export function ServicesPageHeader({ compact = false }: ServicesPageHeaderProps) {
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
        paddingTop: insets.top + (compact ? spacing.micro : spacing.compact),
        paddingBottom: compact ? spacing.small : spacing.cardPadding,
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

      <View className="flex-row items-center justify-between" style={{ minHeight: compact ? 40 : 44 }}>
        <View className="flex-row items-center gap-2.5">
          <Image source={LOGO} style={{ width: compact ? 32 : 36, height: compact ? 32 : 36, borderRadius: 18 }} />
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

      <Text
        className={`font-bold tracking-tight ${compact ? 'mt-2 text-[22px]' : 'mt-4 text-[28px]'}`}
        style={{ color: '#FFFFFF' }}
      >
        {t('services.title')}
      </Text>
      <Text
        className={`leading-5 ${compact ? 'mt-0.5 text-[13px]' : 'mt-1.5 text-[15px]'}`}
        style={{ color: 'rgba(255,255,255,0.88)' }}
      >
        {t('services.subtitle')}
      </Text>
    </LinearGradient>
  );
}

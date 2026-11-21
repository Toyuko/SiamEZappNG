import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VOICE_FAB_SCROLL_EXTRA } from '../../components/voice/voice-fab-layout';
import { BrandHeader } from '../../components/ui/BrandHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LanguageToggle } from '../../components/ui/LanguageToggle';
import { MenuRow } from '../../components/ui/MenuRow';
import { ThemePicker } from '../../components/ui/ThemePicker';
import { useSoftLaunch } from '../../hooks/use-soft-launch';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export default function GuestAccountScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const softLaunch = useSoftLaunch();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.screenPaddingX,
          gap: spacing.sectionGap,
          paddingBottom: 32 + VOICE_FAB_SCROLL_EXTRA,
        }}
      >
        <BrandHeader title={t('tabs.account')} subtitle={t('auth.welcomeSubtitle')} />

        <Card>
          <Text className="text-base font-bold" style={{ color: colors.foreground }}>
            {t('auth.guestAccountTitle')}
          </Text>
          <Text className="mt-2 text-sm leading-5" style={{ color: colors.muted }}>
            {t('auth.guestAccountHint')}
          </Text>
          <View className="mt-4 gap-3">
            <Button label={t('auth.signIn')} variant="accent" gradient onPress={() => router.push('/(auth)/login')} />
            <Button label={t('auth.signUp')} variant="secondary" onPress={() => router.push('/(auth)/signup')} />
          </View>
        </Card>

        <Card>
          <Text className="mb-1 text-xs font-bold uppercase tracking-wide" style={{ color: colors.muted }}>
            {t('settings.title')}
          </Text>
          <View className="mt-2 gap-4">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
                {t('settings.theme')}
              </Text>
              <ThemePicker />
            </View>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
                {t('settings.language')}
              </Text>
              <LanguageToggle />
            </View>
          </View>
        </Card>

        <Card>
          <Text className="mb-1 text-xs font-bold uppercase tracking-wide" style={{ color: colors.muted }}>
            {t('auth.quickAccess')}
          </Text>
          <MenuRow
            icon="grid-outline"
            title={t('tabs.services')}
            subtitle={t('services.subtitle')}
            onPress={() => router.push('/(tabs)/services')}
          />
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <MenuRow
            icon="calendar-outline"
            title={t('home.bookService')}
            subtitle={t('book.selectServiceSubtitle')}
            onPress={() => router.push('/(tabs)/book')}
          />
          {softLaunch.showFreelancers ? (
            <>
              <View style={{ height: 1, backgroundColor: colors.border }} />
              <MenuRow
                icon="people-outline"
                title={t('freelancer.publicProfile.directory.title')}
                onPress={() => router.push('/(tabs)/freelancers')}
              />
            </>
          ) : null}
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <MenuRow
            icon="mail-outline"
            title={t('tabs.contact')}
            onPress={() => router.push('/(tabs)/contact')}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

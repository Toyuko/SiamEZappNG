import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VOICE_FAB_SCROLL_EXTRA } from '../../components/voice/voice-fab-layout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LanguageToggle } from '../../components/ui/LanguageToggle';
import { PageHeader } from '../../components/ui/PageHeader';
import { ThemePicker } from '../../components/ui/ThemePicker';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export default function GuestAccountScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 + VOICE_FAB_SCROLL_EXTRA }}>
        <PageHeader title={t('tabs.account')} subtitle={t('auth.welcomeSubtitle')} />

        <Card>
          <Text className="text-sm leading-5" style={{ color: colors.muted }}>
            {t('auth.guestAccountHint')}
          </Text>
          <View className="mt-4 gap-3">
            <Button label={t('auth.signIn')} onPress={() => router.push('/(auth)/login')} />
            <Button label={t('auth.signUp')} variant="secondary" onPress={() => router.push('/(auth)/signup')} />
          </View>
        </Card>

        <Card>
          <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.muted }}>
            {t('settings.title')}
          </Text>
          <View className="mt-4 gap-4">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm font-medium" style={{ color: colors.muted }}>
                {t('settings.theme')}
              </Text>
              <ThemePicker />
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-sm font-medium" style={{ color: colors.muted }}>
                {t('settings.language')}
              </Text>
              <LanguageToggle />
            </View>
          </View>
        </Card>

        <Card>
          <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.muted }}>
            {t('auth.quickAccess')}
          </Text>
          <View className="mt-3 gap-3">
            <Button label={t('tabs.services')} variant="secondary" onPress={() => router.push('/(tabs)/services')} />
            <Button label={t('tabs.contact')} variant="secondary" onPress={() => router.push('/(tabs)/contact')} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export default function GuestAccountScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: spacing.sectionGap, paddingBottom: 32 }}>
        <PageHeader title={t('tabs.account')} subtitle="Sign in to access your client portal." />

        <Card>
          <Text className="text-sm leading-5" style={{ color: colors.muted }}>
            Create an account or sign in to track cases, upload documents, and manage your services.
          </Text>
          <View className="mt-4 gap-3">
            <Button label={t('auth.signIn')} onPress={() => router.replace('/(auth)/login')} />
            <Button label={t('auth.signUp')} variant="secondary" onPress={() => router.push('/(auth)/signup')} />
          </View>
        </Card>

        <Card>
          <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.muted }}>
            Quick access
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

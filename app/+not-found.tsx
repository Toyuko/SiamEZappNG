import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { t } from '../lib/i18n/i18n';
import { spacing } from '../lib/theme/tokens';
import { useTheme } from '../lib/theme/theme';

/**
 * Customer-facing fallback for unknown routes and malformed deep links.
 * Replaces Expo Router's default "Unmatched Route" screen.
 */
export default function NotFoundScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: t('common.pageNotFoundTitle'), headerShown: false }} />
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: spacing.screenPaddingX,
            paddingVertical: spacing.sectionGap,
          }}
        >
          <Card className="py-6">
            <Text className="text-center text-xl font-bold" style={{ color: colors.foreground }}>
              {t('common.pageNotFoundTitle')}
            </Text>
            <Text className="mt-3 text-center text-base leading-6" style={{ color: colors.mutedText }}>
              {t('common.pageNotFoundBody')}
            </Text>
            <View className="mt-6 gap-3">
              <Button
                label={t('serviceDetail.backToServices')}
                onPress={() => router.replace('/(tabs)/services')}
              />
              <Button
                label={t('tabs.contact')}
                variant="secondary"
                onPress={() => router.replace('/(tabs)/contact')}
              />
            </View>
          </Card>
        </View>
      </SafeAreaView>
    </>
  );
}

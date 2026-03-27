import { Text, View } from 'react-native';

import { t } from '../../lib/i18n/i18n';
import { siam } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { Card } from './Card';

export function TrustStats() {
  const { colors } = useTheme();

  return (
    <Card>
      <View className="flex-row justify-between">
        <View className="min-w-0 flex-1 items-center px-1">
          <Text className="text-2xl font-bold" style={{ color: siam.blue.DEFAULT }}>
            1000+
          </Text>
          <Text className="mt-1 text-center text-xs" style={{ color: colors.muted }}>
            {t('trust.happyClients')}
          </Text>
        </View>
        <View className="min-w-0 flex-1 items-center px-1">
          <Text className="text-2xl font-bold" style={{ color: siam.blue.DEFAULT }}>
            10+
          </Text>
          <Text className="mt-1 text-center text-xs" style={{ color: colors.muted }}>
            {t('trust.yearsExperience')}
          </Text>
        </View>
        <View className="min-w-0 flex-1 items-center px-1">
          <Text className="text-2xl font-bold" style={{ color: siam.blue.DEFAULT }}>
            100%
          </Text>
          <Text className="mt-1 text-center text-xs" style={{ color: colors.muted }}>
            {t('trust.successRate')}
          </Text>
        </View>
      </View>
    </Card>
  );
}

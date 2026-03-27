import { Text, View } from 'react-native';

import { siam } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { Card } from './Card';

export function MetricCard({ title, value }: { title: string; value: string | number }) {
  const { colors } = useTheme();

  return (
    <Card className="flex-1">
      <Text className="text-sm font-medium" style={{ color: colors.muted }}>
        {title}
      </Text>
      <Text className="mt-2 text-2xl font-bold" style={{ color: siam.blue.DEFAULT }}>
        {value}
      </Text>
    </Card>
  );
}

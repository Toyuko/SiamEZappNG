import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useTheme } from '../../lib/theme/theme';
import { Card } from './Card';

export function EmptyState({ label, description }: { label: string; description?: string }) {
  const { colors } = useTheme();

  return (
    <Card className="items-center border border-dashed">
      <MaterialCommunityIcons name="inbox-outline" size={26} color={colors.mutedText} />
      <Text className="mt-2 text-center" style={{ color: colors.mutedText }}>{label}</Text>
      {description ? (
        <Text className="mt-1 text-center text-sm" style={{ color: colors.mutedText }}>{description}</Text>
      ) : null}
    </Card>
  );
}

import { Text, View } from 'react-native';

import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { Button } from './Button';
import { Card } from './Card';

type ErrorStateProps = {
  label?: string;
  onRetry?: () => void;
};

export function ErrorState({ label = 'Something went wrong.', onRetry }: ErrorStateProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-1 justify-center px-4" style={{ backgroundColor: colors.background, paddingVertical: spacing.sectionGap }}>
      <Card>
        <Text className="text-center text-base" style={{ color: colors.danger }}>
          {label}
        </Text>
        {onRetry ? (
          <View className="mt-4">
            <Button label="Try again" onPress={onRetry} />
          </View>
        ) : null}
      </Card>
    </View>
  );
}

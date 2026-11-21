import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../ui/Button';
import { useTheme } from '../../lib/theme/theme';

type StickyBookingBarProps = {
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  secondaryDisabled?: boolean;
};

export function StickyBookingBar({
  primaryLabel,
  onPrimary,
  primaryDisabled,
  secondaryLabel,
  onSecondary,
  secondaryDisabled,
}: StickyBookingBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.card,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Math.max(insets.bottom, 12),
        flexDirection: 'row',
        gap: 10,
      }}
    >
      {secondaryLabel && onSecondary ? (
        <View style={{ width: 96 }}>
          <Button
            label={secondaryLabel}
            variant="secondary"
            onPress={onSecondary}
            disabled={secondaryDisabled}
            fullWidth
          />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Button
          label={primaryLabel}
          variant="accent"
          gradient
          onPress={onPrimary}
          disabled={primaryDisabled}
          fullWidth
        />
      </View>
    </View>
  );
}

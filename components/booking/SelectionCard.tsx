import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { radius, siam } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type SelectionCardProps = {
  label: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
  compact?: boolean;
  /** Stretch equally in a horizontal row */
  fill?: boolean;
};

export function SelectionCard({
  label,
  description,
  selected = false,
  onPress,
  compact = false,
  fill = false,
}: SelectionCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={{
        flex: fill ? 1 : undefined,
        minHeight: compact ? 48 : 72,
        borderRadius: radius.xl,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? siam.blue.DEFAULT : colors.border,
        backgroundColor: selected ? `${siam.blue.DEFAULT}12` : colors.card,
        paddingHorizontal: 14,
        paddingVertical: compact ? 12 : 14,
        position: 'relative',
      }}
    >
      {selected ? (
        <View
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: siam.blue.DEFAULT,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="checkmark" size={12} color="#fff" />
        </View>
      ) : null}
      <Text
        style={{
          color: colors.text,
          fontSize: 15,
          fontWeight: '700',
          paddingRight: selected ? 24 : 0,
        }}
      >
        {label}
      </Text>
      {description ? (
        <Text style={{ color: colors.mutedText, fontSize: 12, marginTop: 4, lineHeight: 16 }}>
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

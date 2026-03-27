import { Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { radius } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, ...props }: InputProps) {
  const { colors } = useTheme();

  return (
    <View className="space-y-1.5">
      {label ? (
        <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        className={`border px-4 py-3.5 text-base ${className ?? ''}`}
        placeholderTextColor={colors.muted}
        style={{
          borderColor: error ? colors.danger : colors.border,
          backgroundColor: colors.card,
          color: colors.foreground,
          borderRadius: radius.button,
          borderWidth: 1,
        }}
        {...props}
      />
      {error ? <Text className="text-sm" style={{ color: colors.danger }}>{error}</Text> : null}
    </View>
  );
}

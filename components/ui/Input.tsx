import { Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { useTheme } from '../../lib/theme/theme';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, ...props }: InputProps) {
  const { colors } = useTheme();

  return (
    <View className="space-y-1.5">
      {label ? <Text className="text-sm font-medium" style={{ color: colors.text }}>{label}</Text> : null}
      <TextInput
        className={`rounded-2xl border px-4 py-3.5 text-base ${className ?? ''}`}
        placeholderTextColor={colors.mutedText}
        style={{
          borderColor: error ? colors.danger : colors.border,
          backgroundColor: colors.card,
          color: colors.text,
        }}
        {...props}
      />
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}

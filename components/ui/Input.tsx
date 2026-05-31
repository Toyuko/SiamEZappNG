import type { ReactNode } from 'react';
import { Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';

import { radius } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  /** Renders inside the field on the left (e.g. search icon) */
  leftIcon?: ReactNode;
  /** Renders inside the field on the right (e.g. microphone) */
  rightIcon?: ReactNode;
};

export function Input({ label, error, className, leftIcon, rightIcon, ...props }: InputProps) {
  const { colors } = useTheme();

  const fieldBorder = {
    borderColor: error ? colors.danger : colors.border,
    backgroundColor: colors.card,
    borderRadius: radius.button,
    borderWidth: 1,
  } as const;

  return (
    <View className="space-y-1.5">
      {label ? (
        <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
          {label}
        </Text>
      ) : null}
      {leftIcon || rightIcon ? (
        <View className="flex-row items-center" style={fieldBorder}>
          {leftIcon ? <View className="pl-3.5">{leftIcon}</View> : null}
          <TextInput
            className={`min-h-[52px] flex-1 py-3.5 pl-2 text-base ${rightIcon ? 'pr-2' : 'pr-4'} ${className ?? ''}`}
            placeholderTextColor={colors.muted}
            style={{
              color: colors.foreground,
            }}
            {...props}
          />
          {rightIcon ? <View className="pr-2">{rightIcon}</View> : null}
        </View>
      ) : (
        <TextInput
          className={`border px-4 py-3.5 text-base ${className ?? ''}`}
          placeholderTextColor={colors.muted}
          style={{
            ...fieldBorder,
            color: colors.foreground,
          }}
          {...props}
        />
      )}
      {error ? <Text className="text-sm" style={{ color: colors.danger }}>{error}</Text> : null}
    </View>
  );
}

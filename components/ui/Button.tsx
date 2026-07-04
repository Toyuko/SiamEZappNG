import { Pressable, Text } from 'react-native';
import type { ReactNode } from 'react';

import { radius } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'md' | 'lg';

type ButtonProps = {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  onPress?: () => void;
  children?: ReactNode;
};

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  rounded = true,
  fullWidth = true,
  disabled = false,
  backgroundColor,
  borderColor,
  textColor,
  onPress,
  children,
}: ButtonProps) {
  const { colors } = useTheme();
  const sizeClass = size === 'lg' ? 'min-h-[52px] min-w-[48px] px-5 py-3.5' : 'min-h-[48px] min-w-[48px] px-4 py-3';
  const variantClass = disabled ? 'opacity-60' : '';
  const borderRadius = rounded ? radius.button : radius.md;
  const resolvedBackgroundColor = backgroundColor ?? (variant === 'primary' ? colors.primary : colors.card);
  const resolvedBorderColor = borderColor ?? colors.primary;
  const resolvedTextColor = textColor ?? (variant === 'primary' ? '#ffffff' : colors.primary);
  const resolvedBorderWidth = borderColor ? 1 : variant === 'secondary' ? 1 : 0;

  return (
    <Pressable
      className={`${fullWidth ? 'w-full' : 'self-start'} items-center justify-center ${sizeClass} ${variantClass}`}
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: resolvedBackgroundColor,
        borderColor: resolvedBorderColor,
        borderWidth: resolvedBorderWidth,
        borderRadius,
      }}
    >
      {children ?? (
        <Text className="text-base font-semibold" style={{ color: resolvedTextColor }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

import { useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { accentForeground, brandGradient, goldGradient, radius, siam } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type ButtonVariant = 'primary' | 'secondary' | 'accent';
type ButtonSize = 'md' | 'lg';

type ButtonProps = {
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  /** Use a vivid gradient fill (blue for primary, gold for accent). */
  gradient?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  onPress?: () => void;
  children?: ReactNode;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  rounded = true,
  fullWidth = true,
  disabled = false,
  gradient = false,
  backgroundColor,
  borderColor,
  textColor,
  onPress,
  children,
}: ButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = useCallback(() => {
    scale.value = withTiming(0.96, { duration: 90 });
  }, [scale]);
  const onPressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 160 });
  }, [scale]);

  const borderRadius = rounded ? radius.button : radius.md;
  const defaultBackground =
    variant === 'primary' ? colors.primary : variant === 'accent' ? siam.yellow.DEFAULT : colors.card;
  const defaultTextColor =
    variant === 'primary' ? '#ffffff' : variant === 'accent' ? accentForeground : colors.primary;
  const resolvedBackgroundColor = backgroundColor ?? defaultBackground;
  const resolvedBorderColor = borderColor ?? colors.primary;
  const resolvedTextColor = textColor ?? defaultTextColor;
  const resolvedBorderWidth = borderColor ? 1 : variant === 'secondary' ? 1 : 0;

  const useGradient = gradient && variant !== 'secondary';
  const gradientColors = variant === 'accent' ? goldGradient : brandGradient;

  const sizeStyle =
    size === 'lg'
      ? { minHeight: 52, minWidth: 48, paddingHorizontal: 20, paddingVertical: 14 }
      : { minHeight: 48, minWidth: 48, paddingHorizontal: 16, paddingVertical: 12 };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      accessibilityRole="button"
      {...(label ? { accessibilityLabel: label } : {})}
      accessibilityState={{ disabled }}
      style={[
        animatedStyle,
        sizeStyle,
        {
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius,
          opacity: disabled ? 0.6 : 1,
          ...(fullWidth ? { width: '100%' } : { alignSelf: 'flex-start' }),
          ...(useGradient
            ? {}
            : {
                backgroundColor: resolvedBackgroundColor,
                borderColor: resolvedBorderColor,
                borderWidth: resolvedBorderWidth,
              }),
        },
      ]}
    >
      {useGradient ? (
        <LinearGradient
          colors={[...gradientColors.colors]}
          start={gradientColors.start}
          end={gradientColors.end}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {children ?? (
        <Text className="text-base font-semibold" style={{ color: resolvedTextColor }}>
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

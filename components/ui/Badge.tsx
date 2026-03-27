import { Text, View } from 'react-native';

import { useTheme } from '../../lib/theme/theme';

type BadgeVariant = 'success' | 'pending' | 'error' | 'info';

const variantMap: Record<BadgeVariant, { lightBg: string; lightText: string; darkBg: string; darkText: string }> = {
  success: { lightBg: '#dcfce7', lightText: '#15803d', darkBg: '#14532d', darkText: '#bbf7d0' },
  pending: { lightBg: '#fef3c7', lightText: '#a16207', darkBg: '#78350f', darkText: '#fde68a' },
  error: { lightBg: '#fee2e2', lightText: '#b91c1c', darkBg: '#7f1d1d', darkText: '#fecaca' },
  info: { lightBg: '#dbeafe', lightText: '#1d4ed8', darkBg: '#1e3a8a', darkText: '#bfdbfe' },
};

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
};

export function Badge({ label, variant = 'info' }: BadgeProps) {
  const { isDark } = useTheme();
  const styles = variantMap[variant];
  return (
    <View className="self-start rounded-full px-3 py-1.5" style={{ backgroundColor: isDark ? styles.darkBg : styles.lightBg }}>
      <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: isDark ? styles.darkText : styles.lightText }}>
        {label}
      </Text>
    </View>
  );
}

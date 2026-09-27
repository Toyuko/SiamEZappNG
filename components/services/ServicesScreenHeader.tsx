import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../lib/theme/theme';

type ServicesScreenHeaderProps = {
  title: string;
  subtitle: string;
};

/** Compact header — avoids the large gradient hero on the launcher grid screen */
export function ServicesScreenHeader({ title, subtitle }: ServicesScreenHeaderProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.plate,
        { backgroundColor: isDark ? 'rgba(9,9,11,0.94)' : 'rgba(255,255,255,0.94)' },
      ]}
    >
      <Text className="text-2xl font-bold tracking-tight" style={{ color: colors.foreground }}>
        {title}
      </Text>
      <Text className="text-sm leading-5" style={{ color: colors.muted }}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    alignSelf: 'flex-start',
    gap: 2,
    maxWidth: '100%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

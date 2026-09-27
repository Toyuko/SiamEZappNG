import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../lib/theme/theme';

type ServicesScreenHeaderProps = {
  title: string;
  subtitle: string;
};

/** Compact header — avoids the large gradient hero on the launcher grid screen */
export function ServicesScreenHeader({ title, subtitle }: ServicesScreenHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 4 }}>
      <Text className="text-2xl font-bold tracking-tight" style={[styles.title, { color: colors.foreground }]}>
        {title}
      </Text>
      <Text className="text-sm leading-5" style={[styles.subtitle, { color: colors.muted }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    textShadowColor: 'rgba(255,255,255,0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    textShadowColor: 'rgba(255,255,255,0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});

import { Text, View } from 'react-native';

import { spacing } from '../../lib/theme/tokens';
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
      <Text className="text-2xl font-bold tracking-tight" style={{ color: colors.foreground }}>
        {title}
      </Text>
      <Text className="text-sm leading-5" style={{ color: colors.muted }}>
        {subtitle}
      </Text>
    </View>
  );
}

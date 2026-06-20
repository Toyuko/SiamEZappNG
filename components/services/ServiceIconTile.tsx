import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { getServiceShortTitle } from '../../features/services/service-display';
import type { ServiceItem } from '../../features/services/services.types';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { SERVICE_ICON_SURFACE } from './service-icon-surface';

type ServiceIconTileProps = {
  service: ServiceItem;
  tileSize: number;
  onPress: (service: ServiceItem) => void;
};

export function ServiceIconTile({ service, tileSize, onPress }: ServiceIconTileProps) {
  const { colors, isDark } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const title = getServiceShortTitle(service, language);
  const tint = SERVICE_ICON_SURFACE[service.category][isDark ? 'dark' : 'light'];
  const iconBox = Math.min(58, Math.round(tileSize * 0.78));

  return (
    <Pressable
      onPress={() => onPress(service)}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => ({
        width: tileSize,
        opacity: pressed ? 0.78 : 1,
        alignItems: 'center',
        paddingBottom: 2,
      })}
    >
      <View style={{ width: iconBox, height: iconBox, position: 'relative' }}>
        <View
          style={{
            width: iconBox,
            height: iconBox,
            borderRadius: radius.lg,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tint,
          }}
        >
          <Ionicons
            name={service.icon}
            size={Math.round(iconBox * 0.46)}
            color={colors.primary}
            accessibilityIgnoresInvertColors
          />
        </View>
        {service.featured ? (
          <View
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 16,
              height: 16,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFCE2D',
              borderWidth: 1.5,
              borderColor: colors.background,
            }}
          >
            <Ionicons name="star" size={9} color="#2344B0" />
          </View>
        ) : null}
      </View>
      <Text
        className="mt-1 text-center text-[10px] font-medium leading-[12px]"
        style={{ color: colors.foreground, width: tileSize, minHeight: 24 }}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
    </Pressable>
  );
}

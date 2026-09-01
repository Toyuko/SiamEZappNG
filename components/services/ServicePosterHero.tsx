import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';

import { getServicePosterImageUrl } from '../../features/services/service-poster-images';
import type { ServiceItem } from '../../features/services/services.types';
import {
  SERVICE_ICON_GRADIENT,
  SERVICE_ICON_GRADIENT_END,
  SERVICE_ICON_GRADIENT_START,
} from './service-icon-gradient';

type ServicePosterHeroProps = {
  service: ServiceItem;
  width?: number;
  height: number;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
};

export function ServicePosterHero({ service, width, height, iconSize, style }: ServicePosterHeroProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const gradient = SERVICE_ICON_GRADIENT[service.category];
  const resolvedIconSize = iconSize ?? Math.max(22, height * 0.45);
  const posterUrl = getServicePosterImageUrl(service.slug);

  if (imageFailed) {
    return (
      <LinearGradient
        colors={[gradient.colors[0], gradient.colors[1]]}
        start={SERVICE_ICON_GRADIENT_START}
        end={SERVICE_ICON_GRADIENT_END}
        style={[
          {
            width,
            height,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      >
        <Ionicons
          name={service.icon}
          size={resolvedIconSize}
          color={gradient.foreground}
          accessibilityIgnoresInvertColors
        />
      </LinearGradient>
    );
  }

  return (
    <View style={[{ width: width ?? '100%', height, overflow: 'hidden' }, style]}>
      <Image
        source={{ uri: posterUrl }}
        accessibilityIgnoresInvertColors
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
        onError={() => setImageFailed(true)}
      />
    </View>
  );
}

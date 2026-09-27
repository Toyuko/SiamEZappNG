import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Image, StyleSheet, View, type ImageResizeMode, type StyleProp, type ViewStyle } from 'react-native';

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
  resizeMode?: ImageResizeMode;
  accessibilityLabel?: string;
  /** Spinner while the remote poster is loading. Off for the compact cards. */
  showLoading?: boolean;
  indicatorColor?: string;
};

export function ServicePosterHero({
  service,
  width,
  height,
  iconSize,
  style,
  resizeMode = 'cover',
  accessibilityLabel,
  showLoading = false,
  indicatorColor = '#ffffff',
}: ServicePosterHeroProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const gradient = SERVICE_ICON_GRADIENT[service.category];
  const resolvedIconSize = iconSize ?? Math.max(22, height * 0.45);
  const posterUrl = getServicePosterImageUrl(service.slug);

  useEffect(() => {
    setImageFailed(false);
    setLoaded(false);
  }, [posterUrl]);

  if (imageFailed) {
    return (
      <LinearGradient
        colors={[gradient.colors[0], gradient.colors[1]]}
        start={SERVICE_ICON_GRADIENT_START}
        end={SERVICE_ICON_GRADIENT_END}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityLabel ? 'image' : undefined}
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
      {showLoading && !loaded ? (
        <View style={[StyleSheet.absoluteFill, styles.loading]} pointerEvents="none">
          <ActivityIndicator color={indicatorColor} />
        </View>
      ) : null}
      <Image
        source={{ uri: posterUrl }}
        accessibilityIgnoresInvertColors
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityLabel ? 'image' : undefined}
        style={{ width: '100%', height: '100%', opacity: showLoading && !loaded ? 0 : 1 }}
        resizeMode={resizeMode}
        onLoad={() => setLoaded(true)}
        onError={() => setImageFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

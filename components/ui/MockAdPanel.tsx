import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, Text, useWindowDimensions, View } from 'react-native';

import { DEFAULT_MOCK_AD, type MockAdConfig } from '../../features/ads/mock-ads';
import { t } from '../../lib/i18n/i18n';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type MockAdPanelProps = {
  height: number;
  width?: number;
  ad?: MockAdConfig;
};

function SponsoredBadge({ compact = false }: { compact?: boolean }) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: radius.full,
        paddingHorizontal: compact ? 7 : 8,
        paddingVertical: compact ? 2 : 3,
      }}
    >
      <Text style={{ fontSize: compact ? 8 : 9, fontWeight: '800', letterSpacing: 0.6, color: '#64748b' }}>
        {t('ads.sponsored').toUpperCase()}
      </Text>
    </View>
  );
}

function ImageAdPanel({ ad, width, height }: { ad: MockAdConfig; width: number; height: number }) {
  return (
    <View style={{ width, height, backgroundColor: '#0a0a0a' }}>
      <Image
        source={ad.image}
        style={{ width, height }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
        }}
      >
        <SponsoredBadge compact />
      </View>
    </View>
  );
}

function GradientAdPanel({ ad, colors }: { ad: MockAdConfig; colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <LinearGradient
      colors={[ad.gradient![0], ad.gradient![1], '#0f172a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: '100%',
        height: '100%',
        padding: 16,
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <SponsoredBadge />
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={ad.icon!} size={18} color="#ffffff" />
        </View>
      </View>

      <View>
        <Text style={{ fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>
          {t(ad.advertiserKey)}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#ffffff', marginTop: 4 }} numberOfLines={2}>
          {t(ad.titleKey)}
        </Text>
        <Text
          style={{ fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}
          numberOfLines={2}
        >
          {t(ad.subtitleKey)}
        </Text>

        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(255,206,45,0.95)',
              borderRadius: radius.sm,
              paddingHorizontal: 10,
              paddingVertical: 8,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '800', color: siam.gray.dark }} numberOfLines={1}>
              {t(ad.offerKey)}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: radius.full,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>{t(ad.ctaKey)}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

export function MockAdPanel({ height, width: widthProp, ad: adProp }: MockAdPanelProps) {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const ad = useMemo(() => adProp ?? DEFAULT_MOCK_AD, [adProp]);
  const panelWidth = widthProp ?? windowWidth - spacing.screenPaddingX * 2;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t('ads.sponsored')}: ${t(ad.titleKey)}`}
      style={({ pressed }) => ({
        width: panelWidth,
        height,
        borderRadius: radius.xl,
        overflow: 'hidden',
        opacity: pressed ? 0.94 : 1,
        borderWidth: 1,
        borderColor: colors.border,
        flexShrink: 0,
        alignSelf: 'center',
      })}
    >
      {ad.variant === 'image' ? (
        <ImageAdPanel ad={ad} width={panelWidth} height={height} />
      ) : (
        <GradientAdPanel ad={ad} colors={colors} />
      )}
    </Pressable>
  );
}

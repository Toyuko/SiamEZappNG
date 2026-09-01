import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import { t } from '../../lib/i18n/i18n';
import { brandGradient, radius, siam } from '../../lib/theme/tokens';

type AdSlotProps = {
  onPress?: () => void;
  title?: string;
  subtitle?: string;
  cta?: string;
  /** Fill available vertical space — used on the services screen ad panel. */
  fill?: boolean;
  /** Explicit height when `fill` is false (optional). */
  height?: number;
};

/**
 * Sponsored advertising slot — a clearly-labelled banner placeholder that a real
 * ad (or in-house promo) can be dropped into later.
 */
export function AdSlot({ onPress, title, subtitle, cta, fill = false, height }: AdSlotProps) {
  const isPanel = fill || height != null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${t('ads.sponsored')}: ${title ?? t('ads.title')}`}
      style={({ pressed }) => ({
        borderRadius: radius.lg,
        overflow: 'hidden',
        opacity: pressed ? 0.92 : 1,
        flex: fill ? 1 : undefined,
        height: height ?? undefined,
      })}
    >
      <LinearGradient
        colors={[...brandGradient.colors]}
        start={brandGradient.start}
        end={brandGradient.end}
        style={{
          flex: isPanel ? 1 : undefined,
          minHeight: isPanel ? undefined : 88,
          flexDirection: isPanel ? 'column' : 'row',
          alignItems: isPanel ? 'center' : 'center',
          justifyContent: isPanel ? 'center' : undefined,
          gap: isPanel ? 16 : 12,
          paddingHorizontal: isPanel ? 24 : 14,
          paddingVertical: isPanel ? 24 : 12,
        }}
      >
        <View
          style={{
            width: isPanel ? 72 : 46,
            height: isPanel ? 72 : 46,
            borderRadius: isPanel ? 20 : 14,
            backgroundColor: 'rgba(255,255,255,0.16)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="megaphone" size={isPanel ? 34 : 22} color={siam.yellow.DEFAULT} />
        </View>

        <View style={{ flex: isPanel ? undefined : 1, minWidth: 0, alignItems: isPanel ? 'center' : undefined }}>
          <Text
            style={{
              color: siam.yellow.DEFAULT,
              fontSize: isPanel ? 10 : 9,
              fontWeight: '800',
              letterSpacing: 0.8,
              textAlign: isPanel ? 'center' : 'left',
            }}
          >
            {t('ads.sponsored').toUpperCase()}
          </Text>
          <Text
            numberOfLines={isPanel ? 2 : 1}
            style={{
              color: '#ffffff',
              fontSize: isPanel ? 22 : 15,
              fontWeight: '700',
              marginTop: 4,
              textAlign: isPanel ? 'center' : 'left',
            }}
          >
            {title ?? t('ads.title')}
          </Text>
          <Text
            numberOfLines={isPanel ? 3 : 2}
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: isPanel ? 14 : 12,
              lineHeight: isPanel ? 20 : 16,
              marginTop: 6,
              textAlign: isPanel ? 'center' : 'left',
            }}
          >
            {subtitle ?? t('ads.subtitle')}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: siam.yellow.DEFAULT,
            borderRadius: 999,
            paddingHorizontal: isPanel ? 22 : 14,
            paddingVertical: isPanel ? 12 : 8,
          }}
        >
          <Text style={{ color: '#1f2937', fontSize: isPanel ? 14 : 12, fontWeight: '700' }}>
            {cta ?? t('ads.cta')}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

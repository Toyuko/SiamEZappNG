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
};

/**
 * Sponsored advertising slot — a clearly-labelled banner placeholder that a real
 * ad (or in-house promo) can be dropped into later.
 */
export function AdSlot({ onPress, title, subtitle, cta }: AdSlotProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${t('ads.sponsored')}: ${title ?? t('ads.title')}`}
      style={({ pressed }) => ({ borderRadius: radius.lg, overflow: 'hidden', opacity: pressed ? 0.92 : 1 })}
    >
      <LinearGradient
        colors={[...brandGradient.colors]}
        start={brandGradient.start}
        end={brandGradient.end}
        style={{
          minHeight: 88,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.16)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="megaphone" size={22} color={siam.yellow.DEFAULT} />
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ color: siam.yellow.DEFAULT, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 }}>
            {t('ads.sponsored').toUpperCase()}
          </Text>
          <Text numberOfLines={1} style={{ color: '#ffffff', fontSize: 15, fontWeight: '700', marginTop: 1 }}>
            {title ?? t('ads.title')}
          </Text>
          <Text numberOfLines={2} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 16, marginTop: 2 }}>
            {subtitle ?? t('ads.subtitle')}
          </Text>
        </View>

        <View style={{ backgroundColor: siam.yellow.DEFAULT, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
          <Text style={{ color: '#1f2937', fontSize: 12, fontWeight: '700' }}>{cta ?? t('ads.cta')}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CATEGORY_IMAGES } from '../../features/services/category-images';
import { getServicesByCategory } from '../../features/services/services.data';
import { getCategoryLabel } from '../../features/services/service-display';
import type { ServiceCategoryId } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { radius, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

type CategoryCardProps = {
  categoryId: ServiceCategoryId;
  cardHeight?: number;
  cardWidth?: number;
  portrait?: boolean;
  onPress?: (categoryId: ServiceCategoryId) => void;
};

export function CategoryCard({ categoryId, cardHeight, cardWidth, portrait = false, onPress }: CategoryCardProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const label = getCategoryLabel(categoryId);
  const serviceCount = getServicesByCategory(categoryId).length;
  const heroImage = CATEGORY_IMAGES[categoryId];

  const openCategory = () => {
    if (onPress) {
      onPress(categoryId);
      return;
    }
    router.push({ pathname: '/(tabs)/services', params: { category: categoryId } });
  };

  if (portrait && cardHeight != null && cardWidth != null) {
    const heroHeight = Math.round(cardHeight * 0.38);
    const bodyHeight = cardHeight - heroHeight;

    return (
      <Pressable
        onPress={openCategory}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${t('services.serviceCount', { count: serviceCount })}`}
        style={({ pressed }) => ({
          width: cardWidth,
          height: cardHeight,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          overflow: 'hidden',
          opacity: pressed ? 0.92 : 1,
        })}
      >
        <Image
          source={heroImage}
          accessibilityIgnoresInvertColors
          style={{ width: cardWidth, height: heroHeight }}
          resizeMode="cover"
        />

        <View
          style={{
            width: cardWidth,
            height: bodyHeight,
            paddingHorizontal: spacing.stackSm,
            paddingVertical: spacing.stackSm,
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text
              style={{ fontSize: 11, fontWeight: '700', lineHeight: 14, color: colors.foreground }}
              numberOfLines={3}
            >
              {label}
            </Text>
            <Text
              style={{ fontSize: 9, lineHeight: 12, color: colors.muted, marginTop: 4 }}
              numberOfLines={2}
            >
              {t('services.categoryCardHint')}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 9, fontWeight: '600', color: colors.primary }}>
              {t('services.serviceCount', { count: serviceCount })}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.muted} />
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={openCategory}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${t('services.serviceCount', { count: serviceCount })}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <View
        style={{
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          overflow: 'hidden',
        }}
      >
        <Image
          source={heroImage}
          accessibilityIgnoresInvertColors
          style={{ width: '100%', height: 88 }}
          resizeMode="cover"
        />

        <View style={{ padding: spacing.cardPaddingCompact, gap: spacing.stackSm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Text
              style={{ flex: 1, fontSize: 16, fontWeight: '700', lineHeight: 20, color: colors.foreground }}
              numberOfLines={2}
            >
              {label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </View>
          <Text style={{ fontSize: 12, lineHeight: 16, color: colors.muted }}>{t('services.categoryCardHint')}</Text>
          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.primary }}>
            {t('services.serviceCount', { count: serviceCount })}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

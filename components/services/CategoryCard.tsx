import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getServicesByCategory } from '../../features/services/services.data';
import { getCategoryLabel } from '../../features/services/service-display';
import { SERVICE_CATEGORIES } from '../../features/services/services.types';
import type { ServiceCategoryId } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { radius, shadows, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import {
  SERVICE_ICON_GRADIENT,
  SERVICE_ICON_GRADIENT_END,
  SERVICE_ICON_GRADIENT_START,
} from './service-icon-gradient';

type CategoryCardProps = {
  categoryId: ServiceCategoryId;
};

export function CategoryCard({ categoryId }: CategoryCardProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const config = SERVICE_CATEGORIES.find((item) => item.id === categoryId)!;
  const gradient = SERVICE_ICON_GRADIENT[categoryId];
  const label = getCategoryLabel(categoryId);
  const serviceCount = getServicesByCategory(categoryId).length;
  const shadowStyle = isDark ? shadows.cardDark : shadows.cardLight;

  const openCategory = () => {
    router.push({ pathname: '/(tabs)/services', params: { category: categoryId } });
  };

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
          ...shadowStyle,
        }}
      >
        <LinearGradient
          colors={[gradient.colors[0], gradient.colors[1]]}
          start={SERVICE_ICON_GRADIENT_START}
          end={SERVICE_ICON_GRADIENT_END}
          style={{
            height: 88,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={config.icon}
            size={40}
            color={gradient.foreground}
            style={{ opacity: 0.9 }}
            accessibilityIgnoresInvertColors
          />
        </LinearGradient>

        <View style={{ padding: spacing.cardPaddingCompact, gap: spacing.stackSm }}>
          <View className="flex-row items-center justify-between gap-2">
            <Text className="flex-1 text-base font-bold leading-5" style={{ color: colors.foreground }} numberOfLines={2}>
              {label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </View>
          <Text className="text-xs leading-4" style={{ color: colors.muted }}>
            {t('services.categoryCardHint')}
          </Text>
          <Text className="text-[11px] font-semibold" style={{ color: colors.primary }}>
            {t('services.serviceCount', { count: serviceCount })}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

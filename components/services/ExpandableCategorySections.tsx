import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, Text, UIManager, View } from 'react-native';

import { getCategoryLabel } from '../../features/services/service-display';
import { SERVICE_CATEGORIES, SERVICE_CATEGORY_ORDER } from '../../features/services/services.types';
import type { ServiceCategoryId, ServiceItem } from '../../features/services/services.types';
import { trackFunnel } from '../../lib/analytics/funnel';
import { t } from '../../lib/i18n/i18n';
import { radius, shadows, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import type { CategoryFilterId } from './CategoryChips';
import { ServiceListCard } from './ServiceListCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ExpandableCategorySectionsProps = {
  services: ServiceItem[];
  /** When a chip filter is active, auto-expand that category. */
  activeCategory: CategoryFilterId;
};

type CategoryGroup = {
  categoryId: ServiceCategoryId;
  icon: (typeof SERVICE_CATEGORIES)[number]['icon'];
  items: ServiceItem[];
};

/**
 * Exclusive accordion directory — one category open at a time.
 */
export function ExpandableCategorySections({
  services,
  activeCategory,
}: ExpandableCategorySectionsProps) {
  const { colors } = useTheme();
  const [expandedId, setExpandedId] = useState<ServiceCategoryId | null>(null);

  const groups = useMemo<CategoryGroup[]>(() => {
    return SERVICE_CATEGORY_ORDER.map((categoryId) => {
      const config = SERVICE_CATEGORIES.find((item) => item.id === categoryId);
      const items = services.filter((item) => item.category === categoryId);
      return {
        categoryId,
        icon: config?.icon ?? 'ellipse-outline',
        items,
      };
    }).filter((group) => group.items.length > 0);
  }, [services]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (activeCategory === 'all') {
      setExpandedId(null);
      return;
    }
    setExpandedId(activeCategory);
  }, [activeCategory]);

  const toggle = (categoryId: ServiceCategoryId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((current) => {
      if (current === categoryId) {
        return null;
      }
      trackFunnel('service_category_selected', { category: categoryId, source: 'services_accordion' });
      return categoryId;
    });
  };

  if (groups.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: spacing.stackMd }}>
      <View className="flex-row items-center gap-2">
        <View style={{ width: 4, height: 16, borderRadius: 999, backgroundColor: siam.yellow.DEFAULT }} />
        <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
          {t('services.exploreAllTitle')}
        </Text>
      </View>

      <View
        style={{
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          overflow: 'hidden',
          ...shadows.cardLight,
        }}
      >
        {groups.map((group, index) => {
          const expanded = expandedId === group.categoryId;
          const label = getCategoryLabel(group.categoryId);
          const isLast = index === groups.length - 1;
          return (
            <View
              key={group.categoryId}
              style={{
                borderBottomWidth: isLast && !expanded ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <Pressable
                onPress={() => toggle(group.categoryId)}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                accessibilityLabel={`${label}. ${t('services.serviceCount', { count: group.items.length })}`}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.9 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  backgroundColor: expanded ? siam.blue.tint : colors.card,
                })}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: expanded ? '#FFFFFF' : siam.blue.tint,
                  }}
                >
                  <Ionicons name={group.icon} size={16} color={siam.blue.DEFAULT} />
                </View>
                <Text
                  className="flex-1 text-[14px] font-semibold"
                  numberOfLines={1}
                  style={{ color: colors.foreground }}
                >
                  {label}
                </Text>
                <Text className="text-[11px] font-medium" style={{ color: colors.muted }}>
                  {t('services.serviceCount', { count: group.items.length })}
                </Text>
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-forward'}
                  size={16}
                  color={expanded ? siam.blue.DEFAULT : colors.muted}
                />
              </Pressable>

              {expanded ? (
                <View
                  style={{
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingBottom: 12,
                    paddingTop: 4,
                    backgroundColor: colors.background,
                  }}
                >
                  {group.items.map((service) => (
                    <ServiceListCard
                      key={service.slug}
                      service={service}
                      source="services_accordion"
                    />
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

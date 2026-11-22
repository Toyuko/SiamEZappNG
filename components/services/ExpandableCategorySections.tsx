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
import { ServiceDiscoveryCard } from './ServiceDiscoveryCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ExpandableCategorySectionsProps = {
  services: ServiceItem[];
  /** When a chip filter is active, auto-expand that category. */
  activeCategory: CategoryFilterId;
  /** Slugs already emphasized above (featured / popular) — de-prioritize but still list. */
  deprioritizeSlugs?: Set<string>;
};

type CategoryGroup = {
  categoryId: ServiceCategoryId;
  icon: (typeof SERVICE_CATEGORIES)[number]['icon'];
  items: ServiceItem[];
};

function sortCategoryItems(items: ServiceItem[], deprioritizeSlugs?: Set<string>): ServiceItem[] {
  if (!deprioritizeSlugs || deprioritizeSlugs.size === 0) {
    return items;
  }
  return [...items].sort((a, b) => {
    const aDep = deprioritizeSlugs.has(a.slug) ? 1 : 0;
    const bDep = deprioritizeSlugs.has(b.slug) ? 1 : 0;
    return aDep - bDep;
  });
}

/**
 * Collapsible category directory — keeps the Services page short by default.
 */
export function ExpandableCategorySections({
  services,
  activeCategory,
  deprioritizeSlugs,
}: ExpandableCategorySectionsProps) {
  const { colors } = useTheme();
  const [expandedIds, setExpandedIds] = useState<Set<ServiceCategoryId>>(() => new Set());

  const groups = useMemo<CategoryGroup[]>(() => {
    return SERVICE_CATEGORY_ORDER.map((categoryId) => {
      const config = SERVICE_CATEGORIES.find((item) => item.id === categoryId);
      const items = sortCategoryItems(
        services.filter((item) => item.category === categoryId),
        deprioritizeSlugs,
      );
      return {
        categoryId,
        icon: config?.icon ?? 'ellipse-outline',
        items,
      };
    }).filter((group) => group.items.length > 0);
  }, [deprioritizeSlugs, services]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (activeCategory === 'all') {
      setExpandedIds(new Set());
      return;
    }
    setExpandedIds(new Set([activeCategory]));
  }, [activeCategory]);

  const toggle = (categoryId: ServiceCategoryId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
        trackFunnel('service_category_selected', { category: categoryId, source: 'services_accordion' });
      }
      return next;
    });
  };

  if (groups.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: spacing.stackMd }}>
      <View className="flex-row items-center gap-2">
        <View style={{ width: 4, height: 18, borderRadius: 999, backgroundColor: siam.yellow.DEFAULT }} />
        <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
          {t('services.browseCategoriesTitle')}
        </Text>
      </View>
      <Text className="text-xs leading-4" style={{ color: colors.muted, marginTop: -4 }}>
        {t('services.browseCategoriesSubtitle')}
      </Text>

      <View style={{ gap: spacing.stackSm }}>
        {groups.map((group) => {
          const expanded = expandedIds.has(group.categoryId);
          const label = getCategoryLabel(group.categoryId);
          return (
            <View
              key={group.categoryId}
              style={{
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                overflow: 'hidden',
                ...shadows.cardLight,
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
                  paddingHorizontal: spacing.small,
                  paddingVertical: 12,
                  backgroundColor: expanded ? siam.blue.tint : colors.card,
                })}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: radius.sm,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: expanded ? '#FFFFFF' : siam.blue.tint,
                  }}
                >
                  <Ionicons name={group.icon} size={18} color={siam.blue.DEFAULT} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text className="text-[14px] font-bold" numberOfLines={1} style={{ color: colors.foreground }}>
                    {label}
                  </Text>
                  <Text className="text-[11px]" style={{ color: colors.muted }}>
                    {t('services.serviceCount', { count: group.items.length })}
                  </Text>
                </View>
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={expanded ? siam.blue.DEFAULT : colors.muted}
                />
              </Pressable>

              {expanded ? (
                <View
                  className="flex-row flex-wrap justify-between"
                  style={{
                    gap: 8,
                    paddingHorizontal: spacing.small,
                    paddingBottom: spacing.small,
                    paddingTop: 4,
                    backgroundColor: colors.background,
                  }}
                >
                  {group.items.map((service) => (
                    <ServiceDiscoveryCard
                      key={service.slug}
                      service={service}
                      source="services_accordion"
                      showDescription={false}
                      useShortTitle
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

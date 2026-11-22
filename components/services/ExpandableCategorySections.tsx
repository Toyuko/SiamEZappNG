import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, Text, UIManager, View } from 'react-native';

import {
  getCategoryLabel,
  getServiceDescription,
  getServiceShortTitle,
} from '../../features/services/service-display';
import { SERVICE_CATEGORIES, SERVICE_CATEGORY_ORDER } from '../../features/services/services.types';
import type { ServiceCategoryId, ServiceItem } from '../../features/services/services.types';
import { trackFunnel } from '../../lib/analytics/funnel';
import { t } from '../../lib/i18n/i18n';
import { useLanguageStore } from '../../lib/i18n/useLanguageStore';
import { radius, shadows, siam } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import type { CategoryFilterId } from './CategoryChips';
import { SERVICE_ICON_SURFACE } from './service-icon-surface';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORY_ACCENT: Record<ServiceCategoryId, string> = {
  'driving-vehicle': '#0645B5',
  'immigration-legal': '#1559D6',
  'translation-documents': '#7C3AED',
  'home-property': '#C026D3',
  'transport-private-driver': '#0D9488',
  'events-lifestyle': '#DB2777',
  'business-services': '#EA580C',
};

type ExpandableCategorySectionsProps = {
  services: ServiceItem[];
  activeCategory: CategoryFilterId;
};

type CategoryGroup = {
  categoryId: ServiceCategoryId;
  icon: (typeof SERVICE_CATEGORIES)[number]['icon'];
  items: ServiceItem[];
};

function ExpandedServiceRow({ service }: { service: ServiceItem }) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const language = useLanguageStore((state) => state.language);
  const title = getServiceShortTitle(service, language);
  const description = getServiceDescription(service, language);
  const accent = CATEGORY_ACCENT[service.category];
  const tint = SERVICE_ICON_SURFACE[service.category][isDark ? 'dark' : 'light'];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={() => {
        trackFunnel('service_viewed', { slug: service.slug, source: 'services_accordion' });
        router.push(`/services/${service.slug}`);
      }}
      style={({ pressed }) => ({
        opacity: pressed ? 0.9 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: radius.md,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tint,
        }}
      >
        <Ionicons name={service.icon} size={17} color={accent} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.foreground }} numberOfLines={1}>
          {title}
        </Text>
        <Text style={{ marginTop: 2, fontSize: 11, lineHeight: 14, color: colors.muted }} numberOfLines={1}>
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={colors.muted} />
    </Pressable>
  );
}

/**
 * Premium expandable category cards — one open at a time (not a flat settings list).
 */
export function ExpandableCategorySections({
  services,
  activeCategory,
}: ExpandableCategorySectionsProps) {
  const { colors } = useTheme();
  const language = useLanguageStore((state) => state.language);
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
      if (current === categoryId) return null;
      trackFunnel('service_category_selected', { category: categoryId, source: 'services_accordion' });
      return categoryId;
    });
  };

  if (groups.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 4, height: 16, borderRadius: 999, backgroundColor: siam.yellow.DEFAULT }} />
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>
          {t('services.exploreAllTitle')}
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        {groups.map((group) => {
          const expanded = expandedId === group.categoryId;
          const label = getCategoryLabel(group.categoryId);
          const accent = CATEGORY_ACCENT[group.categoryId];
          const preview = group.items
            .slice(0, 2)
            .map((item) => getServiceShortTitle(item, language))
            .join(' · ');

          return (
            <View
              key={group.categoryId}
              style={{
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: expanded ? `${accent}55` : colors.border,
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
                  opacity: pressed ? 0.92 : 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: expanded ? `${accent}12` : colors.card,
                })}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${accent}18`,
                  }}
                >
                  <Ionicons name={group.icon} size={20} color={accent} />
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground }} numberOfLines={1}>
                    {label}
                  </Text>
                  <Text style={{ marginTop: 2, fontSize: 12, color: colors.muted }} numberOfLines={1}>
                    {expanded
                      ? t('services.serviceCount', { count: group.items.length })
                      : preview || t('services.serviceCount', { count: group.items.length })}
                  </Text>
                </View>

                <View
                  style={{
                    minWidth: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: expanded ? accent : siam.blue.tint,
                    paddingHorizontal: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: expanded ? '#FFFFFF' : siam.blue.DEFAULT }}>
                    {group.items.length}
                  </Text>
                </View>
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={expanded ? accent : colors.muted}
                />
              </Pressable>

              {expanded ? (
                <View
                  style={{
                    gap: 8,
                    paddingHorizontal: 12,
                    paddingBottom: 12,
                    paddingTop: 2,
                    backgroundColor: colors.background,
                  }}
                >
                  {group.items.map((service) => (
                    <ExpandedServiceRow key={service.slug} service={service} />
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

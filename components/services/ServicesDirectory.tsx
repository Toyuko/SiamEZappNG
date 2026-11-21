import { Text, View } from 'react-native';

import { getCategoryLabel } from '../../features/services/service-display';
import { SERVICE_CATEGORY_ORDER } from '../../features/services/services.types';
import type { ServiceCategoryId, ServiceItem } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { ServiceListCard } from './ServiceListCard';

type ServicesDirectoryProps = {
  services: ServiceItem[];
  /** When true, group into category sections. When a single category is filtered, keep a flat list. */
  groupByCategory?: boolean;
  title?: string;
  subtitle?: string;
  source?: string;
};

function CategorySectionHeader({ categoryId, count }: { categoryId: ServiceCategoryId; count: number }) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center justify-between" style={{ marginBottom: 2 }}>
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <View style={{ width: 3, height: 14, borderRadius: 999, backgroundColor: siam.yellow.DEFAULT }} />
        <Text
          className="text-[13px] font-bold uppercase tracking-wide"
          numberOfLines={1}
          style={{ color: colors.foreground, letterSpacing: 0.4 }}
        >
          {getCategoryLabel(categoryId)}
        </Text>
      </View>
      <Text className="text-[11px] font-medium" style={{ color: colors.muted }}>
        {t('services.serviceCount', { count })}
      </Text>
    </View>
  );
}

/**
 * Full services directory — compact premium cards, optionally grouped by category.
 */
export function ServicesDirectory({
  services,
  groupByCategory = true,
  title,
  subtitle,
  source = 'services_directory',
}: ServicesDirectoryProps) {
  const { colors } = useTheme();

  if (services.length === 0) {
    return (
      <View className="items-center py-10">
        <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
          {t('services.emptyTitle')}
        </Text>
        <Text className="mt-2 max-w-[280px] text-center text-sm leading-5" style={{ color: colors.muted }}>
          {t('services.emptyHint')}
        </Text>
      </View>
    );
  }

  const grouped = groupByCategory
    ? SERVICE_CATEGORY_ORDER.map((categoryId) => ({
        categoryId,
        items: services.filter((item) => item.category === categoryId),
      })).filter((group) => group.items.length > 0)
    : null;

  return (
    <View style={{ gap: spacing.stackMd }}>
      {title ? (
        <View style={{ gap: 2 }}>
          <View className="flex-row items-center gap-2">
            <View style={{ width: 4, height: 16, borderRadius: 999, backgroundColor: siam.yellow.DEFAULT }} />
            <Text className="text-base font-bold" style={{ color: colors.foreground }}>
              {title}
            </Text>
          </View>
          {subtitle ? (
            <Text className="text-xs leading-4" style={{ color: colors.muted }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}

      {grouped ? (
        grouped.map((group) => (
          <View key={group.categoryId} style={{ gap: 6 }}>
            <CategorySectionHeader categoryId={group.categoryId} count={group.items.length} />
            {group.items.map((service) => (
              <ServiceListCard key={service.slug} service={service} source={source} />
            ))}
          </View>
        ))
      ) : (
        <View style={{ gap: 6 }}>
          {services.map((service) => (
            <ServiceListCard key={service.slug} service={service} source={source} />
          ))}
        </View>
      )}
    </View>
  );
}

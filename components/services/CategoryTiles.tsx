import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { getServicesByCategory } from '../../features/services/services.data';
import { SERVICE_CATEGORIES } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { radius, shadows, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import type { CategoryFilterId } from './CategoryChips';

type CategoryTilesProps = {
  activeCategory: CategoryFilterId;
  onSelect: (category: CategoryFilterId) => void;
};

const CATEGORY_ICONS: Partial<Record<CategoryFilterId, keyof typeof Ionicons.glyphMap>> = {
  all: 'apps-outline',
  'immigration-legal': 'airplane-outline',
  'driving-vehicle': 'car-outline',
  'translation-documents': 'document-text-outline',
  'business-services': 'business-outline',
  'home-property': 'home-outline',
  'transport-private-driver': 'bus-outline',
  'events-lifestyle': 'sparkles-outline',
};

/** Short chip labels — keep the row compact on mobile. */
const SHORT_LABEL_KEYS: Partial<Record<CategoryFilterId, string>> = {
  all: 'services.allCategory',
  'immigration-legal': 'services.categoryShort.immigration',
  'driving-vehicle': 'services.categoryShort.driving',
  'translation-documents': 'services.categoryShort.translation',
  'business-services': 'services.categoryShort.business',
  'home-property': 'services.categoryShort.property',
  'transport-private-driver': 'services.categoryShort.transport',
  'events-lifestyle': 'services.categoryShort.events',
};

const PREFERRED_ORDER: CategoryFilterId[] = [
  'all',
  'immigration-legal',
  'driving-vehicle',
  'translation-documents',
  'business-services',
  'home-property',
  'transport-private-driver',
  'events-lifestyle',
];

/**
 * Compact horizontal category chips — icon + short label, yellow active state.
 */
export function CategoryTiles({ activeCategory, onSelect }: CategoryTilesProps) {
  const { colors } = useTheme();

  const options = useMemo(() => {
    const next: { id: CategoryFilterId; labelKey: string }[] = [];
    for (const id of PREFERRED_ORDER) {
      if (id === 'all') {
        next.push({ id: 'all', labelKey: SHORT_LABEL_KEYS.all ?? 'services.allCategory' });
        continue;
      }
      const config = SERVICE_CATEGORIES.find((item) => item.id === id);
      if (!config) continue;
      if (getServicesByCategory(id).length === 0) continue;
      next.push({
        id,
        labelKey: SHORT_LABEL_KEYS[id] ?? config.labelKey,
      });
    }
    return next;
  }, []);

  return (
    <View style={{ gap: spacing.stackSm }}>
      <Text className="text-[13px] font-bold" style={{ color: colors.foreground }}>
        {t('services.quickCategories')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.stackSm, paddingVertical: 2, paddingRight: spacing.stackSm }}
      >
        {options.map((item) => {
          const selected = activeCategory === item.id;
          const icon = CATEGORY_ICONS[item.id] ?? 'ellipse-outline';
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.88 : 1,
                minHeight: 40,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: radius.full,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: selected ? siam.yellow.DEFAULT : colors.card,
                borderColor: selected ? siam.yellow.dark : colors.border,
                borderWidth: 1,
                ...shadows.cardLight,
              })}
            >
              <Ionicons name={icon} size={15} color={selected ? siam.blue.navy : colors.primary} />
              <Text
                className="text-xs font-semibold"
                style={{ color: selected ? siam.blue.navy : colors.foreground }}
              >
                {t(item.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

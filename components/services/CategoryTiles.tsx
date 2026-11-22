import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

import { getServicesByCategory } from '../../features/services/services.data';
import { SERVICE_CATEGORIES } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { siam, spacing } from '../../lib/theme/tokens';
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
  'home-property': 'home-outline',
  'transport-private-driver': 'bus-outline',
  'business-services': 'business-outline',
  'events-lifestyle': 'sparkles-outline',
};

const SHORT_LABEL_KEYS: Partial<Record<CategoryFilterId, string>> = {
  all: 'services.allCategory',
  'immigration-legal': 'services.categoryShort.immigration',
  'driving-vehicle': 'services.categoryShort.driving',
  'translation-documents': 'services.categoryShort.translation',
  'home-property': 'services.categoryShort.property',
  'transport-private-driver': 'services.categoryShort.transport',
  'business-services': 'services.categoryShort.business',
  'events-lifestyle': 'services.categoryShort.events',
};

const PREFERRED_ORDER: CategoryFilterId[] = [
  'all',
  'immigration-legal',
  'driving-vehicle',
  'translation-documents',
  'home-property',
  'transport-private-driver',
  'business-services',
  'events-lifestyle',
];

/**
 * Compact horizontal category chips below the featured carousel.
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
      next.push({ id, labelKey: SHORT_LABEL_KEYS[id] ?? config.labelKey });
    }
    return next;
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.stackSm, paddingRight: spacing.stackSm }}
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
              height: 38,
              paddingHorizontal: 14,
              borderRadius: 19,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: selected ? siam.yellow.DEFAULT : '#FFFFFF',
              borderColor: selected ? siam.yellow.dark : colors.border,
              borderWidth: selected ? 1.5 : 1,
              shadowColor: '#052A70',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: selected ? 0.12 : 0.04,
              shadowRadius: 6,
              elevation: selected ? 3 : 1,
            })}
          >
            <Ionicons name={icon} size={15} color={selected ? siam.blue.navy : siam.blue.DEFAULT} />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: selected ? siam.blue.navy : colors.foreground,
              }}
            >
              {t(item.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text } from 'react-native';

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

const TILE_WIDTH = 76;

/**
 * Horizontal category shortcut tiles — icon above label, yellow active state.
 */
export function CategoryTiles({ activeCategory, onSelect }: CategoryTilesProps) {
  const { colors } = useTheme();

  const options: { id: CategoryFilterId; labelKey: string }[] = [{ id: 'all', labelKey: 'services.allCategory' }];
  for (const id of PREFERRED_ORDER) {
    if (id === 'all') continue;
    const config = SERVICE_CATEGORIES.find((item) => item.id === id);
    if (config) {
      options.push({ id, labelKey: config.labelKey });
    }
  }

  return (
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
              width: TILE_WIDTH,
              minHeight: 78,
              paddingHorizontal: 6,
              paddingVertical: 10,
              borderRadius: radius.lg,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: selected ? siam.yellow.DEFAULT : colors.card,
              borderColor: selected ? siam.yellow.dark : colors.border,
              borderWidth: 1,
              ...shadows.cardLight,
            })}
          >
            <Ionicons name={icon} size={22} color={selected ? siam.blue.navy : colors.primary} />
            <Text
              className="text-[10px] font-semibold text-center leading-3"
              numberOfLines={2}
              style={{ color: selected ? siam.blue.navy : colors.foreground }}
            >
              {t(item.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

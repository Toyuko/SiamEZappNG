import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { SERVICE_CATEGORIES } from '../../features/services/services.types';
import type { ServiceCategoryId } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export type CategoryFilterId = ServiceCategoryId | 'all';

type CategoryChipsProps = {
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

const FILTER_OPTIONS: { id: CategoryFilterId; labelKey: string }[] = [
  { id: 'all', labelKey: 'services.allCategory' },
  ...SERVICE_CATEGORIES.map((item) => ({ id: item.id, labelKey: item.labelKey })),
];

export function CategoryChips({ activeCategory, onSelect }: CategoryChipsProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: spacing.stackSm, paddingVertical: 2 }}
    >
      {FILTER_OPTIONS.map((item) => {
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
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: radius.full,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: selected ? siam.yellow.DEFAULT : colors.card,
              borderColor: selected ? siam.yellow.dark : colors.border,
              borderWidth: 1,
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
  );
}

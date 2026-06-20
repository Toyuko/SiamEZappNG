import { Pressable, ScrollView, Text } from 'react-native';

import { SERVICE_CATEGORIES } from '../../features/services/services.types';
import type { ServiceCategoryId } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export type CategoryFilterId = ServiceCategoryId | 'all';

type CategoryChipsProps = {
  activeCategory: CategoryFilterId;
  onSelect: (category: CategoryFilterId) => void;
};

const CHIP_HEIGHT = 38;
const CHIP_PADDING_H = 14;

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
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.88 : 1,
              height: CHIP_HEIGHT,
              paddingHorizontal: CHIP_PADDING_H,
              borderRadius: CHIP_HEIGHT / 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: selected ? colors.primary : colors.card,
              borderColor: colors.border,
              borderWidth: selected ? 0 : 1,
            })}
          >
            <Text className="text-xs font-semibold" style={{ color: selected ? '#ffffff' : colors.foreground }}>
              {t(item.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

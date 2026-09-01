import { Pressable, Text, View } from 'react-native';
import {
  Briefcase,
  Car,
  Code,
  Dumbbell,
  FileCheck,
  Flame,
  Hammer,
  IdCard,
  Languages,
  Megaphone,
  Palette,
  Scale,
  Sparkles,
  Stamp,
  Wrench,
  Zap,
} from 'lucide-react-native';

import { CATEGORY_LABELS, CATEGORY_ORDER } from '../../features/matching/matching.constants';
import type { ServiceCategoryId } from '../../features/matching/matching.types';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

const ICONS: Record<ServiceCategoryId, typeof Wrench> = {
  vehicle_registration: FileCheck,
  motorbike_mechanic: Wrench,
  thai_license: IdCard,
  driver: Car,
  construction: Hammer,
  visa: Stamp,
  legal: Scale,
  interpreter: Languages,
  fitness: Dumbbell,
  boxing: Flame,
  translator: Languages,
  electrician: Zap,
  plumber: Sparkles,
  graphic_designer: Palette,
  web_developer: Code,
  marketing: Megaphone,
  cleaner: Briefcase,
};

type CategoryPickerProps = {
  value: ServiceCategoryId | null;
  onChange: (id: ServiceCategoryId) => void;
  values?: ServiceCategoryId[];
  onToggle?: (id: ServiceCategoryId) => void;
};

export function CategoryPicker({ value, onChange, values, onToggle }: CategoryPickerProps) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {CATEGORY_ORDER.map((id) => {
        const Icon = ICONS[id];
        const selected = onToggle ? Boolean(values?.includes(id)) : value === id;
        return (
          <Pressable
            key={id}
            onPress={() => (onToggle ? onToggle(id) : onChange(id))}
            accessibilityRole="button"
            accessibilityLabel={CATEGORY_LABELS[id]}
            accessibilityState={{ selected }}
            style={{
              width: '47%',
              flexGrow: 1,
              minWidth: 140,
              borderRadius: radius.lg,
              borderWidth: 1.5,
              borderColor: selected ? siam.yellow.DEFAULT : colors.border,
              backgroundColor: selected ? siam.blue.DEFAULT : colors.card,
              padding: spacing.stackMd,
              minHeight: 72,
              gap: 8,
            }}
          >
            <Icon size={20} color={selected ? siam.yellow.DEFAULT : colors.primary} />
            <Text style={{ color: selected ? '#fff' : colors.foreground, fontWeight: '700', fontSize: 13 }}>
              {CATEGORY_LABELS[id]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

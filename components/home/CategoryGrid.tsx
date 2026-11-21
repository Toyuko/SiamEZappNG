import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import {
  Briefcase,
  Car,
  FileText,
  Home,
  Plane,
  Sparkles,
  Truck,
  type LucideIcon,
} from 'lucide-react-native';

import { getCategoryLabel } from '../../features/services/service-display';
import { SERVICE_CATEGORIES } from '../../features/services/services.types';
import type { ServiceCategoryId } from '../../features/services/services.types';
import { trackFunnel } from '../../lib/analytics/funnel';
import { radius, shadows, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { FadeInView } from '../ui/FadeInView';
import { Section } from '../ui/Section';

const CATEGORY_ICONS: Record<ServiceCategoryId, LucideIcon> = {
  'driving-vehicle': Car,
  'immigration-legal': Plane,
  'translation-documents': FileText,
  'home-property': Home,
  'transport-private-driver': Truck,
  'events-lifestyle': Sparkles,
  'business-services': Briefcase,
};

type CategoryGridProps = {
  title: string;
  subtitle?: string;
};

export function CategoryGrid({ title, subtitle }: CategoryGridProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Section title={title} subtitle={subtitle}>
      <View className="flex-row flex-wrap" style={{ gap: 10 }}>
        {SERVICE_CATEGORIES.map((category, index) => {
          const Icon = CATEGORY_ICONS[category.id];
          return (
            <FadeInView key={category.id} delay={40 + index * 40} distance={10} style={{ width: '48%', flexGrow: 1 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={getCategoryLabel(category.id)}
                onPress={() => {
                  trackFunnel('service_category_selected', { category: category.id });
                  router.push({ pathname: '/(tabs)/services', params: { category: category.id } });
                }}
                style={({ pressed }) => ({
                  minHeight: 88,
                  paddingVertical: spacing.stackMd,
                  paddingHorizontal: spacing.stackMd,
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  opacity: pressed ? 0.88 : 1,
                  ...shadows.cardLight,
                })}
              >
                <View
                  className="mb-2 h-9 w-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${colors.primary}18` }}
                >
                  <Icon size={18} color={colors.primary} strokeWidth={2.2} />
                </View>
                <Text className="text-sm font-semibold" numberOfLines={2} style={{ color: colors.foreground }}>
                  {getCategoryLabel(category.id)}
                </Text>
              </Pressable>
            </FadeInView>
          );
        })}
      </View>
    </Section>
  );
}

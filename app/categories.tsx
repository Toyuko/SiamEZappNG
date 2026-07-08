import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { CategoryCard } from '../../components/services/CategoryCard';
import { AdSlot } from '../../components/ui/AdSlot';
import { SERVICE_CATEGORIES } from '../../features/services/services.types';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

export default function CategoriesScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']} style={{ backgroundColor: colors.background }}>
      <View className="flex-1" style={{ paddingHorizontal: spacing.screenPaddingX }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.stackMd,
            paddingTop: spacing.stackSm,
            paddingBottom: spacing.stackMd,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1, gap: 2 }}>
            <Text className="text-2xl font-bold tracking-tight" style={{ color: colors.foreground }}>
              {t('services.categoriesPage.title')}
            </Text>
            <Text className="text-sm leading-5" style={{ color: colors.muted }}>
              {t('services.categoriesPage.subtitle')}
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.stackMd, paddingBottom: spacing.stackLg }}
        >
          {SERVICE_CATEGORIES.map((category) => (
            <CategoryCard key={category.id} categoryId={category.id} />
          ))}
        </ScrollView>

        <View style={{ paddingVertical: spacing.stackMd }}>
          <AdSlot />
        </View>
      </View>
    </SafeAreaView>
  );
}

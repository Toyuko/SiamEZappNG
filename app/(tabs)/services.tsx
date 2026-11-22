import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryDiscoveryGrid } from '../../components/services/CategoryDiscoveryGrid';
import { ServiceSearchBar, ServiceSearchResults } from '../../components/services/ServiceSearchBar';
import { ServicesPageHeader } from '../../components/services/ServicesPageHeader';
import { VOICE_FAB_SCROLL_EXTRA } from '../../components/voice/voice-fab-layout';
import type { ServiceCategoryId } from '../../features/services/services.types';
import { trackFunnel } from '../../lib/analytics/funnel';
import { t } from '../../lib/i18n/i18n';
import { radius, shadows, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';

/**
 * Services landing — preserve branded header; content is category discovery only.
 */
export default function ServicesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const searching = searchQuery.trim().length > 0;

  useFocusEffect(
    useCallback(() => {
      return () => {
        Keyboard.dismiss();
      };
    }, []),
  );

  const openCategory = (categoryId: ServiceCategoryId) => {
    trackFunnel('service_category_selected', { category: categoryId, source: 'services_landing' });
    router.push({ pathname: '/all-services', params: { category: categoryId } });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ServicesPageHeader />

      <SafeAreaView className="flex-1" edges={['left', 'right', 'bottom']}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            paddingHorizontal: spacing.medium,
            paddingTop: spacing.standard,
            paddingBottom: 100 + VOICE_FAB_SCROLL_EXTRA,
            gap: spacing.section,
          }}
        >
          <ServiceSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            backgroundColor={colors.card}
          />

          {searching ? (
            <ServiceSearchResults query={searchQuery} />
          ) : (
            <View style={{ gap: spacing.stackLg }}>
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    style={{ width: 4, height: 18, borderRadius: 999, backgroundColor: siam.yellow.DEFAULT }}
                  />
                  <Text style={{ fontSize: 22, fontWeight: '800', color: colors.foreground }}>
                    {t('services.exploreServicesTitle')}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, lineHeight: 20, color: colors.muted, paddingLeft: 12 }}>
                  {t('services.exploreServicesSubtitle')}
                </Text>
              </View>

              <CategoryDiscoveryGrid onSelect={openCategory} limit={6} compact />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('services.exploreAllCategories')}
                onPress={() => router.push('/categories')}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.92 : 1,
                  minHeight: 52,
                  borderRadius: radius.lg,
                  backgroundColor: siam.blue.DEFAULT,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingHorizontal: 18,
                  ...shadows.cardLight,
                })}
              >
                <Ionicons name="grid-outline" size={18} color="#FFFFFF" />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>
                  {t('services.exploreAllCategories')}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={siam.yellow.DEFAULT} />
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

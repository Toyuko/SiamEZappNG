import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useSalesStore } from '../../store/sales-store';

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(amount);
}

export default function SalesDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const listing = useSalesStore((state) => state.listings.find((item) => item.id === id));

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.screenPaddingX, paddingTop: spacing.stackMd, paddingBottom: 40, gap: spacing.stackMd }}>
        <Button label={t('common.back')} variant="secondary" size="md" onPress={() => router.back()} />

        {!listing ? (
          <Card>
            <Text className="text-center text-sm" style={{ color: colors.muted }}>
              {t('sales.notFound')}
            </Text>
          </Card>
        ) : (
          <Card shadow="medium">
            <Image source={{ uri: listing.heroImageUrl }} className="h-56 w-full rounded-xl" resizeMode="cover" />
            <Text className="mt-4 text-2xl font-bold" style={{ color: colors.primary }}>
              {formatMoney(listing.priceAmount)}
            </Text>
            <Text className="mt-1 text-xl font-semibold" style={{ color: colors.foreground }}>
              {listing.make} {listing.model}
            </Text>
            <Text className="mt-1 text-sm" style={{ color: colors.muted }}>
              {listing.year} - {listing.mileageKm.toLocaleString()} km
            </Text>

            <View className="mt-4 rounded-xl border p-3" style={{ borderColor: colors.border }}>
              <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                {listing.title}
              </Text>
              <Text className="mt-1 text-sm leading-6" style={{ color: colors.muted }}>
                {listing.description}
              </Text>
              <Text className="mt-3 text-xs uppercase tracking-wide" style={{ color: colors.muted }}>
                {t(`sales.status.${listing.status}`)}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

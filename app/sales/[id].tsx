import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Image, Linking, Pressable, ScrollView, Text, View } from 'react-native';
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

const CONTACT_LINE_URL = 'https://line.me/R/ti/p/@siamez';
const CONTACT_WHATSAPP_URL = 'https://wa.me/66643438768';
const CONTACT_PHONE_URL = 'tel:+66643438768';
const CONTACT_EMAIL_URL = 'mailto:inquiries@siam-ez.com';

async function openExternalLink(url: string) {
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    Alert.alert(t('serviceDetail.cannotOpenLink'), t('serviceDetail.tryAgainLater'));
    return;
  }
  await Linking.openURL(url);
}

export default function SalesDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const listing = useSalesStore((state) => state.listings.find((item) => item.id === id));
  const categoryLabel = listing?.category === 'car' ? t('sales.categoryCars') : t('sales.categoryMotorcycles');

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.screenPaddingX, paddingTop: spacing.stackMd, paddingBottom: 40, gap: spacing.stackMd }}>
        <Pressable onPress={() => router.back()} className="self-start px-1 py-1">
          <Text className="text-sm font-medium" style={{ color: colors.muted }}>
            {t('sales.backToInventory')}
          </Text>
        </Pressable>
        <Button label={t('common.back')} variant="secondary" size="md" onPress={() => router.back()} />

        {!listing ? (
          <Card>
            <Text className="text-center text-sm" style={{ color: colors.muted }}>
              {t('sales.notFound')}
            </Text>
          </Card>
        ) : (
          <Card shadow="medium">
            <Text className="text-sm" style={{ color: colors.muted }}>
              {t('sales.gallery')}
            </Text>
            <Image source={{ uri: listing.heroImageUrl }} className="h-56 w-full rounded-xl" resizeMode="cover" />
            <Text className="mt-4 text-2xl font-bold" style={{ color: colors.primary }}>
              {formatMoney(listing.priceAmount)}
            </Text>
            <Text className="mt-1 text-xl font-semibold" style={{ color: colors.foreground }}>
              {listing.year} {listing.make} {listing.model}
            </Text>

            <View className="mt-4 rounded-xl border p-3" style={{ borderColor: colors.border }}>
              <Text className="text-xs uppercase tracking-wide" style={{ color: colors.muted }}>
                {t('sales.mileage')}
              </Text>
              <Text className="mt-1 text-base font-semibold" style={{ color: colors.foreground }}>
                {listing.mileageKm.toLocaleString()} km
              </Text>
            </View>

            <View className="mt-3 rounded-xl border p-3" style={{ borderColor: colors.border }}>
              <Text className="text-xs uppercase tracking-wide" style={{ color: colors.muted }}>
                {t('sales.category')}
              </Text>
              <Text className="mt-1 text-base font-semibold capitalize" style={{ color: colors.foreground }}>
                {categoryLabel}
              </Text>
            </View>

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

            <View className="mt-4">
              <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                {t('sales.contactSeller')}
              </Text>
              <View className="mt-3 gap-2">
                <Button label={t('sales.contactWhatsApp')} variant="secondary" size="md" onPress={() => void openExternalLink(CONTACT_WHATSAPP_URL)} />
                <Button label={t('sales.contactLine')} variant="secondary" size="md" onPress={() => void openExternalLink(CONTACT_LINE_URL)} />
                <Button label={t('sales.contactCall')} variant="secondary" size="md" onPress={() => void openExternalLink(CONTACT_PHONE_URL)} />
                <Button label={t('sales.contactEmail')} variant="secondary" size="md" onPress={() => void openExternalLink(CONTACT_EMAIL_URL)} />
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Image, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useRealEstateStore } from '../../store/real-estate-store';

function formatMoney(amount: number, currency = 'THB') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
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

function SpecRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View className="mt-3 rounded-xl border p-3" style={{ borderColor: colors.border }}>
      <Text className="text-xs uppercase tracking-wide" style={{ color: colors.muted }}>
        {label}
      </Text>
      <Text className="mt-1 text-base font-semibold" style={{ color: colors.foreground }}>
        {value}
      </Text>
    </View>
  );
}

export default function RealEstateDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const listing = useRealEstateStore((state) => state.listings.find((item) => item.id === id));
  const location = listing
    ? [listing.neighborhood, listing.district, listing.province].filter(Boolean).join(', ')
    : '';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPaddingX,
          paddingTop: spacing.stackMd,
          paddingBottom: 40,
          gap: spacing.stackMd,
        }}
      >
        <Pressable onPress={() => router.back()} className="self-start px-1 py-1">
          <Text className="text-sm font-medium" style={{ color: colors.muted }}>
            {t('realEstate.backToInventory')}
          </Text>
        </Pressable>
        <Button label={t('common.back')} variant="secondary" size="md" onPress={() => router.back()} />

        {!listing ? (
          <Card>
            <Text className="text-center text-sm" style={{ color: colors.muted }}>
              {t('realEstate.notFound')}
            </Text>
          </Card>
        ) : (
          <Card shadow="medium">
            <Text className="text-sm" style={{ color: colors.muted }}>
              {t('realEstate.gallery')}
            </Text>
            <Image source={{ uri: listing.heroImageUrl }} className="h-56 w-full rounded-xl" resizeMode="cover" />
            <Text className="mt-4 text-2xl font-bold" style={{ color: colors.primary }}>
              {listing.priceAmount <= 0
                ? t('realEstate.priceContactSeller')
                : formatMoney(listing.priceAmount, listing.priceCurrency)}
              {listing.listingType === 'rent' && listing.priceAmount > 0 ? (
                <Text className="text-base font-medium" style={{ color: colors.muted }}>
                  {' '}
                  {t('realEstate.perMonth')}
                </Text>
              ) : null}
            </Text>
            <Text className="mt-1 text-xl font-semibold" style={{ color: colors.foreground }}>
              {listing.title}
            </Text>
            {location ? (
              <Text className="mt-1 text-sm" style={{ color: colors.muted }}>
                {location}
              </Text>
            ) : null}

            <SpecRow label={t('realEstate.listingType.label')} value={t(`realEstate.listingType.${listing.listingType}`)} />
            <SpecRow
              label={t('realEstate.propertyType.label')}
              value={t(`realEstate.propertyType.${listing.propertyType}`)}
            />
            <SpecRow
              label={t('realEstate.bedsLabel')}
              value={
                listing.bedrooms == null
                  ? t('realEstate.bedsNa')
                  : listing.bedrooms === 0
                    ? t('realEstate.studio')
                    : t('realEstate.bedsShort', { count: listing.bedrooms })
              }
            />
            <SpecRow
              label={t('realEstate.bathsLabel')}
              value={
                listing.bathrooms == null
                  ? t('realEstate.bathsNa')
                  : t('realEstate.bathsShort', { count: listing.bathrooms })
              }
            />
            <SpecRow label={t('realEstate.areaLabel')} value={`${listing.areaSqm} m²`} />
            {listing.landAreaSqm != null ? (
              <SpecRow label={t('realEstate.landAreaLabel')} value={`${listing.landAreaSqm} m²`} />
            ) : null}
            {listing.floor != null ? (
              <SpecRow label={t('realEstate.floorLabel')} value={String(listing.floor)} />
            ) : null}
            {listing.yearBuilt != null ? (
              <SpecRow label={t('realEstate.yearBuiltLabel')} value={String(listing.yearBuilt)} />
            ) : null}
            <SpecRow
              label={t('realEstate.furnishedLabel')}
              value={t(`realEstate.furnished.${listing.furnished}`)}
            />
            <SpecRow
              label={t('realEstate.sellerKind.label')}
              value={t(`realEstate.sellerKind.${listing.sellerKind === 'dealer' ? 'dealerBadge' : 'privateBadge'}`)}
            />

            <View className="mt-4 rounded-xl border p-3" style={{ borderColor: colors.border }}>
              <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                {listing.title}
              </Text>
              {listing.description ? (
                <Text className="mt-1 text-sm leading-6" style={{ color: colors.muted }}>
                  {listing.description}
                </Text>
              ) : null}
              <Text className="mt-3 text-xs uppercase tracking-wide" style={{ color: colors.muted }}>
                {t(`realEstate.status.${listing.status === 'pending_boost' ? 'available' : listing.status}`)}
              </Text>
            </View>

            <View className="mt-4">
              <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                {t('realEstate.contactSeller')}
              </Text>
              <View className="mt-3 gap-2">
                <Button
                  label={t('realEstate.contactWhatsApp')}
                  variant="secondary"
                  size="md"
                  onPress={() => void openExternalLink(CONTACT_WHATSAPP_URL)}
                />
                <Button
                  label={t('realEstate.contactLine')}
                  variant="secondary"
                  size="md"
                  onPress={() => void openExternalLink(CONTACT_LINE_URL)}
                />
                <Button
                  label={t('realEstate.contactCall')}
                  variant="secondary"
                  size="md"
                  onPress={() => void openExternalLink(CONTACT_PHONE_URL)}
                />
                <Button
                  label={t('realEstate.contactEmail')}
                  variant="secondary"
                  size="md"
                  onPress={() => void openExternalLink(CONTACT_EMAIL_URL)}
                />
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

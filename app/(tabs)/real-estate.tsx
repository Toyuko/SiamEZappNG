import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, type ReactNode } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ListingBadges } from '../../components/marketplace/ListingBadges';
import { VOICE_FAB_SCROLL_EXTRA } from '../../components/voice/voice-fab-layout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FadeInView } from '../../components/ui/FadeInView';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { createSavedSearch } from '../../features/marketplace/saved-searches.api';
import type {
  PropertyListingStatus,
  PropertyListingType,
  PropertySellerKind,
  PropertyType,
  RealEstateListing,
} from '../../features/real-estate/real-estate.types';
import {
  useCreatePropertyListing,
  useDeletePropertyListing,
  useMyPropertyListings,
  useRealEstateListings,
  useUpdatePropertyListing,
} from '../../hooks/use-real-estate-listings';
import { t } from '../../lib/i18n/i18n';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

type FilterSectionKey = 'listingType' | 'propertyType' | 'sellerKind' | 'more';

function FilterSection({
  label,
  summary,
  expanded,
  onToggle,
  children,
}: {
  label: string;
  summary: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View className="gap-2">
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={label}
        className="flex-row items-center justify-between gap-2 py-1"
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
            {label}
          </Text>
          {!expanded ? (
            <Text className="mt-0.5 text-xs" numberOfLines={1} style={{ color: colors.muted }}>
              {summary}
            </Text>
          ) : null}
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
      </Pressable>
      {expanded ? children : null}
    </View>
  );
}

type FormState = {
  title: string;
  propertyType: PropertyType;
  listingType: PropertyListingType;
  bedrooms: string;
  bathrooms: string;
  areaSqm: string;
  province: string;
  district: string;
  priceAmount: string;
  heroImageUrl: string;
  description: string;
  sellerKind: PropertySellerKind;
  status: PropertyListingStatus;
};

const defaultForm: FormState = {
  title: '',
  propertyType: 'condo',
  listingType: 'sale',
  bedrooms: '',
  bathrooms: '',
  areaSqm: '',
  province: '',
  district: '',
  priceAmount: '',
  heroImageUrl: '',
  description: '',
  sellerKind: 'private',
  status: 'available',
};

const PROPERTY_TYPES: PropertyType[] = ['condo', 'house', 'townhouse', 'land', 'commercial', 'villa'];

function formatMoney(amount: number, currency = 'THB') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

function parseInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseOptionalInteger(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function listingToForm(listing: RealEstateListing): FormState {
  return {
    title: listing.title,
    propertyType: listing.propertyType,
    listingType: listing.listingType,
    bedrooms: listing.bedrooms == null ? '' : String(listing.bedrooms),
    bathrooms: listing.bathrooms == null ? '' : String(listing.bathrooms),
    areaSqm: String(listing.areaSqm),
    province: listing.province,
    district: listing.district ?? '',
    priceAmount: String(listing.priceAmount),
    heroImageUrl: listing.heroImageUrl,
    description: listing.description,
    sellerKind: listing.sellerKind,
    status: listing.status === 'pending_boost' ? 'available' : listing.status,
  };
}

function bedsLabel(bedrooms: number | null) {
  if (bedrooms == null) return t('realEstate.bedsNa');
  if (bedrooms === 0) return t('realEstate.studio');
  return t('realEstate.bedsShort', { count: bedrooms });
}

function bathsLabel(bathrooms: number | null) {
  if (bathrooms == null) return t('realEstate.bathsNa');
  return t('realEstate.bathsShort', { count: bathrooms });
}

export default function RealEstateScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isGuest = useAuthStore((state) => state.isGuest);
  const isAuthenticated = Boolean(accessToken) && !isGuest;
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState<'all' | PropertyType>('all');
  const [listingType, setListingType] = useState<'all' | PropertyListingType>('all');
  const [sellerKind, setSellerKind] = useState<'all' | PropertySellerKind>('all');
  const [sort, setSort] = useState<'latest' | 'priceAsc' | 'priceDesc' | 'areaDesc' | 'areaAsc'>('latest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBeds, setMinBeds] = useState('');
  const [province, setProvince] = useState('');
  const [expandedFilters, setExpandedFilters] = useState<Record<FilterSectionKey, boolean>>({
    listingType: false,
    propertyType: false,
    sellerKind: false,
    more: false,
  });

  const [formState, setFormState] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      search,
      propertyType,
      listingType,
      sellerKind,
      sort,
      minPrice: parseInteger(minPrice) || undefined,
      maxPrice: parseInteger(maxPrice) || undefined,
      minBedrooms: parseInteger(minBeds) || undefined,
      province: province.trim() || undefined,
      pageSize: 48,
    }),
    [listingType, maxPrice, minBeds, minPrice, propertyType, province, search, sellerKind, sort]
  );

  const listingsQuery = useRealEstateListings(filters);
  const myListingsQuery = useMyPropertyListings(isAuthenticated);
  const createListing = useCreatePropertyListing();
  const updateListing = useUpdatePropertyListing();
  const deleteListingMut = useDeletePropertyListing();
  const saveSearch = useMutation({
    mutationFn: createSavedSearch,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['saved-searches'] });
      Alert.alert('Saved', 'Search saved to your Saved hub.');
    },
    onError: (e) =>
      Alert.alert('Could not save search', e instanceof Error ? e.message : 'Try again'),
  });

  const filteredListings = listingsQuery.data?.items ?? [];
  const myListings = myListingsQuery.data ?? [];
  const loadingRemote = listingsQuery.isLoading;
  const loadError = listingsQuery.isError
    ? listingsQuery.error instanceof Error
      ? listingsQuery.error.message
      : 'Unable to sync website inventory.'
    : null;

  const toggleFilterSection = (key: FilterSectionKey) => {
    setExpandedFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const moreFiltersSummary = [
    minPrice.trim() ? `${t('realEstate.minPrice')}: ${minPrice.trim()}` : null,
    maxPrice.trim() ? `${t('realEstate.maxPrice')}: ${maxPrice.trim()}` : null,
    minBeds.trim() ? `${t('realEstate.minBedrooms')}: ${minBeds.trim()}` : null,
    province.trim() || null,
    t(`realEstate.sort.${sort}`),
  ]
    .filter(Boolean)
    .join(' · ');

  const isEditing = editingId !== null;

  const statusBadge = (status: PropertyListingStatus) => {
    if (status === 'available' || status === 'pending_boost') return { bg: colors.success, fg: '#ffffff' };
    if (status === 'reserved') return { bg: siam.yellow.DEFAULT, fg: '#1f2937' };
    return { bg: colors.danger, fg: '#ffffff' };
  };

  const resetForm = () => {
    setFormState(defaultForm);
    setEditingId(null);
  };

  const submitForm = () => {
    if (!user || !isAuthenticated) return;
    const payload = {
      title: formState.title.trim(),
      propertyType: formState.propertyType,
      listingType: formState.listingType,
      bedrooms: parseOptionalInteger(formState.bedrooms),
      bathrooms: parseOptionalInteger(formState.bathrooms),
      areaSqm: parseInteger(formState.areaSqm),
      province: formState.province.trim(),
      district: formState.district.trim() || null,
      priceAmount: parseInteger(formState.priceAmount),
      sellerKind: formState.sellerKind,
      status: formState.status,
      heroImageUrl: formState.heroImageUrl.trim(),
      description: formState.description.trim(),
    };

    if (!payload.title || !payload.province || payload.areaSqm <= 0 || !payload.heroImageUrl) {
      return;
    }

    const onError = (e: unknown) =>
      Alert.alert('Could not save listing', e instanceof Error ? e.message : 'Try again');

    if (editingId) {
      updateListing.mutate(
        { id: editingId, input: payload },
        { onSuccess: () => resetForm(), onError }
      );
    } else {
      createListing.mutate(payload, { onSuccess: () => resetForm(), onError });
    }
  };

  const handleSaveSearch = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign in required', 'Log in to save this search.');
      return;
    }
    const query: Record<string, string> = { sort };
    if (search.trim()) query.search = search.trim();
    if (propertyType !== 'all') query.propertyType = propertyType;
    if (listingType !== 'all') query.listingType = listingType;
    if (sellerKind !== 'all') query.sellerKind = sellerKind;
    if (minPrice.trim()) query.minPrice = minPrice.trim();
    if (maxPrice.trim()) query.maxPrice = maxPrice.trim();
    if (minBeds.trim()) query.minBedrooms = minBeds.trim();
    if (province.trim()) query.province = province.trim();
    saveSearch.mutate({
      name: [listingType === 'all' ? 'Properties' : listingType, propertyType === 'all' ? null : propertyType, province.trim() || null]
        .filter(Boolean)
        .join(' · ')
        .slice(0, 80) || 'Property search',
      listingType: 'property',
      query,
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPaddingX,
          paddingTop: spacing.stackMd,
          paddingBottom: 40 + VOICE_FAB_SCROLL_EXTRA,
          gap: spacing.sectionGap,
        }}
      >
        <FadeInView delay={0} distance={22}>
          <PageHeader title={t('realEstate.title')} subtitle={t('realEstate.subtitle')} />
        </FadeInView>

        {loadingRemote ? (
          <Card compact>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {t('realEstate.syncing')}
            </Text>
          </Card>
        ) : null}
        {loadError ? (
          <Card compact>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {t('realEstate.syncFailed')}
            </Text>
          </Card>
        ) : null}

        <FadeInView delay={80}>
          <Card>
            <View className="gap-3">
              <Input placeholder={t('realEstate.searchPlaceholder')} value={search} onChangeText={setSearch} />
              <FilterSection
                label={t('realEstate.listingType.label')}
                summary={t(`realEstate.listingType.${listingType}`)}
                expanded={expandedFilters.listingType}
                onToggle={() => toggleFilterSection('listingType')}
              >
                <View className="gap-2">
                  <Button
                    label={t('realEstate.listingType.all')}
                    size="md"
                    variant={listingType === 'all' ? 'primary' : 'secondary'}
                    onPress={() => setListingType('all')}
                  />
                  <Button
                    label={t('realEstate.listingType.sale')}
                    size="md"
                    variant={listingType === 'sale' ? 'primary' : 'secondary'}
                    onPress={() => setListingType('sale')}
                  />
                  <Button
                    label={t('realEstate.listingType.rent')}
                    size="md"
                    variant={listingType === 'rent' ? 'primary' : 'secondary'}
                    onPress={() => setListingType('rent')}
                  />
                </View>
              </FilterSection>
              <FilterSection
                label={t('realEstate.propertyType.label')}
                summary={t(`realEstate.propertyType.${propertyType}`)}
                expanded={expandedFilters.propertyType}
                onToggle={() => toggleFilterSection('propertyType')}
              >
                <View className="gap-2">
                  <Button
                    label={t('realEstate.propertyType.all')}
                    size="md"
                    variant={propertyType === 'all' ? 'primary' : 'secondary'}
                    onPress={() => setPropertyType('all')}
                  />
                  {PROPERTY_TYPES.map((type) => (
                    <Button
                      key={type}
                      label={t(`realEstate.propertyType.${type}`)}
                      size="md"
                      variant={propertyType === type ? 'primary' : 'secondary'}
                      onPress={() => setPropertyType(type)}
                    />
                  ))}
                </View>
              </FilterSection>
              <FilterSection
                label={t('realEstate.sellerKind.label')}
                summary={t(`realEstate.sellerKind.${sellerKind}`)}
                expanded={expandedFilters.sellerKind}
                onToggle={() => toggleFilterSection('sellerKind')}
              >
                <View className="gap-2">
                  <Button
                    label={t('realEstate.sellerKind.all')}
                    size="md"
                    variant={sellerKind === 'all' ? 'primary' : 'secondary'}
                    onPress={() => setSellerKind('all')}
                  />
                  <Button
                    label={t('realEstate.sellerKind.dealer')}
                    size="md"
                    variant={sellerKind === 'dealer' ? 'primary' : 'secondary'}
                    onPress={() => setSellerKind('dealer')}
                  />
                  <Button
                    label={t('realEstate.sellerKind.private')}
                    size="md"
                    variant={sellerKind === 'private' ? 'primary' : 'secondary'}
                    onPress={() => setSellerKind('private')}
                  />
                </View>
              </FilterSection>
              <FilterSection
                label={t('realEstate.moreFilters')}
                summary={moreFiltersSummary}
                expanded={expandedFilters.more}
                onToggle={() => toggleFilterSection('more')}
              >
                <View className="gap-2">
                  <View className="flex-row gap-2">
                    <Input
                      className="flex-1"
                      placeholder={t('realEstate.minPrice')}
                      value={minPrice}
                      onChangeText={setMinPrice}
                      keyboardType="numeric"
                    />
                    <Input
                      className="flex-1"
                      placeholder={t('realEstate.maxPrice')}
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="flex-row gap-2">
                    <Input
                      className="flex-1"
                      placeholder={t('realEstate.minBedrooms')}
                      value={minBeds}
                      onChangeText={setMinBeds}
                      keyboardType="numeric"
                    />
                    <Input
                      className="flex-1"
                      placeholder={t('realEstate.provincePlaceholder')}
                      value={province}
                      onChangeText={setProvince}
                    />
                  </View>
                  <Text className="text-xs font-medium" style={{ color: colors.muted }}>
                    {t('realEstate.sort.label')}
                  </Text>
                  <View className="gap-2">
                    {(['latest', 'priceAsc', 'priceDesc', 'areaDesc', 'areaAsc'] as const).map((option) => (
                      <Button
                        key={option}
                        label={t(`realEstate.sort.${option}`)}
                        size="md"
                        variant={sort === option ? 'primary' : 'secondary'}
                        onPress={() => setSort(option)}
                      />
                    ))}
                  </View>
                </View>
              </FilterSection>
              <Button
                label={saveSearch.isPending ? 'Saving…' : 'Save this search'}
                variant="secondary"
                size="md"
                onPress={handleSaveSearch}
              />
            </View>
          </Card>
        </FadeInView>

        <View className="gap-3">
          {filteredListings.map((listing, index) => {
            const badge = statusBadge(listing.status);
            const location = [listing.district, listing.province].filter(Boolean).join(', ');
            const boosted = Boolean(listing.boostActive ?? listing.isBoosted);
            return (
              <FadeInView key={listing.id} delay={Math.min(index * 60, 320)} distance={18} scaleFrom={0.98}>
                <Pressable
                  onPress={() => router.push(`/real-estate/${listing.id}`)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.94 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })}
                >
                  <Card shadow="medium">
                    <View style={{ position: 'relative' }}>
                      <Image
                        source={{ uri: listing.heroImageUrl }}
                        style={{ height: 176, width: '100%', borderRadius: radius.lg }}
                        resizeMode="cover"
                      />
                      <View
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          borderRadius: 999,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          backgroundColor: 'rgba(15,23,42,0.65)',
                        }}
                      >
                        <Text className="text-[10px] font-bold" style={{ color: '#ffffff' }}>
                          {t(`realEstate.listingType.${listing.listingType}`)}
                        </Text>
                      </View>
                      {boosted ? (
                        <View
                          style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            borderRadius: 999,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            backgroundColor: siam.yellow.DEFAULT,
                          }}
                        >
                          <Text className="text-[10px] font-bold" style={{ color: '#1f2937' }}>
                            {t('realEstate.featuredBadge')}
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            borderRadius: 999,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            backgroundColor: badge.bg,
                          }}
                        >
                          <Text className="text-[11px] font-bold" style={{ color: badge.fg }}>
                            {t(`realEstate.status.${listing.status === 'pending_boost' ? 'available' : listing.status}`)}
                          </Text>
                        </View>
                      )}
                      {listing.sellerKind === 'dealer' ? (
                        <View
                          style={{
                            position: 'absolute',
                            bottom: 10,
                            left: 10,
                            borderRadius: 999,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            backgroundColor: colors.primary,
                          }}
                        >
                          <Text className="text-[10px] font-semibold" style={{ color: '#ffffff' }}>
                            {t('realEstate.sellerKind.dealerChip')}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <View className="mt-3 flex-row items-end justify-between gap-3">
                      <View className="min-w-0 flex-1">
                        <Text className="text-base font-bold" numberOfLines={2} style={{ color: colors.foreground }}>
                          {listing.title}
                        </Text>
                        <Text className="mt-0.5 text-xs" style={{ color: colors.muted }}>
                          {t(`realEstate.propertyType.${listing.propertyType}`)} · {bedsLabel(listing.bedrooms)} ·{' '}
                          {bathsLabel(listing.bathrooms)} · {listing.areaSqm} m²
                        </Text>
                        {location ? (
                          <Text className="mt-0.5 text-xs" style={{ color: colors.muted }}>
                            {location}
                          </Text>
                        ) : null}
                      </View>
                      <View className="items-end">
                        <Text className="text-lg font-extrabold" style={{ color: colors.primary }}>
                          {listing.priceAmount <= 0
                            ? t('realEstate.priceContactSeller')
                            : formatMoney(listing.priceAmount, listing.priceCurrency)}
                        </Text>
                        {listing.listingType === 'rent' && listing.priceAmount > 0 ? (
                          <Text className="text-[10px]" style={{ color: colors.muted }}>
                            {t('realEstate.perMonth')}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <ListingBadges
                      createdAt={listing.createdAt}
                      priceAmount={listing.priceAmount}
                      previousPriceAmount={listing.previousPriceAmount}
                      isBoosted={listing.isBoosted}
                      boostExpiresAt={listing.boostExpiresAt}
                      isVerified={listing.isVerified}
                    />
                  </Card>
                </Pressable>
              </FadeInView>
            );
          })}
          {filteredListings.length === 0 ? (
            <Card>
              <Text className="text-center text-sm" style={{ color: colors.muted }}>
                {t('realEstate.empty')}
              </Text>
            </Card>
          ) : null}
        </View>

        <Card>
          <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
            {t('realEstate.manageTitle')}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: colors.muted }}>
            {isAuthenticated ? t('realEstate.manageSubtitle') : t('realEstate.loginRequired')}
          </Text>

          {isAuthenticated ? (
            <View className="mt-4 gap-2">
              <Input
                label={t('realEstate.form.title')}
                value={formState.title}
                onChangeText={(value) => setFormState((prev) => ({ ...prev, title: value }))}
              />
              <View className="flex-row gap-2">
                <Input
                  className="flex-1"
                  label={t('realEstate.form.province')}
                  value={formState.province}
                  onChangeText={(value) => setFormState((prev) => ({ ...prev, province: value }))}
                />
                <Input
                  className="flex-1"
                  label={t('realEstate.form.district')}
                  value={formState.district}
                  onChangeText={(value) => setFormState((prev) => ({ ...prev, district: value }))}
                />
              </View>
              <View className="flex-row gap-2">
                <Input
                  className="flex-1"
                  label={t('realEstate.form.bedrooms')}
                  value={formState.bedrooms}
                  onChangeText={(value) => setFormState((prev) => ({ ...prev, bedrooms: value }))}
                  keyboardType="numeric"
                />
                <Input
                  className="flex-1"
                  label={t('realEstate.form.bathrooms')}
                  value={formState.bathrooms}
                  onChangeText={(value) => setFormState((prev) => ({ ...prev, bathrooms: value }))}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-row gap-2">
                <Input
                  className="flex-1"
                  label={t('realEstate.form.areaSqm')}
                  value={formState.areaSqm}
                  onChangeText={(value) => setFormState((prev) => ({ ...prev, areaSqm: value }))}
                  keyboardType="numeric"
                />
                <Input
                  className="flex-1"
                  label={t('realEstate.form.priceAmount')}
                  value={formState.priceAmount}
                  onChangeText={(value) => setFormState((prev) => ({ ...prev, priceAmount: value }))}
                  keyboardType="numeric"
                />
              </View>
              <Input
                label={t('realEstate.form.heroImageUrl')}
                value={formState.heroImageUrl}
                onChangeText={(value) => setFormState((prev) => ({ ...prev, heroImageUrl: value }))}
              />
              <Input
                label={t('realEstate.form.description')}
                value={formState.description}
                onChangeText={(value) => setFormState((prev) => ({ ...prev, description: value }))}
                multiline
                numberOfLines={3}
              />
              <View className="flex-row flex-wrap gap-2">
                {PROPERTY_TYPES.map((type) => (
                  <Button
                    key={type}
                    label={t(`realEstate.propertyType.${type}`)}
                    size="md"
                    variant={formState.propertyType === type ? 'primary' : 'secondary'}
                    onPress={() => setFormState((prev) => ({ ...prev, propertyType: type }))}
                  />
                ))}
              </View>
              <View className="flex-row gap-2">
                <Button
                  label={t('realEstate.listingType.sale')}
                  size="md"
                  variant={formState.listingType === 'sale' ? 'primary' : 'secondary'}
                  onPress={() => setFormState((prev) => ({ ...prev, listingType: 'sale' }))}
                />
                <Button
                  label={t('realEstate.listingType.rent')}
                  size="md"
                  variant={formState.listingType === 'rent' ? 'primary' : 'secondary'}
                  onPress={() => setFormState((prev) => ({ ...prev, listingType: 'rent' }))}
                />
              </View>
              <View className="flex-row gap-2">
                <Button
                  label={t('realEstate.status.available')}
                  size="md"
                  variant={formState.status === 'available' ? 'primary' : 'secondary'}
                  onPress={() => setFormState((prev) => ({ ...prev, status: 'available' }))}
                />
                <Button
                  label={t('realEstate.status.reserved')}
                  size="md"
                  variant={formState.status === 'reserved' ? 'primary' : 'secondary'}
                  onPress={() => setFormState((prev) => ({ ...prev, status: 'reserved' }))}
                />
                <Button
                  label={t('realEstate.status.sold')}
                  size="md"
                  variant={formState.status === 'sold' ? 'primary' : 'secondary'}
                  onPress={() => setFormState((prev) => ({ ...prev, status: 'sold' }))}
                />
              </View>
              <View className="mt-2 flex-row gap-2">
                <Button
                  label={
                    createListing.isPending || updateListing.isPending
                      ? 'Saving…'
                      : isEditing
                        ? t('realEstate.form.saveChanges')
                        : t('realEstate.form.addListing')
                  }
                  gradient
                  onPress={submitForm}
                />
                {isEditing ? (
                  <Button label={t('realEstate.form.cancelEdit')} variant="secondary" onPress={resetForm} />
                ) : null}
              </View>
            </View>
          ) : null}
        </Card>

        {isAuthenticated ? (
          <View className="gap-2">
            <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
              {t('realEstate.myListings')}
            </Text>
            {myListings.map((listing) => (
              <Card key={`my-${listing.id}`} compact>
                <View className="flex-row items-center justify-between">
                  <View className="min-w-0 flex-1 pr-3">
                    <Text className="text-base font-semibold" numberOfLines={1} style={{ color: colors.foreground }}>
                      {listing.title}
                    </Text>
                    <Text className="text-xs" style={{ color: colors.muted }}>
                      {formatMoney(listing.priceAmount, listing.priceCurrency)}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <Button
                      size="md"
                      label={t('realEstate.edit')}
                      variant="secondary"
                      onPress={() => {
                        setEditingId(listing.id);
                        setFormState(listingToForm(listing));
                      }}
                    />
                    <Button
                      size="md"
                      label={t('realEstate.delete')}
                      variant="secondary"
                      onPress={() =>
                        deleteListingMut.mutate(listing.id, {
                          onError: (e) =>
                            Alert.alert(
                              'Could not delete',
                              e instanceof Error ? e.message : 'Try again'
                            ),
                        })
                      }
                    />
                  </View>
                </View>
              </Card>
            ))}
            {myListings.length === 0 ? (
              <Card compact>
                <Text className="text-sm" style={{ color: colors.muted }}>
                  {t('realEstate.noOwnedListings')}
                </Text>
              </Card>
            ) : null}
          </View>
        ) : null}

        <Card compact>
          <View className="flex-row items-center gap-2">
            <Ionicons name="home-outline" size={16} color={colors.primary} />
            <Text className="flex-1 text-sm" style={{ color: colors.muted }}>
              {t('realEstate.serviceTeaser')}
            </Text>
          </View>
          <View className="mt-3">
            <Button
              label={t('realEstate.bookService')}
              variant="secondary"
              size="md"
              onPress={() =>
                router.push({ pathname: '/(tabs)/book', params: { serviceSlug: 'real-estate-services' } })
              }
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

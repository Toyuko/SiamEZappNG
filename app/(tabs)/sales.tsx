import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
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
import type { ListingStatus, SalesListing, VehicleCategory } from '../../features/sales/sales.types';
import {
  useCreateVehicleListing,
  useDeleteVehicleListing,
  useMyVehicleListings,
  useSalesListings,
  useUpdateVehicleListing,
} from '../../hooks/use-sales-listings';
import { t } from '../../lib/i18n/i18n';
import { radius, siam, spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';

type FormState = {
  title: string;
  make: string;
  model: string;
  year: string;
  mileageKm: string;
  priceAmount: string;
  heroImageUrl: string;
  description: string;
  category: VehicleCategory;
  status: ListingStatus;
};

const defaultForm: FormState = {
  title: '',
  make: '',
  model: '',
  year: '',
  mileageKm: '',
  priceAmount: '',
  heroImageUrl: '',
  description: '',
  category: 'car',
  status: 'available',
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(amount);
}

function parseInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function listingToForm(listing: SalesListing): FormState {
  return {
    title: listing.title,
    make: listing.make,
    model: listing.model,
    year: String(listing.year),
    mileageKm: String(listing.mileageKm),
    priceAmount: String(listing.priceAmount),
    heroImageUrl: listing.heroImageUrl,
    description: listing.description,
    category: listing.category,
    status: listing.status,
  };
}

export default function SalesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isGuest = useAuthStore((state) => state.isGuest);
  const isAuthenticated = Boolean(accessToken) && !isGuest;
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | VehicleCategory>('all');
  const [sort, setSort] = useState<'latest' | 'priceAsc' | 'priceDesc' | 'yearDesc' | 'yearAsc'>('latest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');

  const [formState, setFormState] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      search,
      category,
      sort,
      minPrice: parseInteger(minPrice) || undefined,
      maxPrice: parseInteger(maxPrice) || undefined,
      minYear: parseInteger(minYear) || undefined,
      maxYear: parseInteger(maxYear) || undefined,
      pageSize: 48,
    }),
    [category, maxPrice, maxYear, minPrice, minYear, search, sort]
  );

  const listingsQuery = useSalesListings(filters);
  const myListingsQuery = useMyVehicleListings(isAuthenticated);
  const createListing = useCreateVehicleListing();
  const updateListing = useUpdateVehicleListing();
  const deleteListing = useDeleteVehicleListing();
  const saveSearch = useMutation({
    mutationFn: createSavedSearch,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['saved-searches'] });
      Alert.alert('Saved', 'Search saved to your Saved hub.');
    },
    onError: (e) =>
      Alert.alert('Could not save search', e instanceof Error ? e.message : 'Try again'),
  });

  const listings = listingsQuery.data?.items ?? [];
  const myListings = myListingsQuery.data ?? [];
  const isEditing = editingId !== null;
  const loadingRemote = listingsQuery.isLoading;
  const loadError = listingsQuery.isError
    ? listingsQuery.error instanceof Error
      ? listingsQuery.error.message
      : 'Unable to sync website inventory.'
    : null;

  const statusBadge = (status: ListingStatus) => {
    if (status === 'available') return { bg: colors.success, fg: '#ffffff' };
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
      make: formState.make.trim(),
      model: formState.model.trim(),
      year: parseInteger(formState.year),
      mileageKm: parseInteger(formState.mileageKm),
      priceAmount: parseInteger(formState.priceAmount),
      category: formState.category,
      status: formState.status,
      heroImageUrl: formState.heroImageUrl.trim(),
      description: formState.description.trim(),
    };

    if (!payload.title || !payload.make || !payload.model || payload.priceAmount <= 0 || payload.year <= 0 || !payload.heroImageUrl) {
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
    if (category !== 'all') query.category = category;
    if (minPrice.trim()) query.minPrice = minPrice.trim();
    if (maxPrice.trim()) query.maxPrice = maxPrice.trim();
    if (minYear.trim()) query.minYear = minYear.trim();
    if (maxYear.trim()) query.maxYear = maxYear.trim();
    const nameParts = [
      category === 'all' ? 'Vehicles' : category === 'car' ? 'Cars' : 'Motorcycles',
      search.trim() || null,
    ].filter(Boolean);
    saveSearch.mutate({
      name: nameParts.join(' · ').slice(0, 80) || 'Vehicle search',
      listingType: 'vehicle',
      query,
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.screenPaddingX, paddingTop: spacing.stackMd, paddingBottom: 40 + VOICE_FAB_SCROLL_EXTRA, gap: spacing.sectionGap }}>
        <FadeInView delay={0} distance={22}>
          <PageHeader title={t('sales.title')} subtitle={t('sales.subtitle')} />
        </FadeInView>
        {loadingRemote ? (
          <Card compact>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {t('sales.syncing')}
            </Text>
          </Card>
        ) : null}
        {loadError ? (
          <Card compact>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {t('sales.syncFailed')}
            </Text>
          </Card>
        ) : null}

        <FadeInView delay={80}>
        <Card>
          <View className="gap-3">
            <Input placeholder={t('sales.searchPlaceholder')} value={search} onChangeText={setSearch} />
            <View className="flex-row gap-2">
              <Button label={t('sales.categoryAll')} size="md" variant={category === 'all' ? 'primary' : 'secondary'} onPress={() => setCategory('all')} />
              <Button label={t('sales.categoryCars')} size="md" variant={category === 'car' ? 'primary' : 'secondary'} onPress={() => setCategory('car')} />
              <Button label={t('sales.categoryMotorcycles')} size="md" variant={category === 'motorcycle' ? 'primary' : 'secondary'} onPress={() => setCategory('motorcycle')} />
            </View>
            <View className="flex-row gap-2">
              <Input className="flex-1" placeholder={t('sales.minPrice')} value={minPrice} onChangeText={setMinPrice} keyboardType="numeric" />
              <Input className="flex-1" placeholder={t('sales.maxPrice')} value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" />
            </View>
            <View className="flex-row gap-2">
              <Input className="flex-1" placeholder={t('sales.minYear')} value={minYear} onChangeText={setMinYear} keyboardType="numeric" />
              <Input className="flex-1" placeholder={t('sales.maxYear')} value={maxYear} onChangeText={setMaxYear} keyboardType="numeric" />
            </View>
            <View className="flex-row flex-wrap gap-2">
              {(['latest', 'priceAsc', 'priceDesc', 'yearDesc', 'yearAsc'] as const).map((option) => (
                <Button
                  key={option}
                  label={t(`sales.sort.${option}`)}
                  size="md"
                  variant={sort === option ? 'primary' : 'secondary'}
                  onPress={() => setSort(option)}
                />
              ))}
            </View>
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
          {listings.map((listing, index) => {
            const badge = statusBadge(listing.status);
            return (
              <FadeInView key={listing.id} delay={Math.min(index * 60, 320)} distance={18} scaleFrom={0.98}>
                <Pressable
                  onPress={() => router.push(`/sales/${listing.id}`)}
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
                          right: 10,
                          borderRadius: 999,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          backgroundColor: badge.bg,
                        }}
                      >
                        <Text className="text-[11px] font-bold" style={{ color: badge.fg }}>
                          {t(`sales.status.${listing.status}`)}
                        </Text>
                      </View>
                      <View
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          borderRadius: 999,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          backgroundColor: 'rgba(15,23,42,0.55)',
                        }}
                      >
                        <Ionicons name={listing.category === 'motorcycle' ? 'bicycle' : 'car-sport'} size={13} color="#ffffff" />
                        <Text className="text-[10px] font-semibold" style={{ color: '#ffffff' }}>
                          {t(listing.category === 'motorcycle' ? 'sales.categoryMotorcycles' : 'sales.categoryCars')}
                        </Text>
                      </View>
                    </View>
                    <View className="mt-3 flex-row items-end justify-between gap-3">
                      <View className="min-w-0 flex-1">
                        <Text className="text-base font-bold" numberOfLines={1} style={{ color: colors.foreground }}>
                          {listing.make} {listing.model}
                        </Text>
                        <Text className="mt-0.5 text-xs" style={{ color: colors.muted }}>
                          {listing.year} · {listing.mileageKm.toLocaleString()} km
                        </Text>
                      </View>
                      <Text className="text-lg font-extrabold" style={{ color: colors.primary }}>
                        {formatMoney(listing.priceAmount)}
                      </Text>
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
          {listings.length === 0 && !loadingRemote ? (
            <Card>
              <Text className="text-center text-sm" style={{ color: colors.muted }}>
                {t('sales.empty')}
              </Text>
            </Card>
          ) : null}
        </View>

        <Card>
          <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
            {t('sales.manageTitle')}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: colors.muted }}>
            {isAuthenticated ? t('sales.manageSubtitle') : t('sales.loginRequired')}
          </Text>

          {isAuthenticated ? (
            <View className="mt-4 gap-2">
              <Input label={t('sales.form.title')} value={formState.title} onChangeText={(value) => setFormState((prev) => ({ ...prev, title: value }))} />
              <View className="flex-row gap-2">
                <Input className="flex-1" label={t('sales.form.make')} value={formState.make} onChangeText={(value) => setFormState((prev) => ({ ...prev, make: value }))} />
                <Input className="flex-1" label={t('sales.form.model')} value={formState.model} onChangeText={(value) => setFormState((prev) => ({ ...prev, model: value }))} />
              </View>
              <View className="flex-row gap-2">
                <Input className="flex-1" label={t('sales.form.year')} value={formState.year} onChangeText={(value) => setFormState((prev) => ({ ...prev, year: value }))} keyboardType="numeric" />
                <Input className="flex-1" label={t('sales.form.mileageKm')} value={formState.mileageKm} onChangeText={(value) => setFormState((prev) => ({ ...prev, mileageKm: value }))} keyboardType="numeric" />
              </View>
              <Input label={t('sales.form.priceAmount')} value={formState.priceAmount} onChangeText={(value) => setFormState((prev) => ({ ...prev, priceAmount: value }))} keyboardType="numeric" />
              <Input label={t('sales.form.heroImageUrl')} value={formState.heroImageUrl} onChangeText={(value) => setFormState((prev) => ({ ...prev, heroImageUrl: value }))} />
              <Input label={t('sales.form.description')} value={formState.description} onChangeText={(value) => setFormState((prev) => ({ ...prev, description: value }))} multiline numberOfLines={3} />
              <View className="flex-row gap-2">
                <Button label={t('sales.form.categoryCar')} size="md" variant={formState.category === 'car' ? 'primary' : 'secondary'} onPress={() => setFormState((prev) => ({ ...prev, category: 'car' }))} />
                <Button label={t('sales.form.categoryMotorcycle')} size="md" variant={formState.category === 'motorcycle' ? 'primary' : 'secondary'} onPress={() => setFormState((prev) => ({ ...prev, category: 'motorcycle' }))} />
              </View>
              <View className="flex-row gap-2">
                <Button label={t('sales.status.available')} size="md" variant={formState.status === 'available' ? 'primary' : 'secondary'} onPress={() => setFormState((prev) => ({ ...prev, status: 'available' }))} />
                <Button label={t('sales.status.reserved')} size="md" variant={formState.status === 'reserved' ? 'primary' : 'secondary'} onPress={() => setFormState((prev) => ({ ...prev, status: 'reserved' }))} />
                <Button label={t('sales.status.sold')} size="md" variant={formState.status === 'sold' ? 'primary' : 'secondary'} onPress={() => setFormState((prev) => ({ ...prev, status: 'sold' }))} />
              </View>
              <View className="mt-2 flex-row gap-2">
                <Button
                  label={
                    createListing.isPending || updateListing.isPending
                      ? 'Saving…'
                      : isEditing
                        ? t('sales.form.saveChanges')
                        : t('sales.form.addListing')
                  }
                  gradient
                  onPress={submitForm}
                />
                {isEditing ? <Button label={t('sales.form.cancelEdit')} variant="secondary" onPress={resetForm} /> : null}
              </View>
            </View>
          ) : null}
        </Card>

        {isAuthenticated ? (
          <View className="gap-2">
            <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
              {t('sales.myListings')}
            </Text>
            {myListings.map((listing) => (
              <Card key={`my-${listing.id}`} compact>
                <View className="flex-row items-center justify-between">
                  <View className="min-w-0 flex-1 pr-3">
                    <Text className="text-base font-semibold" numberOfLines={1} style={{ color: colors.foreground }}>
                      {listing.make} {listing.model}
                    </Text>
                    <Text className="text-xs" style={{ color: colors.muted }}>
                      {formatMoney(listing.priceAmount)}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <Button
                      size="md"
                      label={t('sales.edit')}
                      variant="secondary"
                      onPress={() => {
                        setEditingId(listing.id);
                        setFormState(listingToForm(listing));
                      }}
                    />
                    <Button
                      size="md"
                      label={t('sales.delete')}
                      variant="secondary"
                      onPress={() =>
                        deleteListing.mutate(listing.id, {
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
                  {t('sales.noOwnedListings')}
                </Text>
              </Card>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

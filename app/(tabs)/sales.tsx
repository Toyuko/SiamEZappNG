import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { t } from '../../lib/i18n/i18n';
import { spacing } from '../../lib/theme/tokens';
import { useTheme } from '../../lib/theme/theme';
import { useAuthStore } from '../../store/auth-store';
import { useSalesStore } from '../../store/sales-store';
import type { ListingStatus, SalesListing, VehicleCategory } from '../../features/sales/sales.types';
import { fetchWebsiteSalesListings } from '../../features/sales/sales.api';

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
  const { colors, isDark } = useTheme();
  const user = useAuthStore((state) => state.user);
  const listings = useSalesStore((state) => state.listings);
  const hydrateListings = useSalesStore((state) => state.hydrateListings);
  const createListing = useSalesStore((state) => state.createListing);
  const updateListing = useSalesStore((state) => state.updateListing);
  const deleteListing = useSalesStore((state) => state.deleteListing);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | VehicleCategory>('all');
  const [sort, setSort] = useState<'latest' | 'priceAsc' | 'priceDesc' | 'yearDesc' | 'yearAsc'>('latest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');

  const [formState, setFormState] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingRemote, setLoadingRemote] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isEditing = editingId !== null;
  const currentUserId = user?.id ?? 'guest';

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingRemote(true);
      setLoadError(null);
      try {
        const remoteListings = await fetchWebsiteSalesListings();
        if (!active) return;
        if (remoteListings.length > 0) {
          hydrateListings(remoteListings);
        }
      } catch (error) {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : 'Unable to sync website inventory.');
      } finally {
        if (active) {
          setLoadingRemote(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [hydrateListings]);

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();
    const minPriceValue = parseInteger(minPrice);
    const maxPriceValue = parseInteger(maxPrice);
    const minYearValue = parseInteger(minYear);
    const maxYearValue = parseInteger(maxYear);

    const filtered = listings.filter((listing) => {
      const matchesSearch =
        query.length === 0 ||
        `${listing.make} ${listing.model} ${listing.title}`.toLowerCase().includes(query);
      const matchesCategory = category === 'all' || listing.category === category;
      const matchesPriceMin = minPriceValue <= 0 || listing.priceAmount >= minPriceValue;
      const matchesPriceMax = maxPriceValue <= 0 || listing.priceAmount <= maxPriceValue;
      const matchesYearMin = minYearValue <= 0 || listing.year >= minYearValue;
      const matchesYearMax = maxYearValue <= 0 || listing.year <= maxYearValue;

      return matchesSearch && matchesCategory && matchesPriceMin && matchesPriceMax && matchesYearMin && matchesYearMax;
    });

    return filtered.sort((a, b) => {
      if (sort === 'priceAsc') return a.priceAmount - b.priceAmount;
      if (sort === 'priceDesc') return b.priceAmount - a.priceAmount;
      if (sort === 'yearAsc') return a.year - b.year;
      if (sort === 'yearDesc') return b.year - a.year;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [category, listings, maxPrice, maxYear, minPrice, minYear, search, sort]);

  const myListings = useMemo(() => listings.filter((listing) => listing.ownerId === currentUserId), [currentUserId, listings]);

  const resetForm = () => {
    setFormState(defaultForm);
    setEditingId(null);
  };

  const submitForm = () => {
    if (!user) {
      return;
    }
    const payload = {
      ownerId: currentUserId,
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

    if (editingId) {
      updateListing(editingId, payload);
    } else {
      createListing(payload);
    }
    resetForm();
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.screenPaddingX, paddingTop: spacing.stackMd, paddingBottom: 40, gap: spacing.sectionGap }}>
        <PageHeader title={t('sales.title')} subtitle={t('sales.subtitle')} />
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
          </View>
        </Card>

        <View className="gap-3">
          {filteredListings.map((listing) => (
            <Pressable key={listing.id} onPress={() => router.push(`/sales/${listing.id}`)} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
              <Card shadow="medium">
                <View className="gap-3">
                  <Image source={{ uri: listing.heroImageUrl }} className="h-44 w-full rounded-xl" resizeMode="cover" />
                  <Text className="text-xl font-bold" style={{ color: colors.primary }}>
                    {formatMoney(listing.priceAmount)}
                  </Text>
                  <View>
                    <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
                      {listing.make} {listing.model}
                    </Text>
                    <Text className="text-sm" style={{ color: colors.muted }}>
                      {listing.year} - {listing.mileageKm.toLocaleString()} km
                    </Text>
                  </View>
                  <View className="self-start rounded-full px-3 py-1" style={{ backgroundColor: isDark ? 'rgba(91, 118, 224, 0.22)' : 'rgba(44, 84, 198, 0.12)' }}>
                    <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                      {t(`sales.status.${listing.status}`)}
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
          {filteredListings.length === 0 ? (
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
            {user ? t('sales.manageSubtitle') : t('sales.loginRequired')}
          </Text>

          {user ? (
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
                <Button label={isEditing ? t('sales.form.saveChanges') : t('sales.form.addListing')} onPress={submitForm} />
                {isEditing ? <Button label={t('sales.form.cancelEdit')} variant="secondary" onPress={resetForm} /> : null}
              </View>
            </View>
          ) : null}
        </Card>

        {user ? (
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
                    <Button size="md" label={t('sales.delete')} variant="secondary" onPress={() => deleteListing(listing.id)} />
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

import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';
import type { ListingStatus, SalesListing, VehicleCategory } from './sales.types';

type PlatformVehicle = {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  mileageKm: number;
  priceAmount: number;
  previousPriceAmount?: number | null;
  category: VehicleCategory;
  status: string;
  heroImageUrl: string;
  description: string | null;
  createdById?: string | null;
  createdAt?: string;
  isBoosted?: boolean;
  boostExpiresAt?: string | null;
  isVerified?: boolean;
  sellerKind?: 'dealer' | 'private';
  imageUrls?: string[];
  videoUrls?: string[];
  heroMediaType?: 'image' | 'video';
  heroVideoUrl?: string | null;
  published?: boolean;
  priceCurrency?: string;
};

export type VehiclesPage = {
  items: PlatformVehicle[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  bounds?: {
    minPrice: number;
    maxPrice: number;
    minYear: number;
    maxYear: number;
  };
};

export type SalesListFilters = {
  search?: string;
  category?: 'all' | VehicleCategory;
  sort?: 'latest' | 'priceAsc' | 'priceDesc' | 'yearDesc' | 'yearAsc';
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  page?: number;
  pageSize?: number;
};

export type VehicleListingWriteInput = {
  title: string;
  make: string;
  model: string;
  year: number;
  mileageKm: number;
  priceAmount: number;
  category: VehicleCategory;
  status: ListingStatus;
  heroImageUrl: string;
  description: string;
};

const SORT_MAP: Record<NonNullable<SalesListFilters['sort']>, string> = {
  latest: 'latest',
  priceAsc: 'price_asc',
  priceDesc: 'price_desc',
  yearDesc: 'year_desc',
  yearAsc: 'year_asc',
};

function mapStatus(status: string): ListingStatus {
  if (status === 'reserved') return 'reserved';
  if (status === 'sold') return 'sold';
  return 'available';
}

export function mapVehicle(vehicle: PlatformVehicle): SalesListing {
  return {
    id: vehicle.id,
    ownerId: vehicle.createdById ?? 'platform',
    title: vehicle.title,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    mileageKm: vehicle.mileageKm,
    priceAmount: vehicle.priceAmount,
    previousPriceAmount: vehicle.previousPriceAmount ?? null,
    category: vehicle.category,
    status: mapStatus(vehicle.status),
    heroImageUrl: vehicle.heroImageUrl,
    description: vehicle.description ?? '',
    createdAt: vehicle.createdAt ?? new Date().toISOString(),
    isBoosted: vehicle.isBoosted,
    boostExpiresAt: vehicle.boostExpiresAt ?? null,
    isVerified: vehicle.isVerified,
  };
}

function buildQuery(filters: SalesListFilters = {}) {
  const params = new URLSearchParams();
  params.set('page', String(filters.page ?? 1));
  params.set('pageSize', String(filters.pageSize ?? 24));
  params.set('sort', SORT_MAP[filters.sort ?? 'latest']);
  if (filters.category && filters.category !== 'all') {
    params.set('category', filters.category);
  }
  if (filters.search?.trim()) params.set('search', filters.search.trim());
  if (filters.minPrice && filters.minPrice > 0) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice && filters.maxPrice > 0) params.set('maxPrice', String(filters.maxPrice));
  if (filters.minYear && filters.minYear > 0) params.set('minYear', String(filters.minYear));
  if (filters.maxYear && filters.maxYear > 0) params.set('maxYear', String(filters.maxYear));
  return params.toString();
}

function toPlatformWriteBody(input: VehicleListingWriteInput) {
  const description =
    input.description.trim().length >= 20
      ? input.description.trim()
      : `${input.description.trim()} — Listed on SiamEZ.`.padEnd(20, '.');
  return {
    title: input.title.trim(),
    make: input.make.trim(),
    model: input.model.trim(),
    year: input.year,
    mileageKm: input.mileageKm,
    priceAmount: input.priceAmount,
    priceCurrency: 'THB',
    category: input.category,
    sellerKind: 'private' as const,
    status: input.status,
    heroMediaType: 'image' as const,
    heroImageUrl: input.heroImageUrl.trim(),
    heroVideoUrl: null,
    imageUrls: [input.heroImageUrl.trim()],
    videoUrls: [] as string[],
    description,
    published: true,
  };
}

/** Fetch published vehicle inventory from Platform JSON API. */
export async function fetchWebsiteSalesListings(
  filters: SalesListFilters = {}
): Promise<SalesListing[]> {
  const page = await fetchVehiclesPage(filters);
  return page.items;
}

export async function fetchVehiclesPage(
  filters: SalesListFilters = {}
): Promise<{ items: SalesListing[]; page: VehiclesPage }> {
  const response = await api.get<VehiclesPage | ApiEnvelope<VehiclesPage>>(
    `/api/v1/marketplace/vehicles?${buildQuery(filters)}`
  );
  const page = unwrapApiData(response);
  return {
    items: (page.items ?? []).map(mapVehicle),
    page,
  };
}

export async function fetchVehicleListingById(id: string): Promise<SalesListing | null> {
  try {
    const response = await api.get<PlatformVehicle | ApiEnvelope<PlatformVehicle>>(
      `/api/v1/marketplace/vehicles/${id}`
    );
    return mapVehicle(unwrapApiData(response));
  } catch {
    return null;
  }
}

export async function fetchMyVehicleListings(): Promise<SalesListing[]> {
  const response = await api.get<PlatformVehicle[] | ApiEnvelope<PlatformVehicle[]>>(
    '/api/v1/seller/listings/vehicles'
  );
  return unwrapApiData(response).map(mapVehicle);
}

export async function createVehicleListing(input: VehicleListingWriteInput): Promise<SalesListing> {
  const response = await api.post<PlatformVehicle | ApiEnvelope<PlatformVehicle>>(
    '/api/v1/seller/listings/vehicles',
    toPlatformWriteBody(input)
  );
  return mapVehicle(unwrapApiData(response));
}

export async function updateVehicleListing(
  id: string,
  input: VehicleListingWriteInput
): Promise<SalesListing> {
  const response = await api.patch<PlatformVehicle | ApiEnvelope<PlatformVehicle>>(
    `/api/v1/seller/listings/vehicles/${id}`,
    toPlatformWriteBody(input)
  );
  return mapVehicle(unwrapApiData(response));
}

export async function deleteVehicleListing(id: string): Promise<{ deleted: true; id: string }> {
  const response = await api.delete<{ deleted: true; id: string } | ApiEnvelope<{ deleted: true; id: string }>>(
    `/api/v1/seller/listings/vehicles/${id}`
  );
  return unwrapApiData(response);
}

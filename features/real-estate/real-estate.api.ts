import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';
import type {
  PropertyFurnished,
  PropertyListingStatus,
  PropertyListingType,
  PropertySellerKind,
  PropertyType,
  RealEstateListing,
} from './real-estate.types';

type PlatformProperty = {
  id: string;
  title: string;
  propertyType: PropertyType;
  listingType: PropertyListingType;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number;
  landAreaSqm?: number | null;
  floor?: number | null;
  yearBuilt?: number | null;
  province: string;
  district: string | null;
  neighborhood?: string | null;
  priceAmount: number;
  previousPriceAmount?: number | null;
  priceCurrency?: string;
  sellerKind: PropertySellerKind;
  furnished?: PropertyFurnished;
  status: PropertyListingStatus;
  heroImageUrl: string;
  description?: string | null;
  isBoosted?: boolean;
  boostExpiresAt?: string | null;
  isVerified?: boolean;
  createdById?: string | null;
  createdAt?: string;
};

export type PropertiesPage = {
  items: PlatformProperty[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  bounds?: {
    minPrice: number;
    maxPrice: number;
  };
};

export type RealEstateListFilters = {
  search?: string;
  propertyType?: 'all' | PropertyType;
  listingType?: 'all' | PropertyListingType;
  sellerKind?: 'all' | PropertySellerKind;
  sort?: 'latest' | 'priceAsc' | 'priceDesc' | 'areaDesc' | 'areaAsc';
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  province?: string;
  page?: number;
  pageSize?: number;
};

export type PropertyListingWriteInput = {
  title: string;
  propertyType: PropertyType;
  listingType: PropertyListingType;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number;
  province: string;
  district: string | null;
  priceAmount: number;
  sellerKind: PropertySellerKind;
  status: Exclude<PropertyListingStatus, 'pending_boost'>;
  heroImageUrl: string;
  description: string;
};

const SORT_MAP: Record<NonNullable<RealEstateListFilters['sort']>, string> = {
  latest: 'latest',
  priceAsc: 'price_asc',
  priceDesc: 'price_desc',
  areaDesc: 'area_desc',
  areaAsc: 'area_asc',
};

export function mapProperty(property: PlatformProperty): RealEstateListing {
  return {
    id: property.id,
    ownerId: property.createdById ?? 'platform',
    title: property.title,
    propertyType: property.propertyType,
    listingType: property.listingType,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaSqm: property.areaSqm,
    landAreaSqm: property.landAreaSqm ?? null,
    floor: property.floor ?? null,
    yearBuilt: property.yearBuilt ?? null,
    province: property.province,
    district: property.district,
    neighborhood: property.neighborhood ?? null,
    priceAmount: property.priceAmount,
    previousPriceAmount: property.previousPriceAmount ?? null,
    priceCurrency: property.priceCurrency ?? 'THB',
    sellerKind: property.sellerKind,
    furnished: property.furnished ?? 'not_applicable',
    status: property.status,
    heroImageUrl: property.heroImageUrl,
    description: property.description ?? '',
    isBoosted: property.isBoosted,
    boostActive: property.isBoosted,
    boostExpiresAt: property.boostExpiresAt ?? null,
    isVerified: property.isVerified,
    createdAt: property.createdAt ?? new Date().toISOString(),
  };
}

function buildQuery(filters: RealEstateListFilters = {}) {
  const params = new URLSearchParams();
  params.set('page', String(filters.page ?? 1));
  params.set('pageSize', String(filters.pageSize ?? 24));
  params.set('sort', SORT_MAP[filters.sort ?? 'latest']);
  if (filters.propertyType && filters.propertyType !== 'all') {
    params.set('propertyType', filters.propertyType);
  }
  if (filters.listingType && filters.listingType !== 'all') {
    params.set('listingType', filters.listingType);
  }
  if (filters.sellerKind && filters.sellerKind !== 'all') {
    params.set('sellerKind', filters.sellerKind);
  }
  if (filters.search?.trim()) params.set('search', filters.search.trim());
  if (filters.province?.trim()) params.set('province', filters.province.trim());
  if (filters.minPrice && filters.minPrice > 0) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice && filters.maxPrice > 0) params.set('maxPrice', String(filters.maxPrice));
  if (filters.minBedrooms && filters.minBedrooms > 0) {
    params.set('minBedrooms', String(filters.minBedrooms));
  }
  return params.toString();
}

function toPlatformWriteBody(input: PropertyListingWriteInput) {
  const description =
    input.description.trim().length >= 20
      ? input.description.trim()
      : `${input.description.trim()} — Listed on SiamEZ.`.padEnd(20, '.');
  return {
    title: input.title.trim(),
    propertyType: input.propertyType,
    listingType: input.listingType,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    areaSqm: input.areaSqm,
    landAreaSqm: null,
    floor: null,
    yearBuilt: null,
    province: input.province.trim(),
    district: input.district,
    neighborhood: null,
    priceAmount: input.priceAmount,
    priceCurrency: 'THB',
    sellerKind: input.sellerKind,
    status: input.status,
    furnished: 'not_applicable' as const,
    heroMediaType: 'image' as const,
    heroImageUrl: input.heroImageUrl.trim(),
    heroVideoUrl: null,
    imageUrls: [input.heroImageUrl.trim()],
    videoUrls: [] as string[],
    description,
    published: true,
    isBoosted: false,
    boostExpiresAt: null,
  };
}

/** Fetch published property inventory from Platform JSON API. */
export async function fetchWebsiteRealEstateListings(
  filters: RealEstateListFilters = {}
): Promise<RealEstateListing[]> {
  const page = await fetchPropertiesPage(filters);
  return page.items;
}

export async function fetchPropertiesPage(
  filters: RealEstateListFilters = {}
): Promise<{ items: RealEstateListing[]; page: PropertiesPage }> {
  const response = await api.get<PropertiesPage | ApiEnvelope<PropertiesPage>>(
    `/api/v1/marketplace/properties?${buildQuery(filters)}`
  );
  const page = unwrapApiData(response);
  return {
    items: (page.items ?? []).map(mapProperty),
    page,
  };
}

export async function fetchPropertyListingById(id: string): Promise<RealEstateListing | null> {
  try {
    const response = await api.get<PlatformProperty | ApiEnvelope<PlatformProperty>>(
      `/api/v1/marketplace/properties/${id}`
    );
    return mapProperty(unwrapApiData(response));
  } catch {
    return null;
  }
}

export async function fetchMyPropertyListings(): Promise<RealEstateListing[]> {
  const response = await api.get<PlatformProperty[] | ApiEnvelope<PlatformProperty[]>>(
    '/api/v1/seller/listings/properties'
  );
  return unwrapApiData(response).map(mapProperty);
}

export async function createPropertyListing(
  input: PropertyListingWriteInput
): Promise<RealEstateListing> {
  const response = await api.post<PlatformProperty | ApiEnvelope<PlatformProperty>>(
    '/api/v1/seller/listings/properties',
    toPlatformWriteBody(input)
  );
  return mapProperty(unwrapApiData(response));
}

export async function updatePropertyListing(
  id: string,
  input: PropertyListingWriteInput
): Promise<RealEstateListing> {
  const response = await api.patch<PlatformProperty | ApiEnvelope<PlatformProperty>>(
    `/api/v1/seller/listings/properties/${id}`,
    toPlatformWriteBody(input)
  );
  return mapProperty(unwrapApiData(response));
}

export async function deletePropertyListing(id: string): Promise<{ deleted: true; id: string }> {
  const response = await api.delete<
    { deleted: true; id: string } | ApiEnvelope<{ deleted: true; id: string }>
  >(`/api/v1/seller/listings/properties/${id}`);
  return unwrapApiData(response);
}

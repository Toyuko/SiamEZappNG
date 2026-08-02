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

type PropertiesPage = {
  items: PlatformProperty[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function mapProperty(property: PlatformProperty): RealEstateListing {
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

/** Fetch published property inventory from Platform JSON API (replaces HTML scrape). */
export async function fetchWebsiteRealEstateListings(): Promise<RealEstateListing[]> {
  const response = await api.get<PropertiesPage | ApiEnvelope<PropertiesPage>>(
    '/api/v1/marketplace/properties?pageSize=100&sort=latest'
  );
  const page = unwrapApiData(response);
  return (page.items ?? []).map(mapProperty);
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

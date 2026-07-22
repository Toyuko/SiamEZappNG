import { appConfig } from '../../lib/config';
import type {
  PropertyListingStatus,
  PropertyListingType,
  PropertySellerKind,
  PropertyType,
  RealEstateListing,
} from './real-estate.types';

type ParsedPropertyCard = {
  id: string;
  title: string;
  heroImageUrl: string;
  priceAmount: number;
  priceCurrency?: string;
  propertyType: PropertyType;
  listingType: PropertyListingType;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number;
  province: string;
  district: string | null;
  status: PropertyListingStatus;
  sellerKind: PropertySellerKind;
  isBoosted?: boolean;
  boostActive?: boolean;
  createdById?: string | null;
  createdAt?: string;
  description?: string;
};

function extractByRegex(html: string, pattern: RegExp) {
  const match = html.match(pattern);
  if (!match?.[1]) return null;
  return match[1];
}

function parsePropertiesFromHtml(html: string): ParsedPropertyCard[] {
  const rawJsonArray = extractByRegex(html, /"properties":(\[[\s\S]*?\]),"bounds":/);
  if (rawJsonArray) {
    try {
      const parsed = JSON.parse(rawJsonArray.replace(/\$D/g, '')) as ParsedPropertyCard[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Fall through to escaped payload parsing.
    }
  }

  const escapedJsonArray = extractByRegex(html, /\\"properties\\":(\[[\s\S]*?\]),\\"bounds\\":/);
  if (!escapedJsonArray) return [];

  try {
    const unescaped = escapedJsonArray.replace(/\$D/g, '').replace(/\\"/g, '"');
    const parsed = JSON.parse(unescaped) as ParsedPropertyCard[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function fetchWebsiteRealEstateListings(): Promise<RealEstateListing[]> {
  const response = await fetch(`${appConfig.webBaseUrl}/en/real-estate`, {
    method: 'GET',
    headers: { Accept: 'text/html' },
  });
  if (!response.ok) {
    throw new Error(`Unable to load website real estate inventory (${response.status})`);
  }

  const html = await response.text();
  const properties = parsePropertiesFromHtml(html);

  return properties.map((property) => ({
    id: property.id,
    ownerId: property.createdById ?? 'seed-admin',
    title: property.title,
    propertyType: property.propertyType,
    listingType: property.listingType,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaSqm: property.areaSqm,
    landAreaSqm: null,
    floor: null,
    yearBuilt: null,
    province: property.province,
    district: property.district,
    neighborhood: null,
    priceAmount: property.priceAmount,
    priceCurrency: property.priceCurrency ?? 'THB',
    sellerKind: property.sellerKind,
    furnished: 'not_applicable',
    status: property.status === 'pending_boost' ? 'available' : property.status,
    heroImageUrl: property.heroImageUrl,
    description: property.description ?? '',
    isBoosted: property.isBoosted,
    boostActive: property.boostActive,
    createdAt: property.createdAt ?? new Date().toISOString(),
  }));
}

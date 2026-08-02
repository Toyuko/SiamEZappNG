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
};

type VehiclesPage = {
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

function mapStatus(status: string): ListingStatus {
  if (status === 'reserved') return 'reserved';
  if (status === 'sold') return 'sold';
  return 'available';
}

function mapVehicle(vehicle: PlatformVehicle): SalesListing {
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

/** Fetch published vehicle inventory from Platform JSON API. */
export async function fetchWebsiteSalesListings(): Promise<SalesListing[]> {
  const response = await api.get<VehiclesPage | ApiEnvelope<VehiclesPage>>(
    '/api/v1/marketplace/vehicles?pageSize=100&sort=latest'
  );
  const page = unwrapApiData(response);
  return (page.items ?? []).map(mapVehicle);
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

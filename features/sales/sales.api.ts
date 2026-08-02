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
  category: VehicleCategory;
  status: string;
  heroImageUrl: string;
  description: string | null;
  createdById?: string | null;
  createdAt?: string;
};

type VehiclesPage = {
  items: PlatformVehicle[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
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
    category: vehicle.category,
    status: mapStatus(vehicle.status),
    heroImageUrl: vehicle.heroImageUrl,
    description: vehicle.description ?? '',
    createdAt: vehicle.createdAt ?? new Date().toISOString(),
  };
}

/** Fetch published vehicle inventory from Platform JSON API (replaces HTML scrape). */
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

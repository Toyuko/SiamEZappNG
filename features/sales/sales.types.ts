export type VehicleCategory = 'car' | 'motorcycle';
export type ListingStatus = 'available' | 'reserved' | 'sold';

export type SalesListing = {
  id: string;
  ownerId: string;
  title: string;
  make: string;
  model: string;
  priceAmount: number;
  previousPriceAmount?: number | null;
  year: number;
  mileageKm: number;
  category: VehicleCategory;
  status: ListingStatus;
  heroImageUrl: string;
  description: string;
  createdAt: string;
  isBoosted?: boolean;
  boostExpiresAt?: string | null;
  isVerified?: boolean;
};

export type SalesFilters = {
  search: string;
  category: 'all' | VehicleCategory;
  sort: 'latest' | 'priceAsc' | 'priceDesc' | 'yearDesc' | 'yearAsc';
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
};

export type CreateSalesListingInput = Omit<SalesListing, 'id' | 'createdAt'>;
export type UpdateSalesListingInput = Partial<CreateSalesListingInput>;

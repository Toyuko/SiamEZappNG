export type PropertyType = 'condo' | 'house' | 'townhouse' | 'land' | 'commercial' | 'villa';
export type PropertyListingType = 'sale' | 'rent';
export type PropertySellerKind = 'dealer' | 'private';
export type PropertyFurnished = 'unfurnished' | 'partially' | 'furnished' | 'not_applicable';
export type PropertyListingStatus = 'available' | 'reserved' | 'sold' | 'pending_boost';

export type RealEstateListing = {
  id: string;
  ownerId: string;
  title: string;
  propertyType: PropertyType;
  listingType: PropertyListingType;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number;
  landAreaSqm: number | null;
  floor: number | null;
  yearBuilt: number | null;
  province: string;
  district: string | null;
  neighborhood: string | null;
  priceAmount: number;
  priceCurrency: string;
  sellerKind: PropertySellerKind;
  furnished: PropertyFurnished;
  status: PropertyListingStatus;
  heroImageUrl: string;
  description: string;
  isBoosted?: boolean;
  boostActive?: boolean;
  createdAt: string;
};

export type CreateRealEstateListingInput = Omit<RealEstateListing, 'id' | 'createdAt'>;
export type UpdateRealEstateListingInput = Partial<CreateRealEstateListingInput>;

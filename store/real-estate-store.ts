import { create } from 'zustand';

import { seedRealEstateListings } from '../features/real-estate/real-estate.data';
import type {
  CreateRealEstateListingInput,
  RealEstateListing,
  UpdateRealEstateListingInput,
} from '../features/real-estate/real-estate.types';

type RealEstateState = {
  listings: RealEstateListing[];
  hydrateListings: (items: RealEstateListing[]) => void;
  createListing: (input: CreateRealEstateListingInput) => void;
  updateListing: (id: string, input: UpdateRealEstateListingInput) => void;
  deleteListing: (id: string) => void;
};

function safeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function enrichFromExisting(remote: RealEstateListing, existing: RealEstateListing | undefined): RealEstateListing {
  if (!existing) return remote;
  return {
    ...remote,
    description: remote.description || existing.description,
    landAreaSqm: remote.landAreaSqm ?? existing.landAreaSqm,
    floor: remote.floor ?? existing.floor,
    yearBuilt: remote.yearBuilt ?? existing.yearBuilt,
    neighborhood: remote.neighborhood ?? existing.neighborhood,
    furnished: remote.furnished !== 'not_applicable' ? remote.furnished : existing.furnished,
  };
}

export const useRealEstateStore = create<RealEstateState>((set) => ({
  listings: seedRealEstateListings,
  hydrateListings: (items) =>
    set((state) => {
      if (state.listings.length > 0 && state.listings.some((item) => item.ownerId !== 'seed-admin')) {
        return state;
      }
      const byTitle = new Map(state.listings.map((item) => [item.title, item]));
      return {
        listings: items.map((item) => enrichFromExisting(item, byTitle.get(item.title))),
      };
    }),
  createListing: (input) =>
    set((state) => ({
      listings: [
        {
          ...input,
          id: `${safeSlug(input.title)}-${Date.now().toString(36)}`,
          createdAt: new Date().toISOString(),
        },
        ...state.listings,
      ],
    })),
  updateListing: (id, input) =>
    set((state) => ({
      listings: state.listings.map((listing) => (listing.id === id ? { ...listing, ...input } : listing)),
    })),
  deleteListing: (id) =>
    set((state) => ({
      listings: state.listings.filter((listing) => listing.id !== id),
    })),
}));

import { create } from 'zustand';

import { seedSalesListings } from '../features/sales/sales.data';
import type { CreateSalesListingInput, SalesListing, UpdateSalesListingInput } from '../features/sales/sales.types';

type SalesState = {
  listings: SalesListing[];
  hydrateListings: (items: SalesListing[]) => void;
  createListing: (input: CreateSalesListingInput) => void;
  updateListing: (id: string, input: UpdateSalesListingInput) => void;
  deleteListing: (id: string) => void;
};

function safeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const useSalesStore = create<SalesState>((set) => ({
  listings: seedSalesListings,
  hydrateListings: (items) =>
    set((state) => {
      if (state.listings.length > 0 && state.listings.some((item) => item.ownerId !== 'seed-admin')) {
        return state;
      }
      return { listings: items };
    }),
  createListing: (input) =>
    set((state) => ({
      listings: [
        {
          ...input,
          id: `${safeSlug(`${input.make}-${input.model}-${input.year}`)}-${Date.now().toString(36)}`,
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

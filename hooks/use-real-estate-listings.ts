import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createPropertyListing,
  deletePropertyListing,
  fetchMyPropertyListings,
  fetchPropertiesPage,
  fetchPropertyListingById,
  updatePropertyListing,
  type PropertyListingWriteInput,
  type RealEstateListFilters,
} from '../features/real-estate/real-estate.api';
import { useSessionQueryEnabled } from './use-session-query-enabled';

export function realEstateListQueryKey(filters: RealEstateListFilters) {
  return ['real-estate-listings', filters] as const;
}

export function useRealEstateListings(filters: RealEstateListFilters, enabled = true) {
  return useQuery({
    queryKey: realEstateListQueryKey(filters),
    queryFn: () => fetchPropertiesPage(filters),
    enabled,
  });
}

export function useMyPropertyListings(enabled = true) {
  const sessionEnabled = useSessionQueryEnabled();
  return useQuery({
    queryKey: ['my-property-listings'],
    queryFn: fetchMyPropertyListings,
    enabled: enabled && sessionEnabled,
  });
}

export function usePropertyListing(id: string | undefined) {
  return useQuery({
    queryKey: ['property-listing', id],
    queryFn: () => fetchPropertyListingById(id!),
    enabled: Boolean(id),
  });
}

export function useCreatePropertyListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PropertyListingWriteInput) => createPropertyListing(input),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['real-estate-listings'] }),
        qc.invalidateQueries({ queryKey: ['my-property-listings'] }),
        qc.invalidateQueries({ queryKey: ['seller-analytics'] }),
      ]);
    },
  });
}

export function useUpdatePropertyListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PropertyListingWriteInput }) =>
      updatePropertyListing(id, input),
    onSuccess: async (_data, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['real-estate-listings'] }),
        qc.invalidateQueries({ queryKey: ['my-property-listings'] }),
        qc.invalidateQueries({ queryKey: ['property-listing', vars.id] }),
        qc.invalidateQueries({ queryKey: ['seller-analytics'] }),
      ]);
    },
  });
}

export function useDeletePropertyListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePropertyListing(id),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['real-estate-listings'] }),
        qc.invalidateQueries({ queryKey: ['my-property-listings'] }),
        qc.invalidateQueries({ queryKey: ['seller-analytics'] }),
      ]);
    },
  });
}

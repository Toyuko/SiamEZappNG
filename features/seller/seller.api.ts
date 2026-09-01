import { api, type ApiEnvelope, unwrapApiData } from '../../lib/api';
import type { MarketplaceListingType } from '../marketplace/marketplace.types';

export type SellerAnalytics = {
  listingCount: number;
  totalViews: number;
  totalEnquiries: number;
  rows: Array<{
    listingType: MarketplaceListingType;
    listingId: string;
    title: string;
    href: string;
    viewCount: number;
    enquiryCount: number;
  }>;
};

export type ListingEnquiry = {
  id: string;
  listingType: MarketplaceListingType;
  listingId: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  listingTitle?: string | null;
  createdAt: string;
};

export async function fetchSellerAnalytics(limit = 8) {
  const response = await api.get<SellerAnalytics | ApiEnvelope<SellerAnalytics>>(
    `/api/v1/seller/analytics?limit=${limit}`
  );
  return unwrapApiData(response);
}

export async function fetchSellerEnquiries() {
  const response = await api.get<
    ListingEnquiry[] | ApiEnvelope<ListingEnquiry[]>
  >('/api/v1/marketplace/enquiries');
  return unwrapApiData(response);
}

export async function createListingEnquiry(input: {
  listingType: MarketplaceListingType;
  listingId: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}) {
  const response = await api.post('/api/v1/marketplace/enquiries', input);
  return unwrapApiData(response);
}

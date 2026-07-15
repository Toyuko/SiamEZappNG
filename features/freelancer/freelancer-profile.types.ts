import type { FreelancerVerificationStatus } from './freelancer.types';

export type FreelancerServiceOffering = {
  title: string;
  description?: string;
  /** Price in satang (smallest THB unit). */
  price?: number | null;
  currency?: string;
};

export type FreelancerPublicUser = {
  id: string;
  name: string | null;
  image: string | null;
};

/** Card payload from GET /api/freelancers */
export type FreelancerPublicCard = {
  id: string;
  slug: string;
  title: string | null;
  bio: string | null;
  skills: string[];
  /** Hourly rate in satang. */
  hourlyRate: number | null;
  averageRating: number;
  totalReviews: number;
  verificationStatus: FreelancerVerificationStatus;
  isSpecialMember: boolean;
  user: FreelancerPublicUser;
};

/** Detail payload from GET /api/freelancers/[slug] */
export type FreelancerPublicProfile = FreelancerPublicCard & {
  services: FreelancerServiceOffering[];
  createdAt: string;
};

export type FreelancerPublicListResult = {
  items: FreelancerPublicCard[];
  total: number;
  page: number;
  pageSize: number;
};

export type FreelancerPublicListFilters = {
  q?: string;
  skill?: string;
  page?: number;
  pageSize?: number;
};

/** Owner profile from GET/PUT /api/freelancer/me */
export type FreelancerOwnerProfile = {
  id: string;
  userId: string;
  slug: string | null;
  isPublic: boolean;
  title: string | null;
  bio: string | null;
  skills: string[];
  hourlyRate: number | null;
  services: FreelancerServiceOffering[];
  verificationStatus: FreelancerVerificationStatus;
  isSpecialMember: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
  user: FreelancerPublicUser & { email?: string | null };
};

export type FreelancerMeResponse = {
  profile: FreelancerOwnerProfile | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
};

export type FreelancerProfileUpdateInput = {
  slug: string;
  isPublic: boolean;
  title?: string;
  bio?: string;
  skills?: string[];
  hourlyRate?: number | null;
  services?: FreelancerServiceOffering[];
};

export type FreelancerInquiryInput = {
  slug: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
};

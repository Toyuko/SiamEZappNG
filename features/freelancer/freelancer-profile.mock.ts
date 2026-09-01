import type {
  FreelancerMeResponse,
  FreelancerOwnerProfile,
  FreelancerPublicListResult,
  FreelancerPublicProfile,
  FreelancerProfileUpdateInput,
} from './freelancer-profile.types';

const MOCK_OWNER: FreelancerOwnerProfile = {
  id: 'mock-freelancer-profile-1',
  userId: 'mock-user-freelancer-1',
  slug: 'sam-freelancer',
  isPublic: true,
  title: 'Thailand Relocation Specialist',
  bio: 'Experienced Thailand relocation specialist helping expats with visas, documents, and settling in.',
  skills: ['Translation', 'Visa support', 'Document prep'],
  hourlyRate: 80_000,
  services: [
    {
      title: 'Marriage Registration Assistance',
      description: 'Full support for marriage registration at the district office.',
      price: 500_000,
      currency: 'THB',
    },
    {
      title: 'Document Translation (EN ↔ TH)',
      description: 'Certified translation for official documents.',
      price: 150_000,
      currency: 'THB',
    },
  ],
  verificationStatus: 'verified',
  isSpecialMember: false,
  averageRating: 4.8,
  totalReviews: 12,
  createdAt: '2026-05-15T10:37:54.750Z',
  updatedAt: '2026-05-15T10:37:54.750Z',
  user: {
    id: 'mock-user-freelancer-1',
    name: 'Sam Freelancer',
    image: null,
    email: 'freelancer@example.com',
  },
};

let mockOwnerState: FreelancerOwnerProfile = { ...MOCK_OWNER, skills: [...MOCK_OWNER.skills], services: [...MOCK_OWNER.services] };

export function resetFreelancerProfileMock() {
  mockOwnerState = {
    ...MOCK_OWNER,
    skills: [...MOCK_OWNER.skills],
    services: MOCK_OWNER.services.map((s) => ({ ...s })),
  };
}

export function getMockMyFreelancerProfile(): FreelancerMeResponse {
  return {
    profile: mockOwnerState,
    user: {
      id: mockOwnerState.user.id,
      name: mockOwnerState.user.name,
      email: mockOwnerState.user.email ?? null,
      image: mockOwnerState.user.image,
      role: 'freelancer',
    },
  };
}

export function mockUpdateMyFreelancerProfile(data: FreelancerProfileUpdateInput): {
  profile: FreelancerOwnerProfile;
  user: FreelancerMeResponse['user'];
} {
  mockOwnerState = {
    ...mockOwnerState,
    slug: data.slug,
    isPublic: data.isPublic,
    title: data.title?.trim() ? data.title.trim() : null,
    bio: data.bio?.trim() ? data.bio.trim() : null,
    skills: data.skills ?? [],
    hourlyRate: data.hourlyRate ?? null,
    services: (data.services ?? []).map((s) => ({ ...s, currency: s.currency ?? 'THB' })),
    updatedAt: new Date().toISOString(),
  };
  return {
    profile: mockOwnerState,
    user: {
      id: mockOwnerState.user.id,
      name: mockOwnerState.user.name,
      email: mockOwnerState.user.email ?? null,
      image: mockOwnerState.user.image,
      role: 'freelancer',
    },
  };
}

export function getMockPublicFreelancers(filters?: {
  q?: string;
  skill?: string;
  page?: number;
  pageSize?: number;
}): FreelancerPublicListResult {
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, filters?.pageSize ?? 12));
  const q = filters?.q?.trim().toLowerCase();
  const skill = filters?.skill?.trim();

  const card = {
    id: mockOwnerState.id,
    slug: mockOwnerState.slug ?? 'sam-freelancer',
    title: mockOwnerState.title,
    bio: mockOwnerState.bio,
    skills: mockOwnerState.skills,
    hourlyRate: mockOwnerState.hourlyRate,
    averageRating: mockOwnerState.averageRating,
    totalReviews: mockOwnerState.totalReviews,
    verificationStatus: mockOwnerState.verificationStatus,
    isSpecialMember: mockOwnerState.isSpecialMember,
    user: {
      id: mockOwnerState.user.id,
      name: mockOwnerState.user.name,
      image: mockOwnerState.user.image,
    },
  };

  let items = mockOwnerState.isPublic ? [card] : [];
  if (skill) {
    items = items.filter((item) => item.skills.includes(skill));
  }
  if (q) {
    items = items.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.bio?.toLowerCase().includes(q) ||
        item.slug.includes(q) ||
        item.user.name?.toLowerCase().includes(q) ||
        item.skills.some((s) => s.toLowerCase().includes(q)),
    );
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page, pageSize };
}

export function getMockPublicFreelancerBySlug(slug: string): FreelancerPublicProfile | null {
  const normalized = slug.trim().toLowerCase();
  if (!mockOwnerState.isPublic || mockOwnerState.slug !== normalized) {
    return null;
  }
  return {
    id: mockOwnerState.id,
    slug: mockOwnerState.slug,
    title: mockOwnerState.title,
    bio: mockOwnerState.bio,
    skills: mockOwnerState.skills,
    hourlyRate: mockOwnerState.hourlyRate,
    averageRating: mockOwnerState.averageRating,
    totalReviews: mockOwnerState.totalReviews,
    verificationStatus: mockOwnerState.verificationStatus,
    isSpecialMember: mockOwnerState.isSpecialMember,
    services: mockOwnerState.services,
    createdAt: mockOwnerState.createdAt,
    user: {
      id: mockOwnerState.user.id,
      name: mockOwnerState.user.name,
      image: mockOwnerState.user.image,
    },
  };
}

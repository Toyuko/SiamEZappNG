import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import {
  getPublicFreelancerBySlug,
  getPublicFreelancers,
} from '../features/freelancer/freelancer-profile.api';

/** Matches website `PUBLIC_FREELANCER_PAGE_SIZE` so the first screen lists the same people. */
const PAGE_SIZE = 24;

export function useFreelancerDirectory(filters: { q?: string; skill?: string }) {
  const q = filters.q?.trim() || undefined;
  const skill = filters.skill?.trim() || undefined;

  return useInfiniteQuery({
    queryKey: ['freelancer-directory', q ?? '', skill ?? ''],
    queryFn: ({ pageParam }) =>
      getPublicFreelancers({
        q,
        skill,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.pageSize;
      if (loaded >= lastPage.total) {
        return undefined;
      }
      return lastPage.page + 1;
    },
  });
}

export function usePublicFreelancerProfile(slug?: string) {
  return useQuery({
    queryKey: ['freelancer-public', slug],
    queryFn: () => getPublicFreelancerBySlug(slug!),
    enabled: Boolean(slug?.trim()),
  });
}

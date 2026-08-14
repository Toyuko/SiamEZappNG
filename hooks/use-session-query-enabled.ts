import { useAuthStore } from '../store/auth-store';

/** True only for an authenticated (non-guest) session. Use to gate private React Query hooks. */
export function useSessionQueryEnabled() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isGuest = useAuthStore((state) => state.isGuest);
  return Boolean(accessToken) && !isGuest;
}

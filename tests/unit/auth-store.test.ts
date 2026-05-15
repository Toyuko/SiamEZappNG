import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '../../store/auth-store';

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      user: null,
      userRole: null,
      isGuest: false,
      guestProfile: null,
      isBootstrapping: true,
    });
  });

  it('sets authenticated session and clears guest state', () => {
    useAuthStore.getState().enterGuestMode({ name: 'Guest', email: 'g@example.com', phone: '01' });
    useAuthStore.getState().setSession({
      accessToken: 'token',
      user: { id: 'u1', email: 'u@example.com', name: 'User' },
    });
    expect(useAuthStore.getState().isGuest).toBe(false);
    expect(useAuthStore.getState().guestProfile).toBeNull();
  });

  it('supports guest mode profile update', () => {
    useAuthStore.getState().enterGuestMode();
    useAuthStore.getState().updateGuestProfile({
      name: 'New Guest',
      email: 'new@example.com',
      phone: '0899999999',
    });

    const state = useAuthStore.getState();
    expect(state.isGuest).toBe(true);
    expect(state.guestProfile?.email).toBe('new@example.com');
  });

  it('clears session state on logout', () => {
    useAuthStore.getState().setSession({
      accessToken: 'token',
      user: { id: 'u1', email: 'u@example.com' },
    });
    useAuthStore.getState().setUserRole('freelancer');
    useAuthStore.getState().clearSession();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.userRole).toBeNull();
    expect(state.isGuest).toBe(false);
  });

  it('persists user role in store', () => {
    useAuthStore.getState().setUserRole('client');
    expect(useAuthStore.getState().userRole).toBe('client');
  });
});

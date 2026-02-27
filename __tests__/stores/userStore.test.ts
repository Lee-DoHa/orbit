import { useUserStore } from '@/stores/userStore';

describe('userStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      id: null,
      email: null,
      displayName: null,
      subscriptionTier: 'free',
      persona: 'calm',
      isAuthenticated: false,
    });
  });

  describe('initial state', () => {
    it('is not authenticated', () => {
      expect(useUserStore.getState().isAuthenticated).toBe(false);
    });

    it('has free subscription', () => {
      expect(useUserStore.getState().subscriptionTier).toBe('free');
    });

    it('has calm persona', () => {
      expect(useUserStore.getState().persona).toBe('calm');
    });

    it('has null user fields', () => {
      const state = useUserStore.getState();
      expect(state.id).toBeNull();
      expect(state.email).toBeNull();
      expect(state.displayName).toBeNull();
    });
  });

  describe('setUser', () => {
    it('sets user info and authenticates', () => {
      useUserStore.getState().setUser({
        id: 'user-123',
        email: 'test@orbit.app',
        displayName: '도하',
      });

      const state = useUserStore.getState();
      expect(state.id).toBe('user-123');
      expect(state.email).toBe('test@orbit.app');
      expect(state.displayName).toBe('도하');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('setPersona', () => {
    it('changes persona', () => {
      useUserStore.getState().setPersona('cheer');
      expect(useUserStore.getState().persona).toBe('cheer');
    });

    it('can set to rational', () => {
      useUserStore.getState().setPersona('rational');
      expect(useUserStore.getState().persona).toBe('rational');
    });
  });

  describe('setSubscription', () => {
    it('upgrades to pro', () => {
      useUserStore.getState().setSubscription('pro');
      expect(useUserStore.getState().subscriptionTier).toBe('pro');
    });
  });

  describe('logout', () => {
    it('clears user and resets to defaults', () => {
      useUserStore.getState().setUser({
        id: 'user-123',
        email: 'test@orbit.app',
        displayName: '도하',
      });
      useUserStore.getState().setSubscription('pro');

      useUserStore.getState().logout();

      const state = useUserStore.getState();
      expect(state.id).toBeNull();
      expect(state.email).toBeNull();
      expect(state.displayName).toBeNull();
      expect(state.subscriptionTier).toBe('free');
      expect(state.isAuthenticated).toBe(false);
    });

    it('preserves persona after logout', () => {
      useUserStore.getState().setPersona('cheer');
      useUserStore.getState().logout();
      expect(useUserStore.getState().persona).toBe('cheer');
    });
  });
});

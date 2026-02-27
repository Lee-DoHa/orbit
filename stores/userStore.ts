import { create } from 'zustand';

type SubscriptionTier = 'free' | 'pro';
type Persona = 'calm' | 'cheer' | 'rational';

type UserState = {
  id: string | null;
  email: string | null;
  displayName: string | null;
  subscriptionTier: SubscriptionTier;
  persona: Persona;
  isAuthenticated: boolean;

  setUser: (user: { id: string; email: string; displayName: string }) => void;
  setPersona: (persona: Persona) => void;
  setSubscription: (tier: SubscriptionTier) => void;
  logout: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  id: null,
  email: null,
  displayName: null,
  subscriptionTier: 'free',
  persona: 'calm',
  isAuthenticated: false,

  setUser: (user) =>
    set({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isAuthenticated: true,
    }),

  setPersona: (persona) => set({ persona }),
  setSubscription: (tier) => set({ subscriptionTier: tier }),

  logout: () =>
    set({
      id: null,
      email: null,
      displayName: null,
      subscriptionTier: 'free',
      isAuthenticated: false,
    }),
}));

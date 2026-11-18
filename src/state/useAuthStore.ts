import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, dusmintApi } from '@dusmint/api-client';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  preferredLanguage: 'en' | 'hi' | 'mr';
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  isVegOnly: boolean;
  isHydrated: boolean;

  // Actions
  setAuth: (token: string, user: UserProfile) => void;
  setToken: (token: string) => void;
  setGuest: (val: boolean) => void;
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  toggleVegOnly: () => void;
  setVegOnly: (val: boolean) => void;
  setHydrated: (val: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      preferredLanguage: 'en',
      isAuthenticated: false,
      isGuest: false,
      isLoading: false,
      isVegOnly: false,
      isHydrated: false,

      setHydrated: (val: boolean) => set({ isHydrated: val }),
      setGuest: (val: boolean) => set({ isGuest: val }),

      toggleVegOnly: () => {
        set((state) => {
          const next = !state.isVegOnly;
          return {
            isVegOnly: next,
            user: state.user ? { ...state.user, isVegOnly: next } : null,
          };
        });
      },

      setVegOnly: (val) => {
        set((state) => ({
          isVegOnly: val,
          user: state.user ? { ...state.user, isVegOnly: val } : null,
        }));
      },

      setAuth: (token, user) => {
        const cleanEmail = user?.email && !user.email.toLowerCase().includes('@dusmint.com') ? user.email : undefined;
        const cleanUser = user
          ? {
              ...user,
              email: cleanEmail,
              isEmailVerified: cleanEmail ? (user.isEmailVerified ?? true) : false,
            }
          : null;
        dusmintApi.setAuthToken(token, cleanUser?.id);
        set({
          token,
          user: cleanUser,
          isAuthenticated: true,
          isGuest: false,
          preferredLanguage: cleanUser?.preferredLanguage || 'en',
        });
      },

      setToken: (token) => {
        dusmintApi.setAuthToken(token);
        set({
          token,
          isAuthenticated: true,
          isGuest: false,
        });
      },

      setLanguage: (lang) => {
        set({ preferredLanguage: lang });
      },

      updateUser: (updates) => {
        set((state) => {
          if (!state.user) return { user: null };
          const resolvedEmail =
            updates.email !== undefined
              ? updates.email && !updates.email.toLowerCase().includes('@dusmint.com')
                ? updates.email
                : undefined
              : state.user.email;
          return {
            user: {
              ...state.user,
              ...updates,
              email: resolvedEmail,
              isEmailVerified: resolvedEmail
                ? (updates.isEmailVerified ?? state.user.isEmailVerified ?? true)
                : false,
            },
          };
        });
      },

      logout: () => {
        dusmintApi.setAuthToken(null, '');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isGuest: false,
        });
      },
    }),
    {
      name: 'dusmint-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          dusmintApi.setAuthToken(state.token, state.user?.id);
        }
        if (state?.user?.email && state.user.email.toLowerCase().includes('@dusmint.com')) {
          state.user.email = undefined;
          state.user.isEmailVerified = false;
        }
        useAuthStore.setState({ isHydrated: true });
      },
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        preferredLanguage: state.preferredLanguage,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
        isVegOnly: state.isVegOnly,
      }),
    }
  )
);

import { create } from 'zustand';
import { UserProfile, dusmintApi } from '@dusmint/api-client';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  preferredLanguage: 'en' | 'hi' | 'mr';
  isAuthenticated: boolean;
  isLoading: boolean;
  isVegOnly: boolean;
  
  // Actions
  setAuth: (token: string, user: UserProfile) => void;
  setToken: (token: string) => void;
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  toggleVegOnly: () => void;
  setVegOnly: (val: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  preferredLanguage: 'en',
  isAuthenticated: false,
  isLoading: false,
  isVegOnly: false,

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
    dusmintApi.setAuthToken(token);
    set({
      token,
      user,
      isAuthenticated: true,
      preferredLanguage: user.preferredLanguage || 'en',
    });
  },

  setToken: (token) => {
    dusmintApi.setAuthToken(token);
    set({
      token,
      isAuthenticated: true,
      user: {
        id: 'user-demo',
        phone: '+919876543210',
        fullName: 'Akila Perera',
        email: 'akila@gmail.com',
        preferredLanguage: 'en',
        trustTier: 1,
        isVegOnly: false,
        createdAt: new Date().toISOString(),
      },
    });
  },

  setLanguage: (lang) => {
    set({ preferredLanguage: lang });
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },

  logout: () => {
    dusmintApi.setAuthToken(null);
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));

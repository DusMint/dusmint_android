import { create } from 'zustand';
import axios from 'axios';
import { AppState, AppStateStatus } from 'react-native';
import { registerNetworkStatusCallback } from '../api-client';

const HEALTH_URL = process.env.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '/health')
  : 'https://dusmint-backend.onrender.com/health';

interface NetworkState {
  isOffline: boolean;
  wasOffline: boolean;
  isChecking: boolean;
  lastCheckedAt: number | null;
  consecutiveFailures: number;

  // Actions
  setOffline: (offline: boolean) => void;
  checkConnectivity: () => Promise<boolean>;
  resetWasOffline: () => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isOffline: false,
  wasOffline: false,
  isChecking: false,
  lastCheckedAt: null,
  consecutiveFailures: 0,

  setOffline: (offline: boolean) => {
    const current = get().isOffline;
    if (current !== offline) {
      set({
        isOffline: offline,
        wasOffline: current && !offline, // true when transitioning from offline -> online
        lastCheckedAt: Date.now(),
        consecutiveFailures: offline ? 2 : 0,
      });
    }
  },

  resetWasOffline: () => {
    set({ wasOffline: false });
  },

  checkConnectivity: async () => {
    set({ isChecking: true });
    try {
      const response = await axios.get(HEALTH_URL, {
        timeout: 10000,
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });

      const isOnline = response.status === 200;
      const prevOffline = get().isOffline;

      set({
        isOffline: !isOnline,
        wasOffline: prevOffline && isOnline,
        isChecking: false,
        lastCheckedAt: Date.now(),
        consecutiveFailures: 0,
      });

      return isOnline;
    } catch {
      const failures = (get().consecutiveFailures || 0) + 1;
      // Require 2 consecutive failures before declaring offline
      const shouldFlagOffline = failures >= 2;

      set({
        isOffline: shouldFlagOffline ? true : get().isOffline,
        isChecking: false,
        lastCheckedAt: Date.now(),
        consecutiveFailures: failures,
      });
      return false;
    }
  },
}));

// Automatic background interval & app state listener
let intervalId: ReturnType<typeof setInterval> | null = null;

export const initNetworkMonitoring = () => {
  if (intervalId) return;

  // Listen to live API client errors
  registerNetworkStatusCallback((offline) => {
    useNetworkStore.getState().setOffline(offline);
  });

  // Initial check
  useNetworkStore.getState().checkConnectivity();

  // Heartbeat ping every 12 seconds
  intervalId = setInterval(() => {
    useNetworkStore.getState().checkConnectivity();
  }, 12000);

  // AppState change listener (e.g. user toggles Wi-Fi in quick settings and returns)
  const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      useNetworkStore.getState().checkConnectivity();
    }
  });

  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    subscription.remove();
  };
};

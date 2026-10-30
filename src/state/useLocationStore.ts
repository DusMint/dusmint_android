import { create } from 'zustand';
import { Address, ClusterInfo, dusmintApi } from '@dusmint/api-client';
import {
  getCurrentGPSPosition,
  reverseGeocodeCoordinates,
  checkLocationPermission,
  promptEnableLocation,
  ResolvedLocation,
} from '../services/locationService';

interface LocationState {
  // Coords & Address strings
  userLatitude: number | null;
  userLongitude: number | null;
  userAddress: string | null;
  shortAddress: string | null;
  locality: string | null;
  city: string | null;
  pincode: string | null;

  // Permissions & Loading
  hasPermission: boolean;
  isLocating: boolean;

  // Backend Cluster state
  currentAddress: Address | null;
  currentCluster: ClusterInfo | null;
  isCheckingServiceability: boolean;

  // Actions
  setAddress: (address: Address) => void;
  setCluster: (cluster: ClusterInfo) => void;
  setUserLocation: (data: {
    latitude: number;
    longitude: number;
    address: string;
    shortAddress?: string;
    locality?: string;
    city?: string;
    pincode?: string;
  }) => void;
  fetchUserLocation: () => Promise<ResolvedLocation | null>;
  handleEnableLocation: () => Promise<boolean>;
  checkLocationServiceability: (lat: number, lng: number) => Promise<boolean>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  shortAddress: null,
  locality: null,
  city: null,
  pincode: null,

  hasPermission: true,
  isLocating: false,

  currentAddress: null,
  currentCluster: null,
  isCheckingServiceability: false,

  setAddress: (address) =>
    set({
      currentAddress: address,
      userLatitude: address.latitude,
      userLongitude: address.longitude,
      userAddress: `${address.houseNo ? address.houseNo + ', ' : ''}${address.streetArea}, ${address.pincode}`,
      shortAddress: address.streetArea || address.label.toUpperCase(),
    }),

  setCluster: (cluster) => set({ currentCluster: cluster }),

  setUserLocation: (data) =>
    set({
      userLatitude: data.latitude,
      userLongitude: data.longitude,
      userAddress: data.address,
      shortAddress: data.shortAddress || data.locality || data.address.split(',')[0] || 'Home',
      locality: data.locality || null,
      city: data.city || null,
      pincode: data.pincode || null,
    }),

  fetchUserLocation: async () => {
    set({ isLocating: true });
    try {
      const coords = await getCurrentGPSPosition();
      if (!coords) {
        const permitted = await checkLocationPermission();
        set({ isLocating: false, hasPermission: permitted });
        return null;
      }

      set({ hasPermission: true });

      // Reverse geocode with Ola Maps / Native cascade
      const resolved = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);

      set({
        userLatitude: resolved.latitude,
        userLongitude: resolved.longitude,
        userAddress: resolved.fullAddress,
        shortAddress: resolved.shortAddress,
        locality: resolved.locality,
        city: resolved.city,
        pincode: resolved.pincode,
        isLocating: false,
      });

      // Also trigger serviceability check in background
      get().checkLocationServiceability(resolved.latitude, resolved.longitude).catch(() => {});

      return resolved;
    } catch (err) {
      console.warn('[useLocationStore] fetchUserLocation error:', err);
      set({ isLocating: false });
      return null;
    }
  },

  handleEnableLocation: async () => {
    const success = await promptEnableLocation();
    set({ hasPermission: success });
    if (success) {
      await get().fetchUserLocation();
    }
    return success;
  },

  checkLocationServiceability: async (lat, lng) => {
    set({ isCheckingServiceability: true });
    try {
      const cluster = await dusmintApi.checkServiceability(lat, lng);
      set({ currentCluster: cluster, isCheckingServiceability: false });
      return cluster.isServiceable;
    } catch {
      set({ isCheckingServiceability: false });
      return false;
    }
  },
}));

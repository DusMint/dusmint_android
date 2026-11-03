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
  userLatitude: number;
  userLongitude: number;
  userAddress: string;
  shortAddress: string;
  locality: string;
  city: string;
  pincode: string;

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
  autoDetectLocation: () => Promise<ResolvedLocation | null>;
  fetchUserLocation: () => Promise<ResolvedLocation | null>;
  handleEnableLocation: () => Promise<boolean>;
  checkLocationServiceability: (lat: number, lng: number) => Promise<boolean>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  userLatitude: 22.7533,
  userLongitude: 75.8937,
  userAddress: 'Flat 402, Royal Palms, Scheme 54, Vijay Nagar, Indore',
  shortAddress: 'Vijay Nagar, Indore',
  locality: 'Vijay Nagar',
  city: 'Indore',
  pincode: '452010',

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
      shortAddress: address.streetArea || 'Vijay Nagar, Indore',
    }),

  setCluster: (cluster) => set({ currentCluster: cluster }),

  setUserLocation: (data) =>
    set({
      userLatitude: data.latitude,
      userLongitude: data.longitude,
      userAddress: data.address,
      shortAddress: data.shortAddress || (data.locality ? `${data.locality}, ${data.city || 'Indore'}` : 'Vijay Nagar, Indore'),
      locality: data.locality || 'Vijay Nagar',
      city: data.city || 'Indore',
      pincode: data.pincode || '452010',
    }),

  // Seamless GPS auto-detection called whenever the app opens
  autoDetectLocation: async () => {
    if (get().isLocating) return null;
    return await get().fetchUserLocation();
  },

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

      // Background cluster serviceability check
      get().checkLocationServiceability(resolved.latitude, resolved.longitude).catch(() => {});

      return resolved;
    } catch (err) {
      console.warn('[useLocationStore] fetchUserLocation notice:', err);
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

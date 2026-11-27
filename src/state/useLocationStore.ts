import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address, ClusterInfo, dusmintApi } from '@dusmint/api-client';
import { SavedAddressItem } from '../screens/location/data/locationData';
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
  savedAddresses: SavedAddressItem[];

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
  addSavedAddress: (address: SavedAddressItem) => void;
  setSavedAddresses: (addresses: SavedAddressItem[]) => void;
  deleteSavedAddress: (id: string) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
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
      savedAddresses: [],

      addSavedAddress: (address) =>
        set((state) => ({
          savedAddresses: [
            address,
            ...state.savedAddresses.filter((a) => a.id !== address.id).map((a) => ({ ...a, isSelected: false })),
          ],
        })),

      setSavedAddresses: (savedAddresses) => set({ savedAddresses }),

      deleteSavedAddress: (id) =>
        set((state) => ({
          savedAddresses: state.savedAddresses.filter((a) => a.id !== id),
        })),

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
          shortAddress:
            data.shortAddress ||
            (data.locality ? `${data.locality}, ${data.city || 'Indore'}` : 'Vijay Nagar, Indore'),
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

          // Only update coordinates & current address if user has not explicitly selected a saved address
          const state = get();
          const hasSelectedSaved = state.savedAddresses.some((a) => a.isSelected);

          if (!hasSelectedSaved) {
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
          } else {
            set({ isLocating: false });
          }

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
    }),
    {
      name: 'dusmint-location-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userLatitude: state.userLatitude,
        userLongitude: state.userLongitude,
        userAddress: state.userAddress,
        shortAddress: state.shortAddress,
        locality: state.locality,
        city: state.city,
        pincode: state.pincode,
        savedAddresses: state.savedAddresses,
        currentAddress: state.currentAddress,
      }),
    }
  )
);

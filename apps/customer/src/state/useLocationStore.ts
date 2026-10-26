import { create } from 'zustand';
import { Address, ClusterInfo, dusmintApi } from '@dusmint/api-client';

interface LocationState {
  currentAddress: Address | null;
  currentCluster: ClusterInfo | null;
  isCheckingServiceability: boolean;

  setAddress: (address: Address) => void;
  setCluster: (cluster: ClusterInfo) => void;
  checkLocationServiceability: (lat: number, lng: number) => Promise<boolean>;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentAddress: null,
  currentCluster: null,
  isCheckingServiceability: false,

  setAddress: (address) => set({ currentAddress: address }),
  setCluster: (cluster) => set({ currentCluster: cluster }),

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

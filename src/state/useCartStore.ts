import { create } from 'zustand';
import { Alert } from 'react-native';
import { CatalogueItem } from '@dusmint/api-client';
import { useNetworkStore } from './useNetworkStore';

export interface CartItem {
  item: CatalogueItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  substitutionPreference: 'replace_with_similar' | 'remove_if_unavailable';
  currentVendorId: string | null;
  currentVendorName: string | null;
  
  // Computed helpers
  getTotalItemsCount: () => number;
  getTotalItems: () => number;
  getTotalPaise: () => number;
  getVendorCount: () => number;
  getItemQuantity: (itemId: string) => number;
  
  // Actions
  addItem: (item: CatalogueItem) => { success: boolean; conflict?: boolean; error?: string };
  incrementItem: (itemId: string) => void;
  decrementItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  setSubstitutionPreference: (pref: 'replace_with_similar' | 'remove_if_unavailable') => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  substitutionPreference: 'replace_with_similar',
  currentVendorId: null,
  currentVendorName: null,

  getTotalItemsCount: () => {
    return get().items.reduce((total, i) => total + i.quantity, 0);
  },

  getTotalItems: () => {
    return get().items.reduce((total, i) => total + i.quantity, 0);
  },

  getTotalPaise: () => {
    return get().items.reduce((total, i) => total + i.item.pricePaise * i.quantity, 0);
  },

  getVendorCount: () => {
    const vendorIds = new Set(get().items.map((i) => i.item.vendorId));
    return vendorIds.size;
  },

  getItemQuantity: (itemId) => {
    const found = get().items.find((i) => i.item.id === itemId);
    return found ? found.quantity : 0;
  },

  addItem: (item) => {
    if (useNetworkStore.getState().isOffline) {
      Alert.alert(
        'You are offline',
        'Please check your internet connection to add items or update your cart.',
        [{ text: 'OK' }]
      );
      return { success: false, error: 'Offline' };
    }

    const currentItems = get().items;
    const currentVendorId = get().currentVendorId;

    // Check single-vendor rule (Zomato model)
    if (currentItems.length > 0 && currentVendorId && currentVendorId !== item.vendorId) {
      return {
        success: false,
        conflict: true,
        error: `Cart contains items from ${get().currentVendorName || 'another store'}.`,
      };
    }

    const existingIndex = currentItems.findIndex((i) => i.item.id === item.id);

    if (existingIndex > -1) {
      // Already in cart, increment
      const updated = [...currentItems];
      updated[existingIndex].quantity += 1;
      set({ items: updated });
      return { success: true };
    }

    set({
      items: [...currentItems, { item, quantity: 1 }],
      currentVendorId: item.vendorId,
      currentVendorName: item.vendorName || null,
    });
    return { success: true };
  },

  incrementItem: (itemId) => {
    if (useNetworkStore.getState().isOffline) {
      Alert.alert(
        'You are offline',
        'Please check your internet connection to update your cart.',
        [{ text: 'OK' }]
      );
      return;
    }
    const updated = get().items.map((i) =>
      i.item.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
    );
    set({ items: updated });
  },

  decrementItem: (itemId) => {
    const currentItems = get().items;
    const existing = currentItems.find((i) => i.item.id === itemId);
    if (!existing) return;

    if (existing.quantity <= 1) {
      // Remove when reduced to 0
      const remaining = currentItems.filter((i) => i.item.id !== itemId);
      set({
        items: remaining,
        currentVendorId: remaining.length === 0 ? null : get().currentVendorId,
        currentVendorName: remaining.length === 0 ? null : get().currentVendorName,
      });
    } else {
      set({
        items: currentItems.map((i) =>
          i.item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        ),
      });
    }
  },

  removeItem: (itemId) => {
    const remaining = get().items.filter((i) => i.item.id !== itemId);
    set({
      items: remaining,
      currentVendorId: remaining.length === 0 ? null : get().currentVendorId,
      currentVendorName: remaining.length === 0 ? null : get().currentVendorName,
    });
  },

  setSubstitutionPreference: (pref) => {
    set({ substitutionPreference: pref });
  },

  clearCart: () => {
    set({
      items: [],
      currentVendorId: null,
      currentVendorName: null,
    });
  },
}));

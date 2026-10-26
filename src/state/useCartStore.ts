import { create } from 'zustand';
import { CatalogueItem } from '@dusmint/api-client';

export interface CartItem {
  item: CatalogueItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  substitutionPreference: 'replace_with_similar' | 'remove_if_unavailable';
  
  // Computed helpers
  getTotalItemsCount: () => number;
  getTotalPaise: () => number;
  getVendorCount: () => number;
  getItemQuantity: (itemId: string) => number;
  
  // Actions
  addItem: (item: CatalogueItem) => { success: boolean; error?: string };
  incrementItem: (itemId: string) => void;
  decrementItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  setSubstitutionPreference: (pref: 'replace_with_similar' | 'remove_if_unavailable') => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  substitutionPreference: 'replace_with_similar',

  getTotalItemsCount: () => {
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
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex((i) => i.item.id === item.id);

    if (existingIndex > -1) {
      // Already in cart, increment
      const updated = [...currentItems];
      updated[existingIndex].quantity += 1;
      set({ items: updated });
      return { success: true };
    }

    // Check multi-vendor limit (max 3 vendors per order)
    const currentVendorIds = new Set(currentItems.map((i) => i.item.vendorId));
    if (!currentVendorIds.has(item.vendorId) && currentVendorIds.size >= 3) {
      return {
        success: false,
        error: 'You can combine items from up to 3 local shops in one cart.',
      };
    }

    set({ items: [...currentItems, { item, quantity: 1 }] });
    return { success: true };
  },

  incrementItem: (itemId) => {
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
      set({ items: currentItems.filter((i) => i.item.id !== itemId) });
    } else {
      set({
        items: currentItems.map((i) =>
          i.item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        ),
      });
    }
  },

  removeItem: (itemId) => {
    set({ items: get().items.filter((i) => i.item.id !== itemId) });
  },

  setSubstitutionPreference: (pref) => {
    set({ substitutionPreference: pref });
  },

  clearCart: () => {
    set({ items: [] });
  },
}));

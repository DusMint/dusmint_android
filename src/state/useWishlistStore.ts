import { create } from 'zustand';
import { CatalogueItem, dusmintApi } from '@dusmint/api-client';

export interface WishlistProduct extends CatalogueItem {
  deliveryMins?: string;
  rating?: number;
  discountPercent?: number;
  categoryTag?: string;
}

interface WishlistState {
  items: WishlistProduct[];
  isLoading: boolean;
  syncFromBackend: () => Promise<void>;
  addItem: (item: WishlistProduct) => void;
  removeItem: (itemId: string) => void;
  toggleItem: (item: WishlistProduct) => void;
  isWishlisted: (itemId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  // Real initial state: 0 mock items
  items: [],
  isLoading: false,

  syncFromBackend: async () => {
    set({ isLoading: true });
    try {
      const liveItems = await dusmintApi.getWishlist();
      if (Array.isArray(liveItems) && liveItems.length > 0) {
        const mapped: WishlistProduct[] = liveItems.map((i) => ({
          ...i,
          deliveryMins: '9 MINS',
          rating: 4.8,
          discountPercent:
            i.mrpPaise && i.mrpPaise > i.pricePaise
              ? Math.round(((i.mrpPaise - i.pricePaise) / i.mrpPaise) * 100)
              : 0,
        }));
        set({ items: mapped });
      }
    } catch {
      // Keep existing local items
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: (item) => {
    const exists = get().items.some((i) => i.id === item.id);
    if (!exists) {
      set({ items: [item, ...get().items] });
      dusmintApi.addToWishlist(item.id).catch(() => {});
    }
  },

  removeItem: (itemId) => {
    set({ items: get().items.filter((i) => i.id !== itemId) });
    dusmintApi.removeFromWishlist(itemId).catch(() => {});
  },

  toggleItem: (item) => {
    const exists = get().items.some((i) => i.id === item.id);
    if (exists) {
      set({ items: get().items.filter((i) => i.id !== item.id) });
      dusmintApi.removeFromWishlist(item.id).catch(() => {});
    } else {
      set({ items: [item, ...get().items] });
      dusmintApi.addToWishlist(item.id).catch(() => {});
    }
  },

  isWishlisted: (itemId) => {
    return get().items.some((i) => i.id === itemId);
  },

  clearWishlist: () => {
    set({ items: [] });
    dusmintApi.clearWishlist().catch(() => {});
  },
}));

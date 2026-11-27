import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CatalogueItem, dusmintApi } from '@dusmint/api-client';

export interface WishlistProduct extends CatalogueItem {
  deliveryMins?: string;
  rating?: number;
  discountPercent?: number;
  categoryTag?: string;
}

export interface WishlistShop {
  id: string;
  shopName: string;
  areaName?: string;
  distanceKm?: string | number;
  deliveryTimeMins?: number;
  score?: number | string;
  ratingCount?: number;
  bannerPhotoUrl?: string;
  category?: string;
  address?: string;
  isOpen?: boolean;
}

interface WishlistState {
  items: WishlistProduct[];
  shops: WishlistShop[];
  isLoading: boolean;
  syncFromBackend: () => Promise<void>;
  addItem: (item: WishlistProduct) => void;
  removeItem: (itemId: string) => void;
  toggleItem: (item: WishlistProduct) => void;
  isWishlisted: (itemId: string) => boolean;
  clearWishlist: () => void;

  // Shop Wishlist Methods
  addShop: (shop: WishlistShop) => void;
  removeShop: (shopId: string) => void;
  toggleShop: (shop: WishlistShop) => void;
  isShopWishlisted: (shopId: string) => boolean;
  clearShops: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      shops: [],
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

      // Shop methods
      addShop: (shop) => {
        const exists = get().shops.some((s) => s.id === shop.id);
        if (!exists) {
          set({ shops: [shop, ...get().shops] });
        }
      },

      removeShop: (shopId) => {
        set({ shops: get().shops.filter((s) => s.id !== shopId) });
      },

      toggleShop: (shop) => {
        const exists = get().shops.some((s) => s.id === shop.id);
        if (exists) {
          set({ shops: get().shops.filter((s) => s.id !== shop.id) });
        } else {
          set({ shops: [shop, ...get().shops] });
        }
      },

      isShopWishlisted: (shopId) => {
        return get().shops.some((s) => s.id === shopId);
      },

      clearShops: () => {
        set({ shops: [] });
      },
    }),
    {
      name: 'dusmint-wishlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        shops: state.shops,
      }),
    }
  )
);

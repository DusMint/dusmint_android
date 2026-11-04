import { create } from 'zustand';
import { CatalogueItem } from '@dusmint/api-client';

export interface WishlistProduct extends CatalogueItem {
  deliveryMins?: string;
  rating?: number;
  discountPercent?: number;
  categoryTag?: string;
}

interface WishlistState {
  items: WishlistProduct[];
  addItem: (item: WishlistProduct) => void;
  removeItem: (itemId: string) => void;
  toggleItem: (item: WishlistProduct) => void;
  isWishlisted: (itemId: string) => boolean;
  clearWishlist: () => void;
}

// Initial seed items so Wishlist is immediately active and testable
const INITIAL_WISHLIST_ITEMS: WishlistProduct[] = [
  {
    id: 'it-tomato-desi',
    vendorId: 'vendor-fresh-mandi',
    categoryId: 'cat-veg',
    nameEn: 'Fresh Desi Tomato (Tamatar)',
    nameHi: 'देसी टमाटर',
    unit: '1 kg',
    stepQuantity: 1,
    pricePaise: 2800,
    mrpPaise: 3500,
    photoUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
    isInStock: true,
    deliveryMins: '9 MINS',
    rating: 4.8,
    discountPercent: 20,
    categoryTag: 'Vegetables',
  },
  {
    id: 'it-amul-milk',
    vendorId: 'vendor-dairy-hub',
    categoryId: 'cat-dairy',
    nameEn: 'Amul Taaza Fresh Toned Milk',
    nameHi: 'अमुल ताज़ा दूध',
    unit: '500 ml',
    stepQuantity: 1,
    pricePaise: 2700,
    mrpPaise: 3000,
    photoUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
    isInStock: true,
    deliveryMins: '9 MINS',
    rating: 4.9,
    discountPercent: 10,
    categoryTag: 'Dairy',
  },
  {
    id: 'it-atta-chakki',
    vendorId: 'vendor-kirana-store',
    categoryId: 'cat-staples',
    nameEn: 'Aashirvaad Shudh Chakki Atta',
    nameHi: 'आशीर्वाद चक्की आटा',
    unit: '5 kg',
    stepQuantity: 1,
    pricePaise: 24500,
    mrpPaise: 27500,
    photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    isInStock: true,
    deliveryMins: '9 MINS',
    rating: 4.9,
    discountPercent: 11,
    categoryTag: 'Staples',
  },
];

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: INITIAL_WISHLIST_ITEMS,

  addItem: (item) => {
    const exists = get().items.some((i) => i.id === item.id);
    if (!exists) {
      set({ items: [item, ...get().items] });
    }
  },

  removeItem: (itemId) => {
    set({ items: get().items.filter((i) => i.id !== itemId) });
  },

  toggleItem: (item) => {
    const exists = get().items.some((i) => i.id === item.id);
    if (exists) {
      set({ items: get().items.filter((i) => i.id !== item.id) });
    } else {
      set({ items: [item, ...get().items] });
    }
  },

  isWishlisted: (itemId) => {
    return get().items.some((i) => i.id === itemId);
  },

  clearWishlist: () => {
    set({ items: [] });
  },
}));

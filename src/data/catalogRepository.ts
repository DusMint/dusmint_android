import seedData from '../../assets/seed/catalogue.json';
import { CatalogueItem } from '../api-client/types';

export interface Category {
  id: string;
  name: string;
  tint: string;
  image: string;
  icon: string;
}

export interface Product {
  id: string;
  categoryId: 'veg' | 'meat' | 'milk';
  name: string;
  hindiName?: string;
  unit: string;
  price: number;
  mrp: number;
  inStock: boolean;
  image: string;
  shopId: string;
  discountPercent?: number;
}

export interface Shop {
  id: string;
  name: string;
  category: 'veg' | 'meat' | 'milk';
  categoryLabel: string;
  rating: number;
  ratingCount: string;
  distanceKm: number;
  openTill: string;
  image: string;
  weightVerified: boolean;
}

export interface Slot {
  id: string;
  label: string;
  start: string;
  end: string;
  cutoff: string;
  display: string;
  cutoffDisplay: string;
}

export interface Banner {
  id: string;
  headline: string;
  subline: string;
  offerChip?: string;
  category: 'veg' | 'meat' | 'milk';
}

class CatalogRepository {
  private categories: Category[] = seedData.categories as Category[];
  private products: Product[] = seedData.products as Product[];
  private shops: Shop[] = seedData.shops as Shop[];
  private slots: Slot[] = seedData.slots as Slot[];
  private banners: Banner[] = seedData.banners as Banner[];

  /**
   * Get categories. Excludes 'meat' when isVegOnly is true.
   */
  getCategories(isVegOnly: boolean = false): Category[] {
    if (isVegOnly) {
      return this.categories.filter((c) => c.id !== 'meat');
    }
    return this.categories;
  }

  /**
   * Get products for a specific category, or all products.
   * Excludes meat products when isVegOnly is true.
   */
  getProducts(categoryId?: string, isVegOnly: boolean = false): Product[] {
    let list = this.products;
    if (categoryId) {
      list = list.filter((p) => p.categoryId === categoryId);
    }
    if (isVegOnly) {
      list = list.filter((p) => p.categoryId !== 'meat');
    }
    return list;
  }

  /**
   * Get trusted neighbourhood shops.
   * Excludes meat shops when isVegOnly is true.
   */
  getShops(isVegOnly: boolean = false): Shop[] {
    if (isVegOnly) {
      return this.shops.filter((s) => s.category !== 'meat');
    }
    return this.shops;
  }

  /**
   * Get available delivery slots.
   */
  getSlots(): Slot[] {
    return this.slots;
  }

  /**
   * Get rotating hero banners.
   */
  getBanners(isVegOnly: boolean = false): Banner[] {
    if (isVegOnly) {
      return this.banners.filter((b) => b.category !== 'meat');
    }
    return this.banners;
  }

  /**
   * Local offline search across English and Hindi names.
   */
  search(query: string, isVegOnly: boolean = false): Product[] {
    if (!query || query.trim().length === 0) return [];
    const q = query.trim().toLowerCase();
    let list = this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.hindiName && p.hindiName.includes(q))
    );
    if (isVegOnly) {
      list = list.filter((p) => p.categoryId !== 'meat');
    }
    return list;
  }

  /**
   * Convert Product to standard CatalogueItem for Cart operations.
   */
  toCatalogueItem(product: Product): CatalogueItem {
    return {
      id: product.id,
      vendorId: product.shopId,
      categoryId: product.categoryId,
      nameEn: product.name,
      nameHi: product.hindiName,
      unit: product.unit,
      stepQuantity: 1,
      pricePaise: product.price * 100,
      mandiBandMinPaise: (product.mrp - 4) * 100,
      mandiBandMaxPaise: (product.mrp + 4) * 100,
      isInStock: product.inStock,
    };
  }
}

export const catalogRepository = new CatalogRepository();


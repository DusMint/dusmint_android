import { ProductItem } from '../../home/data/homeData';

export interface ProductVariantDetail {
  id: string;
  label: string;
  price: number;
  mrp: number;
  unitPriceLabel: string;
  inStock: boolean;
  discountPercent?: number;
}

export interface ProductAttributeRow {
  label: string;
  value: string;
}

export interface ProductAttributeTab {
  id: string;
  title: string;
  rows?: ProductAttributeRow[];
  bodyText?: string;
  bullets?: string[];
}

export interface ProductOffer {
  id: string;
  title: string;
  description: string;
  code?: string;
}

export interface ProductDetailModel {
  id: string;
  name: string;
  shortDescription: string;
  categoryId: string;
  categoryName: string;
  images: string[];
  deliveryMins: string;
  variants: ProductVariantDetail[];
  offers: ProductOffer[];
  attributes: ProductAttributeTab[];
  similarProducts: ProductItem[];
}

export const SAMPLE_TENDER_COCONUT: ProductDetailModel = {
  id: 'prod-coconut-1',
  name: 'Fresh Green Tender Coconut (Nariyal Paani)',
  shortDescription: 'Naturally sweet and refreshing water, rich in electrolytes and vital minerals. Sourced directly from verified groves.',
  categoryId: 'cat-fresh',
  categoryName: 'Fruits & Vegetables',
  images: [
    'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=600',
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600',
    'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600',
  ],
  deliveryMins: '11 MINS',
  variants: [
    {
      id: 'var-coc-1',
      label: '1 Piece (200 - 300 ml)',
      price: 86,
      mrp: 120,
      unitPriceLabel: '₹86/piece',
      inStock: true,
      discountPercent: 28,
    },
    {
      id: 'var-coc-2',
      label: 'Pack of 2 Pieces',
      price: 165,
      mrp: 240,
      unitPriceLabel: '₹82.5/piece',
      inStock: true,
      discountPercent: 31,
    },
    {
      id: 'var-coc-3',
      label: 'Pack of 4 Pieces',
      price: 315,
      mrp: 480,
      unitPriceLabel: '₹78.7/piece',
      inStock: false,
      discountPercent: 34,
    },
  ],
  offers: [
    {
      id: 'off-1',
      title: '₹150 OFF',
      description: 'Get flat ₹150 OFF using Mandi Saver on orders above ₹499.',
    },
  ],
  attributes: [
    {
      id: 'tab-highlights',
      title: 'Highlights',
      rows: [
        { label: 'Included In Box', value: '1 x Tender Coconut (1 Piece)' },
        { label: 'Pack Size', value: '1 Piece (Approx 200-300 ml water)' },
        { label: 'Packaging Type', value: 'Shrink Film Wrapped Fresh' },
        { label: 'Special Feature', value: 'Natural Electrolytes & Minerals' },
        { label: 'Shelf Life', value: '6 Days (Keep Refrigerated)' },
        { label: 'Source', value: 'Mominpura & Direct Regional Mandi' },
        { label: 'Nutrient Density', value: 'High Potassium & Zero Trans Fat' },
      ],
    },
    {
      id: 'tab-description',
      title: 'Description',
      bodyText:
        'Indulge in nature’s pure energy drink! Our green tender coconuts are harvested at the peak of their sweetness, giving you a full serving of hydrating, potassium-packed water followed by creamy, tender malai. Packaged hygienically under strict temperature checks.',
    },
    {
      id: 'tab-benefits',
      title: 'Health benefits',
      bullets: [
        'Naturally boosts hydration and restores electrolyte balance.',
        'High potassium content aids in maintaining healthy blood pressure.',
        'Light on the digestive system and promotes gut wellness.',
        'Zero added sugar, preservatives, or artificial flavours.',
      ],
    },
    {
      id: 'tab-storage',
      title: 'Storage',
      bodyText:
        'Store in a cool, shaded environment. For best taste and refreshing chill, refrigerate before consumption. Once opened, consume immediately.',
    },
  ],
  similarProducts: [
    {
      id: 'sim-1',
      name: 'Desi Hybrid Tomato',
      price: 22,
      mrp: 26,
      quantityLabel: '500 g',
      rating: 4.8,
      ratingCount: 1420,
      deliveryTime: '9 MINS',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300',
      tag: 'BESTSELLER',
      category: 'fresh',
      inStock: true,
    },
    {
      id: 'sim-2',
      name: 'Fresh Farm Milk (Toned)',
      price: 56,
      mrp: 62,
      quantityLabel: '1 L',
      rating: 4.9,
      ratingCount: 3200,
      deliveryTime: '9 MINS',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300',
      tag: 'BESTSELLER',
      category: 'dairy',
      inStock: true,
    },
    {
      id: 'sim-3',
      name: 'Nashik Red Onion (Pyaaz)',
      price: 34,
      mrp: 38,
      quantityLabel: '1 kg',
      rating: 4.7,
      ratingCount: 890,
      deliveryTime: '9 MINS',
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300',
      category: 'fresh',
      inStock: true,
    },
    {
      id: 'sim-4',
      name: 'Indore Jyoti Fresh Potato',
      price: 28,
      mrp: 35,
      quantityLabel: '1 kg',
      rating: 4.6,
      ratingCount: 650,
      deliveryTime: '10 MINS',
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300',
      category: 'fresh',
      inStock: true,
    },
  ],
};

export function getProductDetailById(productId: string): ProductDetailModel {
  // If id matches a specific product or fallback to sample tender coconut with custom title
  if (productId === 'prod-coconut-1') {
    return SAMPLE_TENDER_COCONUT;
  }
  return {
    ...SAMPLE_TENDER_COCONUT,
    id: productId,
    name:
      productId === 'item-101' || productId === 'lp-1' || productId === 'sim-1'
        ? 'Fresh Desi Hybrid Tomato'
        : productId === 'item-102' || productId === 'lp-2' || productId === 'sim-4'
        ? 'Indore Jyoti Fresh Potato'
        : productId === 'item-103' || productId === 'lp-3' || productId === 'sim-3'
        ? 'Nashik Red Onion (Pyaaz)'
        : productId === 'sim-2'
        ? 'Fresh Farm Cow Milk (Toned)'
        : 'Fresh Green Tender Coconut',
  };
}

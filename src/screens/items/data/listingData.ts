export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  mrp: number;
  unitPriceText?: string;
}

export interface ListingProduct {
  id: string;
  name: string;
  isVeg: boolean;
  isAd?: boolean;
  isPriceForYou?: boolean;
  deliveryMins: string;
  imageUrl: string;
  variants: ProductVariant[];
  subcategoryId: string;
  inStock: boolean;
  hasPriceDrop?: boolean;
}

export interface SubcategoryItem {
  id: string;
  name: string;
  imageUrl: string;
}

export const SUBCATEGORIES_DATA: SubcategoryItem[] = [
  {
    id: 'sub-all',
    name: 'Fresh Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100',
  },
  {
    id: 'sub-leafy',
    name: 'Leafy and Seasoning',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=100',
  },
  {
    id: 'sub-exotic',
    name: 'Exotic Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=100',
  },
  {
    id: 'sub-pooja',
    name: 'Pooja & Festive',
    imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=100',
  },
  {
    id: 'sub-organic',
    name: 'Certified Organics',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=100',
  },
  {
    id: 'sub-frozen',
    name: 'Frozen Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100',
  },
];

export const LISTING_PRODUCTS: ListingProduct[] = [
  {
    id: 'lp-1',
    name: 'Desi Hybrid Red Tomato',
    isVeg: true,
    isAd: true,
    isPriceForYou: true,
    deliveryMins: '10 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=250',
    subcategoryId: 'sub-all',
    inStock: true,
    hasPriceDrop: true,
    variants: [
      { id: 'v1-1', label: '500 g', price: 22, mrp: 28, unitPriceText: '₹4.4/100 g' },
      { id: 'v1-2', label: '1 kg', price: 40, mrp: 55, unitPriceText: '₹4.0/100 g' },
    ],
  },
  {
    id: 'lp-2',
    name: 'Indore Jyoti Fresh Potato',
    isVeg: true,
    isAd: false,
    isPriceForYou: false,
    deliveryMins: '10 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=250',
    subcategoryId: 'sub-all',
    inStock: true,
    hasPriceDrop: true,
    variants: [
      { id: 'v2-1', label: '1 kg', price: 28, mrp: 35, unitPriceText: '₹2.8/100 g' },
      { id: 'v2-2', label: '2 kg', price: 52, mrp: 70, unitPriceText: '₹2.6/100 g' },
    ],
  },
  {
    id: 'lp-3',
    name: 'Nashik Red Onion (Pyaaz)',
    isVeg: true,
    isAd: false,
    isPriceForYou: true,
    deliveryMins: '10 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=250',
    subcategoryId: 'sub-all',
    inStock: true,
    hasPriceDrop: false,
    variants: [
      { id: 'v3-1', label: '1 kg', price: 34, mrp: 40, unitPriceText: '₹3.4/100 g' },
      { id: 'v3-2', label: '5 kg', price: 160, mrp: 200, unitPriceText: '₹3.2/100 g' },
    ],
  },
  {
    id: 'lp-4',
    name: 'Fresh Green Capsicum (Shimla)',
    isVeg: true,
    isAd: false,
    isPriceForYou: false,
    deliveryMins: '10 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=250',
    subcategoryId: 'sub-all',
    inStock: true,
    hasPriceDrop: true,
    variants: [
      { id: 'v4-1', label: '250 g', price: 18, mrp: 25, unitPriceText: '₹7.2/100 g' },
      { id: 'v4-2', label: '500 g', price: 34, mrp: 48, unitPriceText: '₹6.8/100 g' },
    ],
  },
  {
    id: 'lp-5',
    name: 'Fresh Palak (Spinach)',
    isVeg: true,
    isAd: false,
    isPriceForYou: true,
    deliveryMins: '10 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=250',
    subcategoryId: 'sub-leafy',
    inStock: true,
    hasPriceDrop: false,
    variants: [
      { id: 'v5-1', label: '250 g', price: 15, mrp: 22, unitPriceText: '₹6.0/100 g' },
      { id: 'v5-2', label: '500 g', price: 28, mrp: 40, unitPriceText: '₹5.6/100 g' },
    ],
  },
  {
    id: 'lp-6',
    name: 'Fresh Coriander Bunch (Dhaniya)',
    isVeg: true,
    isAd: false,
    isPriceForYou: false,
    deliveryMins: '10 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1588879462520-2f3b92eb1888?w=250',
    subcategoryId: 'sub-leafy',
    inStock: true,
    hasPriceDrop: true,
    variants: [
      { id: 'v6-1', label: '100 g', price: 10, mrp: 15, unitPriceText: '₹10/100 g' },
      { id: 'v6-2', label: '250 g', price: 22, mrp: 30, unitPriceText: '₹8.8/100 g' },
    ],
  },
  {
    id: 'lp-7',
    name: 'Broccoli Exotic Florets',
    isVeg: true,
    isAd: true,
    isPriceForYou: true,
    deliveryMins: '10 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=250',
    subcategoryId: 'sub-exotic',
    inStock: true,
    hasPriceDrop: false,
    variants: [
      { id: 'v7-1', label: '1 pc (350 g)', price: 48, mrp: 65, unitPriceText: '₹13.7/100 g' },
    ],
  },
  {
    id: 'lp-8',
    name: 'Zucchini Green Exotic',
    isVeg: true,
    isAd: false,
    isPriceForYou: false,
    deliveryMins: '10 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=250',
    subcategoryId: 'sub-exotic',
    inStock: true,
    hasPriceDrop: true,
    variants: [
      { id: 'v8-1', label: '500 g', price: 55, mrp: 75, unitPriceText: '₹11/100 g' },
    ],
  },
  {
    id: 'lp-9',
    name: 'Organic Desi Carrot (Gajar)',
    isVeg: true,
    isAd: false,
    isPriceForYou: true,
    deliveryMins: '10 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=250',
    subcategoryId: 'sub-organic',
    inStock: true,
    hasPriceDrop: true,
    variants: [
      { id: 'v9-1', label: '500 g', price: 32, mrp: 45, unitPriceText: '₹6.4/100 g' },
      { id: 'v9-2', label: '1 kg', price: 60, mrp: 85, unitPriceText: '₹6.0/100 g' },
    ],
  },
];


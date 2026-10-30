export interface ProductItem {
  id: string;
  name: string;
  quantityLabel: string;
  price: number;
  mrp: number;
  tag?: 'TRENDING' | 'BESTSELLER';
  rating: number;
  ratingCount: number;
  deliveryMins: string;
  imageUrl: string;
  inStock: boolean;
  category: string;
}

export interface CategoryQuickChip {
  id: string;
  label: string;
  icon: string;
  isNew?: boolean;
}

export interface StoreArchItem {
  id: string;
  name: string;
  subtitle: string;
  rating: string;
  distance: string;
  bgColor: string;
  imageUrl: string;
}

export const DUMMY_PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    name: 'Desi Hybrid Tomato',
    quantityLabel: '500 g',
    price: 22,
    mrp: 26,
    tag: 'TRENDING',
    rating: 4.5,
    ratingCount: 124,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300',
    inStock: true,
    category: 'fresh',
  },
  {
    id: 'p2',
    name: 'Nashik Red Onion',
    quantityLabel: '1 kg',
    price: 34,
    mrp: 38,
    tag: 'BESTSELLER',
    rating: 4.8,
    ratingCount: 312,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300',
    inStock: true,
    category: 'fresh',
  },
  {
    id: 'p3',
    name: 'Indore Juicy Lemon',
    quantityLabel: '1 kg',
    price: 28,
    mrp: 32,
    tag: 'BESTSELLER',
    rating: 4.7,
    ratingCount: 88,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1533083475581-8289c3e53616?w=300',
    inStock: true,
    category: 'fresh',
  },
  {
    id: 'p4',
    name: 'Toned Cow Milk',
    quantityLabel: '1 L',
    price: 56,
    mrp: 62,
    tag: 'BESTSELLER',
    rating: 4.9,
    ratingCount: 520,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300',
    inStock: true,
    category: 'dairy',
  },
  {
    id: 'p5',
    name: 'Fresh Malai Paneer',
    quantityLabel: '500 g',
    price: 280,
    mrp: 310,
    tag: 'BESTSELLER',
    rating: 4.8,
    ratingCount: 240,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300',
    inStock: true,
    category: 'dairy',
  },
  {
    id: 'p6',
    name: 'Desi Jyoti Potato',
    quantityLabel: '1 kg',
    price: 64,
    mrp: 70,
    tag: 'BESTSELLER',
    rating: 4.6,
    ratingCount: 190,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300',
    inStock: true,
    category: 'fresh',
  },
  {
    id: 'p7',
    name: 'Fresh Cream Dahi',
    quantityLabel: '250 g',
    price: 90,
    mrp: 100,
    tag: 'TRENDING',
    rating: 4.7,
    ratingCount: 95,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300',
    inStock: true,
    category: 'dairy',
  },
  {
    id: 'p8',
    name: 'Desi Pure Cow Ghee',
    quantityLabel: '200 g',
    price: 120,
    mrp: 135,
    tag: 'BESTSELLER',
    rating: 4.9,
    ratingCount: 340,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300',
    inStock: true,
    category: 'dairy',
  },
  {
    id: 'p9',
    name: 'Country Fresh Farm Eggs',
    quantityLabel: '6 pcs',
    price: 48,
    mrp: 54,
    tag: 'TRENDING',
    rating: 4.8,
    ratingCount: 420,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=300',
    inStock: true,
    category: 'dairy',
  },
];

export const CATEGORY_QUICK_CHIPS: CategoryQuickChip[] = [
  { id: 'switch', label: 'All', icon: 'apps-outline' },
  { id: 'fresh', label: 'Fresh Sabzi', icon: 'nutrition-outline', isNew: true },
  { id: 'dairy', label: 'Dairy & Eggs', icon: 'water-outline' },
  { id: 'meat', label: 'Fresh Meat', icon: 'restaurant-outline' },
  { id: 'fruits', label: 'Mandi Fruits', icon: 'leaf-outline' },
  { id: 'staples', label: 'Kitchen Atta', icon: 'basket-outline' },
  { id: 'kids', label: 'Kids Snacks', icon: 'happy-outline' },
];

export const FESTIVE_TILES = [
  { id: 'f1', title: 'Sabzi Deals', offer: 'STARTS AT ₹10', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200' },
  { id: 'f2', title: 'Dairy Corner', offer: 'UP TO 20% OFF', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200' },
  { id: 'f3', title: 'Items at ₹1', offer: 'HOT FLASH DEAL', img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200' },
  { id: 'f4', title: 'Fresh Fruits', offer: 'LOWEST PRICES', img: 'https://images.unsplash.com/photo-1533083475581-8289c3e53616?w=200' },
  { id: 'f5', title: 'Farm Eggs', offer: 'FLAT ₹15 OFF', img: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=200' },
  { id: 'f6', title: 'Fresh Cuts', offer: 'MANDI FRESH', img: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200' },
];

export const FRESH_ITEMS_GRID = [
  { id: 'fg1', name: 'Fresh Vegetables', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200' },
  { id: 'fg2', name: 'Fresh Fruits', img: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=200' },
  { id: 'fg3', name: 'Dairy Bread & Eggs', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200' },
  { id: 'fg4', name: 'Meat & Seafood', img: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200' },
];

export const GROCERY_KITCHEN_GRID = [
  { id: 'gk1', name: 'Atta Rice & Dal', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200' },
  { id: 'gk2', name: 'Pure Masalas', img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200' },
  { id: 'gk3', name: 'Oils & Ghee', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200' },
  { id: 'gk4', name: 'Cereals & Breakfast', img: 'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?w=200' },
];

export const STORES_ARCH: StoreArchItem[] = [
  {
    id: 's1',
    name: 'Sharma Fresh Sabzi',
    subtitle: 'Mandi Direct Produce',
    rating: '4.8 ★',
    distance: '450m',
    bgColor: '#FFF0CC',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
  },
  {
    id: 's2',
    name: 'Vrindavan Dairy Store',
    subtitle: 'Cow Milk, Paneer & Ghee',
    rating: '4.9 ★',
    distance: '600m',
    bgColor: '#D8F1E4',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300',
  },
  {
    id: 's3',
    name: 'Al-Kareem Fresh Meat',
    subtitle: 'Clean Cut Chicken & Mutton',
    rating: '4.7 ★',
    distance: '850m',
    bgColor: '#FFE0DD',
    imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300',
  },
];

export const BRAND_FAVOURITES = [
  { id: 'b1', name: 'Amul', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Amul_official_logo.svg/300px-Amul_official_logo.svg.png' },
  { id: 'b2', name: 'Aashirvaad', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Aashirvaad_logo.png/300px-Aashirvaad_logo.png' },
  { id: 'b3', name: 'Mother Dairy', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/Mother_Dairy_logo.svg/300px-Mother_Dairy_logo.svg.png' },
  { id: 'b4', name: 'Fortune', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Fortune_Foods_Logo.png/300px-Fortune_Foods_Logo.png' },
  { id: 'b5', name: 'Tata Sampann', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/300px-Tata_logo.svg.png' },
];


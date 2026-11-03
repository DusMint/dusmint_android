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
  vendorId?: string;
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
    id: '3fcdaac8-6a4c-43f5-9c4a-338c6fd55218',
    name: 'Desi Hybrid Tomato',
    quantityLabel: '1 kg',
    price: 28,
    mrp: 35,
    tag: 'TRENDING',
    rating: 4.8,
    ratingCount: 142,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300',
    inStock: true,
    category: 'fresh',
    vendorId: '65e4b35d-8e41-4652-b385-52434c62d977',
  },
  {
    id: 'a84df0e0-48af-45ef-ba73-105df70158a1',
    name: 'Indore Jyoti Potato',
    quantityLabel: '1 kg',
    price: 25,
    mrp: 30,
    tag: 'BESTSELLER',
    rating: 4.9,
    ratingCount: 310,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300',
    inStock: true,
    category: 'fresh',
    vendorId: '65e4b35d-8e41-4652-b385-52434c62d977',
  },
  {
    id: '1a02146a-6701-42e1-8931-235aa6fab415',
    name: 'Aashirvaad Shudh Chakki Atta',
    quantityLabel: '5 kg',
    price: 245,
    mrp: 275,
    tag: 'BESTSELLER',
    rating: 4.9,
    ratingCount: 450,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
    inStock: true,
    category: 'groceries',
    vendorId: '73eafe98-a76d-4b06-82d4-1c8d1e3b8504',
  },
  {
    id: 'nashik-onion-uuid',
    name: 'Nashik Red Onion',
    quantityLabel: '1 kg',
    price: 34,
    mrp: 42,
    tag: 'BESTSELLER',
    rating: 4.8,
    ratingCount: 220,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300',
    inStock: true,
    category: 'fresh',
    vendorId: '65e4b35d-8e41-4652-b385-52434c62d977',
  },
  {
    id: 'green-palak-uuid',
    name: 'Fresh Green Palak',
    quantityLabel: '250 g',
    price: 15,
    mrp: 20,
    tag: 'TRENDING',
    rating: 4.7,
    ratingCount: 95,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300',
    inStock: true,
    category: 'fresh',
    vendorId: '65e4b35d-8e41-4652-b385-52434c62d977',
  },
  {
    id: 'amul-milk-uuid',
    name: 'Amul Taaza Toned Milk',
    quantityLabel: '500 ml',
    price: 27,
    mrp: 27,
    tag: 'BESTSELLER',
    rating: 4.9,
    ratingCount: 512,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300',
    inStock: true,
    category: 'dairy',
    vendorId: '73eafe98-a76d-4b06-82d4-1c8d1e3b8504',
  },
  {
    id: 'amul-butter-uuid',
    name: 'Amul Salted Butter',
    quantityLabel: '100 g',
    price: 58,
    mrp: 60,
    rating: 4.8,
    ratingCount: 180,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300',
    inStock: true,
    category: 'dairy',
    vendorId: '73eafe98-a76d-4b06-82d4-1c8d1e3b8504',
  },
  {
    id: 'malai-paneer-uuid',
    name: 'Fresh Malai Paneer',
    quantityLabel: '200 g',
    price: 85,
    mrp: 95,
    tag: 'TRENDING',
    rating: 4.8,
    ratingCount: 140,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300',
    inStock: true,
    category: 'dairy',
    vendorId: '73eafe98-a76d-4b06-82d4-1c8d1e3b8504',
  },
  {
    id: 'farm-eggs-uuid',
    name: 'Farm Fresh White Eggs',
    quantityLabel: '6 pcs',
    price: 42,
    mrp: 50,
    tag: 'BESTSELLER',
    rating: 4.7,
    ratingCount: 290,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300',
    inStock: true,
    category: 'dairy',
    vendorId: '73eafe98-a76d-4b06-82d4-1c8d1e3b8504',
  },
  {
    id: 'fortune-oil-uuid',
    name: 'Fortune Sunlite Sunflower Oil',
    quantityLabel: '1 L',
    price: 145,
    mrp: 165,
    tag: 'BESTSELLER',
    rating: 4.8,
    ratingCount: 340,
    deliveryMins: '9 MINS',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300',
    inStock: true,
    category: 'groceries',
    vendorId: '73eafe98-a76d-4b06-82d4-1c8d1e3b8504',
  },
];

export const CATEGORY_QUICK_CHIPS: CategoryQuickChip[] = [
  { id: 'c1', label: 'Vegetables', icon: 'leaf-outline' },
  { id: 'c2', label: 'Fruits', icon: 'nutrition-outline' },
  { id: 'c3', label: 'Dairy & Eggs', icon: 'water-outline' },
  { id: 'c4', label: 'Atta & Rice', icon: 'cube-outline' },
  { id: 'c5', label: 'Oil & Ghee', icon: 'flask-outline' },
  { id: 'c6', label: 'Masalas & Spices', icon: 'flame-outline' },
];

export const STORE_ARCH_DATA: StoreArchItem[] = [
  {
    id: 's1',
    name: 'Sharma Kirana Store',
    subtitle: 'Daily Staples & Dairy',
    rating: '4.9 ★',
    distance: '350 m • 9 mins',
    bgColor: '#FEF3C7',
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200',
  },
  {
    id: 's2',
    name: 'Mandi Fresh Sabzi',
    subtitle: 'Farm Fresh Produce',
    rating: '4.8 ★',
    distance: '400 m • 9 mins',
    bgColor: '#DCFCE7',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
  },
];

export const FRESH_ITEMS_GRID = [
  { id: 'fg1', name: 'Fresh Vegetables', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200' },
  { id: 'fg2', name: 'Fresh Fruits', img: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200', imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200' },
  { id: 'fg3', name: 'Dairy & Eggs', img: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=200', imageUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=200' },
  { id: 'fg4', name: 'Herbs & Seasonings', img: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=200', imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=200' },
];

export const GROCERY_KITCHEN_GRID = [
  { id: 'gk1', name: 'Atta, Flours & Sooji', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200' },
  { id: 'gk2', name: 'Rice & Rice Products', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200' },
  { id: 'gk3', name: 'Edible Oils & Ghee', img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200', imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200' },
  { id: 'gk4', name: 'Dals & Pulses', img: 'https://images.unsplash.com/photo-1585992227787-8df218c50eb8?w=200', imageUrl: 'https://images.unsplash.com/photo-1585992227787-8df218c50eb8?w=200' },
];

export interface FestiveTile {
  id: string;
  title: string;
  img: string;
  offer: string;
}

export const FESTIVE_TILES: FestiveTile[] = [
  {
    id: 'ft1',
    title: 'Pooja & Hawan Samagri',
    img: 'https://images.unsplash.com/photo-1609137144822-5407d57f5c2f?w=150',
    offer: 'UP TO 40% OFF',
  },
  {
    id: 'ft2',
    title: 'Mithai & Dry Fruits',
    img: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=150',
    offer: 'MIN 25% OFF',
  },
  {
    id: 'ft3',
    title: 'Ghee, Oils & Diyas',
    img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150',
    offer: 'FLAT ₹50 OFF',
  },
  {
    id: 'ft4',
    title: 'Fresh Flowers & Mala',
    img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=150',
    offer: 'MANDI FRESH',
  },
];

export interface BrandFavourite {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  searchQuery: string;
}

export const BRAND_FAVOURITES: BrandFavourite[] = [
  {
    id: 'b-amul',
    name: 'Amul',
    tagline: 'Butter & Milk',
    logo: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200',
    searchQuery: 'Amul',
  },
  {
    id: 'b-aashirvaad',
    name: 'Aashirvaad',
    tagline: 'Chakki Atta',
    logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200',
    searchQuery: 'Atta',
  },
  {
    id: 'b-fortune',
    name: 'Fortune',
    tagline: 'Oils & Ghee',
    logo: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200',
    searchQuery: 'Fortune',
  },
  {
    id: 'b-tata',
    name: 'Tata Sampann',
    tagline: 'Dals & Spices',
    logo: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200',
    searchQuery: 'Tata',
  },
  {
    id: 'b-haldiram',
    name: 'Haldiram',
    tagline: 'Namkeen & Sweets',
    logo: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=200',
    searchQuery: 'Namkeen',
  },
  {
    id: 'b-paneer',
    name: 'Malai Paneer',
    tagline: 'Daily Fresh',
    logo: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200',
    searchQuery: 'Paneer',
  },
];

export interface PromoBanner {
  id: string;
  subTitle: string;
  headline: string;
  body: string;
  btnText: string;
  bgColor: string;
  subColor: string;
  btnTextColor: string;
  categoryTitle: string;
  categoryId?: string;
}

export const PROMO_BANNERS: PromoBanner[] = [
  {
    id: 'pb-1',
    subTitle: 'EXCLUSIVE OFFERS',
    headline: 'Up to 50% Off on Staples',
    body: 'Aashirvaad, Tata, Fortune & more',
    btnText: 'SHOP NOW',
    bgColor: '#3A2A1A',
    subColor: '#FFB36B',
    btnTextColor: '#3A2A1A',
    categoryTitle: 'Grocery & Kitchen',
    categoryId: 'groceries',
  },
  {
    id: 'pb-2',
    subTitle: 'DIRECT FROM MANDI',
    headline: 'Fresh Vegetables at Mandi Rates',
    body: 'Handpicked daily • Zero middlemen',
    btnText: 'EXPLORE FRESH',
    bgColor: '#0F3827',
    subColor: '#6EE7B7',
    btnTextColor: '#0F3827',
    categoryTitle: 'Fresh Store',
    categoryId: 'vegetables',
  },
  {
    id: 'pb-3',
    subTitle: 'MORNING CHILLED DELIVERY',
    headline: 'Farm Cow Milk & Malai Paneer',
    body: '100% pure, unadulterated & cold-chain',
    btnText: 'ORDER DAIRY',
    bgColor: '#172B5E',
    subColor: '#93C5FD',
    btnTextColor: '#172B5E',
    categoryTitle: 'Dairy & Eggs',
    categoryId: 'dairy',
  },
  {
    id: 'pb-4',
    subTitle: 'FESTIVAL SPECIAL',
    headline: 'Pooja Samagri & Sweets Deals',
    body: 'Authentic festive offerings for your family',
    btnText: 'VIEW DEALS',
    bgColor: '#6B1123',
    subColor: '#FCA5A5',
    btnTextColor: '#6B1123',
    categoryTitle: 'Festive Deals',
    categoryId: 'festive',
  },
  {
    id: 'pb-5',
    subTitle: 'SUPER SAVINGS',
    headline: 'Free Delivery on All Orders',
    body: 'Valid across your neighbourhood cluster',
    btnText: 'CLAIM NOW',
    bgColor: '#1F2937',
    subColor: '#FCD34D',
    btnTextColor: '#1F2937',
    categoryTitle: 'Super Saver Deals',
    categoryId: 'offers',
  },
];

export const STORES_ARCH: StoreArchItem[] = STORE_ARCH_DATA;


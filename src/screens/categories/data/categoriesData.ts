export interface StoreArchItem {
  id: string;
  name: string;
  subtitle: string;
  rating: string;
  distance: string;
  imageUrl: string;
  bgColor: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  imageUrl: string;
  badge?: string;
}

export interface CategorySectionModel {
  id: string;
  title: string;
  items: CategoryItem[];
}

export const STORE_ARCH_DATA: StoreArchItem[] = [
  {
    id: 's1',
    name: 'Sharma Kirana Store',
    subtitle: 'Daily Staples & Flours',
    rating: '4.8',
    distance: '350 m • 12 mins',
    bgColor: '#FEF3C7',
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300',
  },
  {
    id: 's2',
    name: 'Mandi Fresh Sabzi',
    subtitle: 'Farm Fresh Produce',
    rating: '4.9',
    distance: '300 m • 9 mins',
    bgColor: '#DCFCE7',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
  },
  {
    id: 's3',
    name: 'Indore Dugdhadhari Dairy',
    subtitle: 'Pure Milk, Paneer & Ghee',
    rating: '4.7',
    distance: '900 m • 15 mins',
    bgColor: '#E0F2FE',
    imageUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=300',
  },
  {
    id: 's4',
    name: 'Agarwal Sweets & Namkeen',
    subtitle: 'Indori Sev & Fresh Sweets',
    rating: '4.9',
    distance: '1.2 km • 18 mins',
    bgColor: '#FEE2E2',
    imageUrl: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=300',
  },
];

export interface StoreCategoryItem {
  id: string;
  slug: string; // 'groceries' | 'vegetables' | 'dairy' | 'sweets'
  title: string;
  subtitle: string;
  iconName: string;
  bannerUrl: string;
  accentColor: string;
  tag: string;
}

export const STORE_CATEGORIES: StoreCategoryItem[] = [
  {
    id: 'sc-kirana',
    slug: 'groceries',
    title: 'Kirana & Supermarkets',
    subtitle: 'Atta, Rice, Dals, Oils & Daily Staples',
    iconName: 'basket-outline',
    bannerUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500',
    accentColor: '#FFF3E0',
    tag: 'Staples & Essentials',
  },
  {
    id: 'sc-mandi',
    slug: 'vegetables',
    title: 'Fresh Mandi (Sabzi & Fruits)',
    subtitle: 'Direct from Mandi • Farm Fresh Daily',
    iconName: 'leaf-outline',
    bannerUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
    accentColor: '#E8F5E9',
    tag: 'Zero Middlemen',
  },
  {
    id: 'sc-dairy',
    slug: 'dairy',
    title: 'Dairy & Milk Booths',
    subtitle: 'Pure Cow Milk, Malai Dahi & Paneer',
    iconName: 'water-outline',
    bannerUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=500',
    accentColor: '#E1F5FE',
    tag: 'Daily Fresh Milk',
  },
  {
    id: 'sc-sweets',
    slug: 'sweets',
    title: 'Sweets & Indori Namkeen',
    subtitle: 'Ratlami Sev, Sweets, Farsan & Snacks',
    iconName: 'gift-outline',
    bannerUrl: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=500',
    accentColor: '#FCE4EC',
    tag: 'Indori Sev & Mithai',
  },
];

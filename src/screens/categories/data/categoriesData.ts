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

export interface StoreArchItem {
  id: string;
  name: string;
  imageUrl: string;
  bgColor: string;
}

export const STORE_ARCH_DATA: StoreArchItem[] = [
  {
    id: 's1',
    name: 'Sharma Fresh Vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
    bgColor: '#FFF0CC',
  },
  {
    id: 's2',
    name: 'Al-Kareem Meat',
    imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200',
    bgColor: '#FFE0DD',
  },
  {
    id: 's3',
    name: 'Vrindavan Dairy',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200',
    bgColor: '#D8F1E4',
  },
  {
    id: 's4',
    name: 'Fruit Store',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200',
    bgColor: '#E3EEFB',
  },
];

export const CATEGORY_SECTIONS_DATA: CategorySectionModel[] = [
  {
    id: 'sec-fresh',
    title: 'Fresh items',
    items: [
      {
        id: 'fresh-veg',
        name: 'Fresh Vegetables',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200',
      },
      {
        id: 'fresh-fruit',
        name: 'Fresh Fruits',
        imageUrl: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=200',
      },
      {
        id: 'dairy-bread-eggs',
        name: 'Dairy Bread and Eggs',
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200',
      },
      {
        id: 'meat-seafood',
        name: 'Meat and Seafood',
        imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200',
      },
    ],
  },
  {
    id: 'sec-grocery',
    title: 'Grocery & Kitchen',
    items: [
      {
        id: 'atta-dal',
        name: 'Atta Rice and Dal',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200',
      },
      {
        id: 'masalas',
        name: 'Masalas',
        imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200',
      },
      {
        id: 'oils-ghee',
        name: 'Oils and Ghee',
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200',
      },
      {
        id: 'cereals-breakfast',
        name: 'Cereals and Breakfast',
        imageUrl: 'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?w=200',
      },
    ],
  },
  {
    id: 'sec-snacks',
    title: 'Snacks & drinks',
    items: [
      {
        id: 'cold-drinks',
        name: 'Cold Drinks and Juices',
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200',
      },
      {
        id: 'ice-creams',
        name: 'Ice Creams and Frozen Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200',
      },
      {
        id: 'chips-namkeens',
        name: 'Chips and Namkeens',
        imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200',
      },
      {
        id: 'chocolates',
        name: 'Chocolates',
        imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200',
      },
      {
        id: 'biscuits-cakes',
        name: 'Biscuits and Cakes',
        imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200',
      },
      {
        id: 'tea-coffee',
        name: 'Tea Coffee and Milk drinks',
        imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200',
      },
      {
        id: 'sauces-spreads',
        name: 'Sauces and Spreads',
        imageUrl: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=200',
      },
      {
        id: 'sweet-corner',
        name: 'Sweet Corner',
        imageUrl: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=200',
      },
      {
        id: 'noodles-pasta',
        name: 'Noodles Pasta Vermicelli',
        imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=200',
      },
      {
        id: 'frozen-food',
        name: 'Frozen Food',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
      },
      {
        id: 'dry-fruits',
        name: 'Dry Fruits and Seeds Mix',
        imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200',
      },
      {
        id: 'paan-corner',
        name: 'Paan Corner',
        imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200',
      },
    ],
  },
  {
    id: 'sec-beauty',
    title: 'Beauty & Wellness',
    items: [
      {
        id: 'bath-body',
        name: 'Bath and Body',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200',
      },
      {
        id: 'hair-care',
        name: 'Hair Care',
        imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=200',
      },
      {
        id: 'skincare',
        name: 'Skincare',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200',
      },
      {
        id: 'makeup',
        name: 'Makeup',
        imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200',
      },
      {
        id: 'feminine-hygiene',
        name: 'Feminine Hygiene',
        imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200',
      },
      {
        id: 'sexual-wellness',
        name: 'Sexual Wellness',
        imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200',
      },
      {
        id: 'health-pharma',
        name: 'Health and Pharma',
        imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200',
      },
      {
        id: 'baby-care',
        name: 'Baby Care',
        imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200',
      },
    ],
  },
];


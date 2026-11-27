export interface ProfileUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  isEmailVerified?: boolean;
  tolaBalance?: number;
  avatarUrl?: string;
}

export interface QuickActionItem {
  id: string;
  label: string;
  iconName: string;
  route: string;
  badgeText?: string;
}

export interface ProfileOption {
  id: string;
  label: string;
  iconName: string;
  route?: string;
  badgeText?: string;
}

export interface PastOrderItem {
  id: string;
  name: string;
  qty: number;
  pricePaise: number;
}

export interface PastOrder {
  id: string;
  orderNumber: string;
  storeName: string;
  address: string;
  dateTime: string;
  status: 'Delivered' | 'Cancelled' | 'Out for Delivery' | 'Packing';
  itemsSummary: string;
  totalPaise: number;
  items: PastOrderItem[];
}

export const PROFILE_OPTIONS_DATA: ProfileOption[] = [
  {
    id: 'opt-orders',
    label: 'Past Orders',
    iconName: 'receipt-outline',
    route: 'OrdersList',
  },
  {
    id: 'opt-addresses',
    label: 'Saved Addresses',
    iconName: 'location-outline',
    route: 'SelectLocation',
  },
  {
    id: 'opt-payments',
    label: 'Payment Modes',
    iconName: 'card-outline',
    route: 'PaymentModes',
  },
  {
    id: 'opt-refunds',
    label: 'My Refunds',
    iconName: 'cash-outline',
    route: 'Refunds',
  },
  {
    id: 'opt-wallet',
    label: 'DusMint Money',
    iconName: 'wallet-outline',
    badgeText: '₹0',
    route: 'DusMintMoney',
  },
  {
    id: 'opt-wishlist',
    label: 'My Wishlist',
    iconName: 'bookmark-outline',
    route: 'Wishlist',
  },
  {
    id: 'opt-rewards',
    label: 'Partner Rewards',
    iconName: 'gift-outline',
    route: 'PartnerRewards',
  },
  {
    id: 'opt-support',
    label: 'Help & Support',
    iconName: 'headset-outline',
    route: 'HelpSupport',
  },
];

export const DUMMY_PAST_ORDERS: PastOrder[] = [
  {
    id: 'ord-901',
    orderNumber: 'SM-89421',
    storeName: 'Shuddh Mandi',
    address: 'Indore Vijay Nagar, 1st Floor',
    dateTime: 'Today, 11:30 AM',
    status: 'Delivered',
    itemsSummary: 'Desi Hybrid Tomato x1, Nashik Red Onion x2, Fresh Farm Milk x1',
    totalPaise: 24000,
    items: [
      { id: 'item-1', name: 'Desi Hybrid Tomato', qty: 1, pricePaise: 4400 },
      { id: 'item-2', name: 'Nashik Red Onion', qty: 2, pricePaise: 6800 },
      { id: 'item-3', name: 'Fresh Farm Milk', qty: 1, pricePaise: 5600 },
    ],
  },
  {
    id: 'ord-902',
    orderNumber: 'SM-88319',
    storeName: 'Shuddh Mandi',
    address: 'Indore Vijay Nagar, 1st Floor',
    dateTime: '28 Oct 2026, 6:15 PM',
    status: 'Delivered',
    itemsSummary: 'Indore Jyoti Potato x1, Green Coriander x2, Fresh Ginger x1',
    totalPaise: 16500,
    items: [
      { id: 'item-4', name: 'Indore Jyoti Potato', qty: 1, pricePaise: 2800 },
      { id: 'item-5', name: 'Green Coriander', qty: 2, pricePaise: 2000 },
      { id: 'item-6', name: 'Fresh Ginger', qty: 1, pricePaise: 2500 },
    ],
  },
  {
    id: 'ord-903',
    orderNumber: 'SM-87204',
    storeName: 'Shuddh Mandi',
    address: 'Indore Vijay Nagar, 1st Floor',
    dateTime: '24 Oct 2026, 2:40 PM',
    status: 'Cancelled',
    itemsSummary: 'Fresh Palak x2, Fresh Paneer 200g x1',
    totalPaise: 12000,
    items: [
      { id: 'item-7', name: 'Fresh Palak', qty: 2, pricePaise: 3000 },
      { id: 'item-8', name: 'Fresh Paneer 200g', qty: 1, pricePaise: 9000 },
    ],
  },
];


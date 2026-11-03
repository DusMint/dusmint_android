import { create } from 'zustand';

export interface OrderItemPreview {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  quantityLabel?: string;
}

export interface PlacedOrder {
  id: string;
  orderCode: string;
  status: 'placed' | 'confirmed' | 'packing' | 'on_the_way' | 'delivered' | 'cancelled';
  slotName: string;
  createdAt: string; // ISO date string
  items: OrderItemPreview[];
  itemCount: number;
  totalRupees: number;
  deliveryFeeRupees: number;
  deliveryOtp: string;
  deliveryAddress: string;
  paymentModeTitle: string;
  storeName: string;
}

interface OrderState {
  orders: PlacedOrder[];
  addOrder: (order: PlacedOrder) => void;
  updateOrderStatus: (orderId: string, status: PlacedOrder['status']) => void;
  getActiveOrders: () => PlacedOrder[];
  getPastOrders: () => PlacedOrder[];
}

// Initial realistic orders (includes past delivered orders so the screen is never a blank wireframe)
const INITIAL_ORDERS: PlacedOrder[] = [
  {
    id: 'ord-past-1',
    orderCode: 'DM-71932',
    status: 'delivered',
    slotName: 'Morning Slot',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // Yesterday
    items: [
      {
        id: 'p-1',
        name: 'Amul Taaza Fresh Toned Milk',
        price: 27,
        quantity: 2,
        quantityLabel: '500 ml',
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200',
      },
      {
        id: 'p-2',
        name: 'Aashirvaad Shuddh Chakki Atta',
        price: 210,
        quantity: 1,
        quantityLabel: '5 kg',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200',
      },
      {
        id: 'p-3',
        name: 'Fresh Farm Tomatoes (Tamatar)',
        price: 24,
        quantity: 1,
        quantityLabel: '1 kg',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200',
      },
    ],
    itemCount: 4,
    totalRupees: 288,
    deliveryFeeRupees: 0,
    deliveryOtp: '6194',
    deliveryAddress: 'Flat 402, Royal Palms, Scheme 54, Vijay Nagar, Indore',
    paymentModeTitle: 'Google Pay (UPI)',
    storeName: 'Mandi Superstore, Vijay Nagar',
  },
  {
    id: 'ord-past-2',
    orderCode: 'DM-68214',
    status: 'delivered',
    slotName: 'Evening Slot',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), // 3 days ago
    items: [
      {
        id: 'p-4',
        name: 'Tata Salt (Namak)',
        price: 28,
        quantity: 1,
        quantityLabel: '1 kg',
        imageUrl: 'https://images.unsplash.com/photo-1589135233689-d49ad3724039?w=200',
      },
      {
        id: 'p-5',
        name: 'Fortune Sunlite Refined Sunflower Oil',
        price: 135,
        quantity: 1,
        quantityLabel: '1 L',
        imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200',
      },
    ],
    itemCount: 2,
    totalRupees: 163,
    deliveryFeeRupees: 0,
    deliveryOtp: '8921',
    deliveryAddress: 'Flat 402, Royal Palms, Scheme 54, Vijay Nagar, Indore',
    paymentModeTitle: 'PhonePe UPI',
    storeName: 'Sharma Kirana Store, Scheme 54',
  },
];

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: INITIAL_ORDERS,

  addOrder: (newOrder: PlacedOrder) => {
    set((state) => ({
      orders: [newOrder, ...state.orders.filter((o) => o.id !== newOrder.id)],
    }));
  },

  updateOrderStatus: (orderId: string, status: PlacedOrder['status']) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
    }));
  },

  getActiveOrders: () => {
    return get().orders.filter(
      (o) => o.status !== 'delivered' && o.status !== 'cancelled'
    );
  },

  getPastOrders: () => {
    return get().orders.filter(
      (o) => o.status === 'delivered' || o.status === 'cancelled'
    );
  },
}));

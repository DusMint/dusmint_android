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
  vendorId?: string;
}

interface OrderState {
  orders: PlacedOrder[];
  addOrder: (order: PlacedOrder) => void;
  setOrders: (orders: PlacedOrder[]) => void;
  updateOrderStatus: (orderId: string, status: PlacedOrder['status']) => void;
  getActiveOrders: () => PlacedOrder[];
  getPastOrders: () => PlacedOrder[];
}

// Initial orders: Includes active live delivery (from Supabase backend) and past delivered orders
const INITIAL_ORDERS: PlacedOrder[] = [
  {
    id: 'df013182-2185-4c16-aa01-f7e1c779917a',
    orderCode: 'DM-20261102-YPYV',
    status: 'on_the_way',
    slotName: 'Instant 9 Mins',
    createdAt: new Date().toISOString(),
    vendorId: 's2',
    storeName: 'Mandi Fresh Sabzi & Fruits, Subzi Mandi',
    items: [
      {
        id: 'it-1',
        name: 'Fresh Desi Tomato (Tamatar)',
        price: 35,
        quantity: 1,
        quantityLabel: '1 kg',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200',
      },
      {
        id: 'it-2',
        name: 'Fresh Green Palak',
        price: 15,
        quantity: 2,
        quantityLabel: '250 g',
        imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200',
      },
    ],
    itemCount: 3,
    totalRupees: 65,
    deliveryFeeRupees: 0,
    deliveryOtp: '7823',
    deliveryAddress: 'Flat 402, Royal Palms, Scheme 54, Vijay Nagar, Indore',
    paymentModeTitle: 'Online UPI',
  },
  {
    id: 'ord-past-1',
    orderCode: 'DM-71932',
    status: 'delivered',
    slotName: 'Morning Slot',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // Yesterday
    vendorId: 's3',
    storeName: 'Indore Dugdhadhari Dairy, Dairy Circle',
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
        name: 'Fresh Malai Paneer',
        price: 95,
        quantity: 1,
        quantityLabel: '250 g',
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200',
      },
    ],
    itemCount: 3,
    totalRupees: 149,
    deliveryFeeRupees: 0,
    deliveryOtp: '6194',
    deliveryAddress: 'Flat 402, Royal Palms, Scheme 54, Vijay Nagar, Indore',
    paymentModeTitle: 'Google Pay (UPI)',
  },
  {
    id: 'ord-past-2',
    orderCode: 'DM-68214',
    status: 'delivered',
    slotName: 'Evening Slot',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), // 3 days ago
    vendorId: 's1',
    storeName: 'Sharma Kirana Store, Main Market',
    items: [
      {
        id: 'p-4',
        name: 'Aashirvaad Shudh Chakki Atta',
        price: 210,
        quantity: 1,
        quantityLabel: '5 kg',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200',
      },
      {
        id: 'p-5',
        name: 'Fortune Sunlite Refined Sunflower Oil',
        price: 145,
        quantity: 1,
        quantityLabel: '1 L',
        imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200',
      },
    ],
    itemCount: 2,
    totalRupees: 355,
    deliveryFeeRupees: 0,
    deliveryOtp: '8921',
    deliveryAddress: 'Flat 402, Royal Palms, Scheme 54, Vijay Nagar, Indore',
    paymentModeTitle: 'PhonePe UPI',
  },
];

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: INITIAL_ORDERS,

  addOrder: (newOrder: PlacedOrder) => {
    set((state) => ({
      orders: [newOrder, ...state.orders.filter((o) => o.id !== newOrder.id && o.orderCode !== newOrder.orderCode)],
    }));
  },

  setOrders: (orders: PlacedOrder[]) => {
    set({ orders });
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

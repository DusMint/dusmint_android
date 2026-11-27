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
const INITIAL_ORDERS: PlacedOrder[] = [];

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

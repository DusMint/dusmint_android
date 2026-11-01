import { ProductItem } from '../../home/data/homeData';

export interface BillSummary {
  itemTotalPaise: number;
  itemMrpPaise: number;
  savingsPaise: number;
  handlingFeePaise: number;
  smallCartFeePaise: number;
  deliveryFeePaise: number;
  tipPaise: number;
  couponDiscountPaise: number;
  grandTotalPaise: number;
  freeDeliveryThresholdPaise: number;
  amountNeededForFreeDeliveryPaise: number;
  isFreeDelivery: boolean;
}

export interface ReceiverDetails {
  name: string;
  phone: string;
}

export const DID_YOU_FORGET_TABS = [
  'Did you forget?',
  'Deals upto 40% off',
  'Fresh picks',
];

export const FORGET_PRODUCTS: Record<string, ProductItem[]> = {
  'Did you forget?': [
    {
      id: 'fg-1',
      name: 'Fresh Green Coriander (Dhaniya)',
      price: 10,
      mrp: 15,
      quantityLabel: '100 g',
      rating: 4.8,
      ratingCount: 520,
      deliveryMins: '10 MINS',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200',
      tag: 'BESTSELLER',
      category: 'fresh',
      inStock: true,
    },
    {
      id: 'fg-2',
      name: 'Fresh Green Chillies (Hari Mirch)',
      price: 12,
      mrp: 18,
      quantityLabel: '100 g',
      rating: 4.7,
      ratingCount: 410,
      deliveryMins: '10 MINS',
      imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=200',
      category: 'fresh',
      inStock: true,
    },
    {
      id: 'fg-3',
      name: 'Fresh Juicy Lemon (Nimbu)',
      price: 20,
      mrp: 28,
      quantityLabel: '4 pcs',
      rating: 4.9,
      ratingCount: 680,
      deliveryMins: '10 MINS',
      imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200',
      tag: 'BESTSELLER',
      category: 'fresh',
      inStock: true,
    },
    {
      id: 'fg-4',
      name: 'Fresh Curry Leaves (Kadi Patta)',
      price: 8,
      mrp: 12,
      quantityLabel: '50 g',
      rating: 4.6,
      ratingCount: 300,
      deliveryMins: '10 MINS',
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200',
      category: 'fresh',
      inStock: true,
    },
  ],
  'Deals upto 40% off': [
    {
      id: 'fg-5',
      name: 'Desi Hybrid Red Tomato',
      price: 22,
      mrp: 35,
      quantityLabel: '500 g',
      rating: 4.8,
      ratingCount: 1200,
      deliveryMins: '10 MINS',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200',
      tag: 'BESTSELLER',
      category: 'fresh',
      inStock: true,
    },
    {
      id: 'fg-6',
      name: 'Nashik Red Onion (Pyaaz)',
      price: 34,
      mrp: 50,
      quantityLabel: '1 kg',
      rating: 4.7,
      ratingCount: 980,
      deliveryMins: '10 MINS',
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200',
      category: 'fresh',
      inStock: true,
    },
  ],
  'Fresh picks': [
    {
      id: 'fg-7',
      name: 'Fresh Malai Paneer',
      price: 90,
      mrp: 110,
      quantityLabel: '200 g',
      rating: 4.9,
      ratingCount: 840,
      deliveryMins: '10 MINS',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200',
      tag: 'BESTSELLER',
      category: 'dairy',
      inStock: true,
    },
  ],
};

export function calculateBill(
  itemTotalPaise: number,
  tipPaise: number = 0,
  couponDiscountPaise: number = 0
): BillSummary {
  // Approximate MRP: 25% higher than itemTotal
  const itemMrpPaise = Math.round(itemTotalPaise * 1.25);
  const savingsPaise = Math.max(0, itemMrpPaise - itemTotalPaise + couponDiscountPaise);

  const freeDeliveryThresholdPaise = 9900; // ₹99
  const isFreeDelivery = itemTotalPaise >= freeDeliveryThresholdPaise;
  const deliveryFeePaise = isFreeDelivery ? 0 : 2500; // ₹25
  const amountNeededForFreeDeliveryPaise = Math.max(
    0,
    freeDeliveryThresholdPaise - itemTotalPaise
  );

  const handlingFeePaise = itemTotalPaise > 0 ? 500 : 0; // ₹5
  const smallCartFeePaise = itemTotalPaise > 0 && itemTotalPaise < 4900 ? 1500 : 0; // ₹15 if < ₹49

  const grandTotalPaise = Math.max(
    0,
    itemTotalPaise +
      handlingFeePaise +
      smallCartFeePaise +
      deliveryFeePaise +
      tipPaise -
      couponDiscountPaise
  );

  return {
    itemTotalPaise,
    itemMrpPaise,
    savingsPaise,
    handlingFeePaise,
    smallCartFeePaise,
    deliveryFeePaise,
    tipPaise,
    couponDiscountPaise,
    grandTotalPaise,
    freeDeliveryThresholdPaise,
    amountNeededForFreeDeliveryPaise,
    isFreeDelivery,
  };
}


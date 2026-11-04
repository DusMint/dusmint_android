import { NavigatorScreenParams } from '@react-navigation/native';
import { BillSummary } from '../screens/cart/data/cartData';

export type MainTabParamList = {
  HomeTab: undefined;
  BrowseTab: { categoryId?: string } | undefined;
  OrdersTab: undefined;
  AccountTab: undefined;
  // Compatibility aliases
  MenuTab?: undefined;
  OfferTab?: undefined;
  ProfileTab?: undefined;
  MoreTab?: undefined;
  CategoriesTab?: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  OnBoarding: undefined;
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  Otp: { phone: string };
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ItemList: { categoryId?: string; vendorId?: string; title: string };
  ProductDetail: { productId: string; initialVariantId?: string };
  VendorShop: { vendorId: string };
  Search: undefined;
  Cart: undefined;
  Wishlist: undefined;
  SlotAndAddress?: {
    bill?: BillSummary;
    grandTotalPaise?: number;
  };
  SelectLocation?: { returnSelected?: boolean };
  ConfirmLocationMap?: { initialAddress?: string; initialLocality?: string };
  LocationDetails: {
    locality: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
  };
  Payment: { orderId?: string };
  OrderSuccess: { orderId: string; orderCode: string };
  OrderDetail: { orderId: string };
  OrderTracking: {
    orderId: string;
    orderCode?: string;
    status?: string;
    deliveredAt?: string;
    items?: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      imageUrl?: string;
      quantityLabel?: string;
    }[];
    totalRupees?: number;
    deliveryAddress?: string;
    paymentModeTitle?: string;
  };
  ReportClaim: { orderId: string; orderItemId?: string };
  SavedAddresses: undefined;
  HelpSupport: undefined;
  Settings: undefined;
};

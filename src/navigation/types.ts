import { NavigatorScreenParams } from '@react-navigation/native';
import { BillSummary } from '../screens/cart/data/cartData';
import { VendorShop } from '../api-client/types';

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
  Login: { canGoBack?: boolean; fromModal?: boolean } | undefined;
  SignUp: undefined;
  UserOnboarding: undefined;
  Otp: { phone: string; autoVerifyOtp?: string };
  Profile: undefined;
  OrdersList: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ItemList: { categoryId?: string; vendorId?: string; title: string };
  ProductDetail: { productId: string; initialVariantId?: string; vendorId?: string };
  VendorShop: { vendorId: string; shop?: VendorShop };
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
    storeName?: string;
    vendorId?: string;
  };
  ReportClaim: { orderId: string; orderItemId?: string };
  SavedAddresses: undefined;
  HelpSupport: undefined;
  Settings: undefined;
};

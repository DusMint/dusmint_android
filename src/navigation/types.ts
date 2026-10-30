import { NavigatorScreenParams } from '@react-navigation/native';

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
  VendorShop: { vendorId: string };
  Search: undefined;
  Cart: undefined;
  SlotAndAddress: undefined;
  Payment: { orderId?: string };
  OrderSuccess: { orderId: string; orderCode: string };
  OrderDetail: { orderId: string };
  OrderTracking: { orderId: string };
  ReportClaim: { orderId: string; orderItemId?: string };
  SavedAddresses: undefined;
  HelpSupport: undefined;
  Settings: undefined;
};

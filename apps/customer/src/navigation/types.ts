import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  HomeTab: undefined;
  CategoriesTab: undefined;
  OrdersTab: undefined;
  AccountTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  LanguageSelect: undefined;
  Login: undefined;
  Otp: { phone: string };
  LocationPicker: undefined;
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

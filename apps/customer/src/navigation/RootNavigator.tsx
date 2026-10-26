import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { LanguageSelectScreen } from '../screens/onboarding/LanguageSelectScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OtpScreen } from '../screens/auth/OtpScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { ItemListScreen } from '../screens/items/ItemListScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { SlotAndAddressScreen } from '../screens/checkout/SlotAndAddressScreen';
import { OrderTrackingScreen } from '../screens/orders/OrderTrackingScreen';
import { ReportClaimScreen } from '../screens/orders/ReportClaimScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Onboarding & Auth */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />

      {/* Main App Tabs */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />

      {/* Discovery & Items */}
      <Stack.Screen name="ItemList" component={ItemListScreen} />

      {/* Cart & Checkout */}
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="SlotAndAddress" component={SlotAndAddressScreen} />

      {/* Orders & Tracking */}
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="ReportClaim" component={ReportClaimScreen} />
    </Stack.Navigator>
  );
};

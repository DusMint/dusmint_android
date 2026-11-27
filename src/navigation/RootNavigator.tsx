import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { OnBoardingScreen } from '../screens/onboarding/OnBoardingScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { UserOnboardingScreen } from '../screens/auth/UserOnboardingScreen';
import { OtpScreen } from '../screens/auth/OtpScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { ItemListScreen } from '../screens/items/ItemListScreen';
import { ProductDetailScreen } from '../screens/product_detail/ProductDetailScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { SlotAndAddressScreen } from '../screens/checkout/SlotAndAddressScreen';
import { SelectLocationScreen } from '../screens/location/SelectLocationScreen';
import { ConfirmLocationMapScreen } from '../screens/location/ConfirmLocationMapScreen';
import { LocationDetailsScreen } from '../screens/location/LocationDetailsScreen';
import { OrderTrackingScreen } from '../screens/orders/OrderTrackingScreen';
import { ReportClaimScreen } from '../screens/orders/ReportClaimScreen';
import { WishlistScreen } from '../screens/wishlist/WishlistScreen';
import { ShopDetailScreen } from '../screens/shop/ShopDetailScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { OrdersListScreen } from '../screens/orders/OrdersListScreen';
import { SmartFeedScreen } from '../screens/feed/SmartFeedScreen';
import { PaymentModesScreen } from '../screens/profile/screens/PaymentModesScreen';
import { RefundsScreen } from '../screens/profile/screens/RefundsScreen';
import { DusMintMoneyScreen } from '../screens/profile/screens/DusMintMoneyScreen';
import { PartnerRewardsScreen } from '../screens/profile/screens/PartnerRewardsScreen';
import { HelpSupportScreen } from '../screens/profile/screens/HelpSupportScreen';

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
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ animation: 'fade', animationDuration: 250 }}
      />
      <Stack.Screen name="OnBoarding" component={OnBoardingScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={({ route }: any) => ({
          animation: route?.params?.fromModal ? 'slide_from_bottom' : 'fade',
        })}
      />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="UserOnboarding" component={UserOnboardingScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="OrdersList"
        component={OrdersListScreen}
        options={{ animation: 'slide_from_right' }}
      />

      {/* Main App Tabs */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />

      {/* Search Screen */}
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ animation: 'fade' }}
      />

      {/* Discovery & Items */}
      <Stack.Screen name="ItemList" component={ItemListScreen} />

      {/* Zomato-Style Shop Storefront */}
      <Stack.Screen name="VendorShop" component={ShopDetailScreen} />

      {/* Product Detail Screen (Slide up modal transition) */}
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ animation: 'slide_from_bottom' }}
      />

      {/* Cart & Checkout */}
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="SlotAndAddress" component={SlotAndAddressScreen} />

      {/* Instamart Wishlist Screen */}
      <Stack.Screen name="Wishlist" component={WishlistScreen} />

      {/* Select Location (Address Picker - Slide from right matching Past Orders) */}
      <Stack.Screen
        name="SelectLocation"
        component={SelectLocationScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="SavedAddresses"
        component={SelectLocationScreen}
        options={{ animation: 'slide_from_right' }}
      />

      {/* Instamart Add Address 2-Step Flow */}
      <Stack.Screen
        name="ConfirmLocationMap"
        component={ConfirmLocationMapScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="LocationDetails"
        component={LocationDetailsScreen}
        options={{ animation: 'slide_from_right' }}
      />

      {/* Orders & Tracking */}
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="ReportClaim" component={ReportClaimScreen} />

      {/* Zomato-Style AI Smart Saver Feed & Voice Assistant */}
      <Stack.Screen
        name="SmartFeed"
        component={SmartFeedScreen}
        options={{ animation: 'fade' }}
      />

      {/* Profile Menu Screens */}
      <Stack.Screen
        name="PaymentModes"
        component={PaymentModesScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Refunds"
        component={RefundsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="DusMintMoney"
        component={DusMintMoneyScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="PartnerRewards"
        component={PartnerRewardsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};

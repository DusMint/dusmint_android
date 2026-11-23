import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CategoriesScreen } from '../screens/categories/CategoriesScreen';
import { OrdersListScreen } from '../screens/orders/OrdersListScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { InstamartColors } from '../ui/theme/instamartTheme';
import { ZomatoBottomBar } from '../ui/components/ZomatoBottomBar';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={(props) => <ZomatoBottomBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activePill]}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={focused ? InstamartColors.accentBlue : InstamartColors.inkMuted}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activePill]}>
              <Ionicons
                name={focused ? 'grid' : 'grid-outline'}
                size={22}
                color={focused ? InstamartColors.accentBlue : InstamartColors.inkMuted}
              />
            </View>
          ),
        }}
      />

      {/* Backward Compatibility Hidden Tab */}
      <Tab.Screen
        name="BrowseTab"
        component={CategoriesScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />

      <Tab.Screen
        name="OrdersTab"
        component={OrdersListScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activePill]}>
              <Ionicons
                name={focused ? 'receipt' : 'receipt-outline'}
                size={22}
                color={focused ? InstamartColors.accentBlue : InstamartColors.inkMuted}
              />
              <View style={styles.activeOrderDot} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="AccountTab"
        component={ProfileScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    width: 52,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    backgroundColor: InstamartColors.tagBlueBg,
  },
  activeOrderDot: {
    position: 'absolute',
    top: 3,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: InstamartColors.accentBlue,
  },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CategoriesScreen } from '../screens/categories/CategoriesScreen';
import { OrdersListScreen } from '../screens/orders/OrdersListScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { InstamartColors } from '../ui/theme/instamartTheme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: InstamartColors.accentBlue,
        tabBarInactiveTintColor: InstamartColors.inkMuted,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: InstamartColors.navBg,
          borderTopWidth: 1,
          borderTopColor: InstamartColors.navBorder,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Poppins_600SemiBold',
          fontWeight: '600',
          marginTop: 2,
        },
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
        name="BrowseTab"
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
          tabBarLabel: 'Account',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activePill]}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={focused ? InstamartColors.accentBlue : InstamartColors.inkMuted}
              />
            </View>
          ),
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

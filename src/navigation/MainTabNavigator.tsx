import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CategoriesScreen } from '../screens/categories/CategoriesScreen';
import { OrdersListScreen } from '../screens/orders/OrdersListScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { Colors } from '@dusmint/ui';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.green700,
        tabBarInactiveTintColor: Colors.gray600,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.gray300,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'NotoSans-Medium',
          fontWeight: '500',
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
                color={focused ? Colors.green700 : Colors.gray600}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="BrowseTab"
        component={CategoriesScreen}
        options={{
          tabBarLabel: 'Browse',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconWrapper, focused && styles.activePill]}>
              <Ionicons
                name={focused ? 'grid' : 'grid-outline'}
                size={22}
                color={focused ? Colors.green700 : Colors.gray600}
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
                color={focused ? Colors.green700 : Colors.gray600}
              />
              {/* Order active indicator dot */}
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
                color={focused ? Colors.green700 : Colors.gray600}
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
    width: 56,
    height: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    backgroundColor: Colors.mint100,
  },
  activeOrderDot: {
    position: 'absolute',
    top: 3,
    right: 14,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green700,
  },
});

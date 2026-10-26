import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { MenuView } from '../screens/menu/MenuView';
import { OfferView } from '../screens/offer/OfferView';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { MoreView } from '../screens/more/MoreView';
import { Colors } from '@dusmint/ui';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.placeholder,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EEEEEE',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="MenuTab"
        component={MenuView}
        options={{
          tabBarLabel: 'Menu',
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('../../assets/img/tab_menu.png')}
              style={[
                styles.tabIcon,
                { tintColor: focused ? Colors.primary : Colors.placeholder },
              ]}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tab.Screen
        name="OfferTab"
        component={OfferView}
        options={{
          tabBarLabel: 'Offer',
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('../../assets/img/tab_offer.png')}
              style={[
                styles.tabIcon,
                { tintColor: focused ? Colors.primary : Colors.placeholder },
              ]}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={styles.floatingHomeBtn}
              activeOpacity={0.85}
            >
              <Image
                source={require('../../assets/img/tab_home.png')}
                style={styles.homeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('../../assets/img/tab_profile.png')}
              style={[
                styles.tabIcon,
                { tintColor: focused ? Colors.primary : Colors.placeholder },
              ]}
              resizeMode="contain"
            />
          ),
        }}
      />

      <Tab.Screen
        name="MoreTab"
        component={MoreView}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('../../assets/img/tab_more.png')}
              style={[
                styles.tabIcon,
                { tintColor: focused ? Colors.primary : Colors.placeholder },
              ]}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    width: 20,
    height: 20,
  },
  floatingHomeBtn: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  homeIcon: {
    width: 28,
    height: 28,
    tintColor: '#FFFFFF',
  },
});

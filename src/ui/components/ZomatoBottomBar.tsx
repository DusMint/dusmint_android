import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export const ZomatoBottomBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 375;

  // Active tab index & route name
  const currentRoute = state.routes[state.index]?.name;
  const isHomeActive = currentRoute === 'HomeTab';
  const isOrdersActive = currentRoute === 'OrdersTab';

  // Calculate safe bottom padding above Android 3-button nav or iOS home bar
  const bottomMargin = Math.max(insets.bottom, Platform.OS === 'android' ? 14 : 8) + 6;

  return (
    <View
      style={[
        styles.outerContainer,
        { bottom: bottomMargin },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.barRow}>
        {/* 1. Purple AI Sparkle Button */}
        <TouchableOpacity
          style={[styles.aiButton, isSmallScreen && styles.aiButtonSmall]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('SmartFeed' as any)}
          accessibilityRole="button"
          accessibilityLabel="DusMint AI Smart Saver"
        >
          <Ionicons name="sparkles" size={isSmallScreen ? 20 : 22} color="#FFFFFF" />
        </TouchableOpacity>

        {/* 2. Main White Floating Capsule (Delivery | History) */}
        <View style={styles.capsuleContainer}>
          {/* Delivery Tab */}
          <TouchableOpacity
            style={[
              styles.tabPill,
              isHomeActive && styles.activeTabPill,
              isSmallScreen && styles.tabPillSmall,
            ]}
            activeOpacity={0.85}
            onPress={() => {
              if (!isHomeActive) {
                navigation.navigate('HomeTab');
              }
            }}
          >
            <Ionicons
              name={isHomeActive ? 'home' : 'home-outline'}
              size={17}
              color={isHomeActive ? '#EF4444' : '#6B7280'}
            />
            <Text
              style={[
                styles.tabText,
                isHomeActive ? styles.activeTabText : styles.inactiveTabText,
                isSmallScreen && styles.tabTextSmall,
              ]}
            >
              Delivery
            </Text>
          </TouchableOpacity>

          {/* History Tab */}
          <TouchableOpacity
            style={[
              styles.tabPill,
              isOrdersActive && styles.activeTabPill,
              isSmallScreen && styles.tabPillSmall,
            ]}
            activeOpacity={0.85}
            onPress={() => {
              if (!isOrdersActive) {
                navigation.navigate('OrdersTab');
              }
            }}
          >
            <Ionicons
              name={isOrdersActive ? 'bag-handle' : 'bag-handle-outline'}
              size={17}
              color={isOrdersActive ? '#FFFFFF' : '#374151'}
            />
            <Text
              style={[
                styles.tabText,
                isOrdersActive ? styles.activeTabText : styles.inactiveTabText,
                isSmallScreen && styles.tabTextSmall,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  aiButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  aiButtonSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  capsuleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    gap: 2,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 6,
  },
  tabPillSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  activeTabPill: {
    backgroundColor: '#242731',
  },
  tabText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
  },
  tabTextSmall: {
    fontSize: 12,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  inactiveTabText: {
    color: '#374151',
  },
});

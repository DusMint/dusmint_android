import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Vibration,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useCartStore } from '../../state/useCartStore';

export const CustomVendorTabBar: React.FC<BottomTabBarProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const totalItemsCount = useCartStore((state) => state.getTotalItemsCount());

  // Subtle breathing pulse animation for the live mic indicator
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // If cart sticky bar is active, hide the floating voice pill to avoid overlap
  if (totalItemsCount > 0) {
    return null;
  }

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 10) + 14;

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => {
          Vibration.vibrate(25);
          navigation.navigate('SmartFeed' as any);
        }}
        accessibilityRole="button"
        accessibilityLabel="Voice Order"
        style={[styles.voicePill, { bottom: bottomInset }]}
      >
        <View style={styles.micCircle}>
          <Ionicons name="mic" size={17} color="#047A36" />
        </View>
        <Text style={styles.voicePillText}>Voice Order</Text>
        <Animated.View
          style={[
            styles.livePulseDot,
            { transform: [{ scale: pulseAnim }] },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

// Export alias for MainTabNavigator
export const ZomatoBottomBar = CustomVendorTabBar;

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  voicePill: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#047A36',
    borderRadius: 24,
    paddingVertical: 9,
    paddingHorizontal: 16,
    shadowColor: '#047A36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  micCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  voicePillText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#86EFAC',
    marginLeft: 8,
  },
});

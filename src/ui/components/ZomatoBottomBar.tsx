import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Vibration,
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

  // If cart sticky bar is active, hide the floating voice pill to avoid overlap
  if (totalItemsCount > 0) {
    return null;
  }

  // Shared bottom offset to align perfectly with the Riksho ribbon
  const bottomOffset = Math.max(insets.bottom, Platform.OS === 'android' ? 14 : 12) + 26;

  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => {
          Vibration.vibrate(25);
          navigation.navigate('SmartFeed' as any);
        }}
        accessibilityRole="button"
        accessibilityLabel="Speak Here"
        style={[styles.voicePill, { bottom: bottomOffset }]}
      >
        <View style={styles.micCircle}>
          <Ionicons name="mic" size={16} color="#047A36" />
        </View>
        <Text style={styles.voicePillText}>Speak Here</Text>
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
    justifyContent: 'center',
    backgroundColor: '#047A36',
    height: 40,
    borderRadius: 20,
    paddingLeft: 8,
    paddingRight: 14,
    shadowColor: '#047A36',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  micCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  voicePillText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12.5,
    color: '#FFFFFF',
    letterSpacing: 0.2,
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginBottom: Platform.OS === 'android' ? 1.5 : 0,
  },
});

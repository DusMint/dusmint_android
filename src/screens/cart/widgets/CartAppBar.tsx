import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onBackPress: () => void;
  onClearCart?: () => void;
}

export const CartAppBar: React.FC<Props> = ({
  onBackPress,
  onClearCart,
}) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight + 6 }]}>
      <View style={styles.bar}>
        {/* Left: Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBackPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        {/* Center: Title */}
        <Text style={styles.headerTitle}>Your Cart</Text>

        {/* Right: Clear Cart action if provided */}
        {onClearCart ? (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={onClearCart}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color="#64748B" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
    zIndex: 50,
  },
  bar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16.5,
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  clearBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

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
  showTrustBanner?: boolean;
}

export const CartAppBar: React.FC<Props> = ({
  onBackPress,
  onClearCart,
  showTrustBanner = false,
}) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight + 6 }]}>
      <View style={styles.bar}>
        {/* Left: Back Button + Left-aligned Title */}
        <View style={styles.leftGroup}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBackPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </View>

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
        ) : null}
      </View>

      {/* Attached Trust Banner: flush with top bar, only bottom curved */}
      {showTrustBanner && (
        <View style={styles.trustBanner}>
          <Text style={styles.trustBannerText}>
            No confusing fees. No hidden charges.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    zIndex: 50,
  },
  bar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  clearBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustBanner: {
    backgroundColor: '#047A36',
    width: '100%',
    paddingVertical: 9,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  trustBannerText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12.5,
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
});

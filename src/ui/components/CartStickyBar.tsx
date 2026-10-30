import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Shadows } from '../theme/spacing';

export interface CartStickyBarProps {
  totalItems: number;
  totalPaise: number;
  onPressViewCart: () => void;
  style?: ViewStyle;
}

export const CartStickyBar: React.FC<CartStickyBarProps> = ({
  totalItems,
  totalPaise,
  onPressViewCart,
  style,
}) => {
  if (totalItems <= 0) return null;

  const totalRupees = (totalPaise / 100).toFixed(0);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPressViewCart}
        style={styles.bar}
      >
        <Text style={styles.leftText}>
          {totalItems} {totalItems === 1 ? 'item' : 'items'} · ₹{totalRupees}
        </Text>

        <View style={styles.rightSection}>
          <Text style={styles.viewCartText}>View cart</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    zIndex: 999,
  },
  bar: {
    backgroundColor: Colors.green700,
    height: 56,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    ...Shadows.heavy,
  },
  leftText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.heading,
    fontSize: 14,
    lineHeight: 20,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCartText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.heading,
    fontSize: 14,
    marginRight: 4,
  },
  chevron: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: Typography.fontFamily.headingBold,
    marginTop: -2,
  },
});

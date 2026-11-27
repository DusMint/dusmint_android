import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ViewStyle,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../state/useCartStore';

export interface CartStickyBarProps {
  totalItems?: number;
  totalPaise?: number;
  onPressViewCart: () => void;
  style?: ViewStyle;
}

export const CartStickyBar: React.FC<CartStickyBarProps> = ({
  totalItems: propTotalItems,
  totalPaise: propTotalPaise,
  onPressViewCart,
  style,
}) => {
  const storeItems = useCartStore((s) => s.items);
  const storeTotalItems = useCartStore((s) => s.getTotalItemsCount());
  const storeTotalPaise = useCartStore((s) => s.getTotalPaise());

  const totalItems = propTotalItems ?? storeTotalItems;
  const totalPaise = propTotalPaise ?? storeTotalPaise;
  const totalRupees = Math.round(totalPaise / 100);

  // Joyful Spring Pulse Animation when items are added/modified
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const prevItemsCount = useRef(totalItems);

  useEffect(() => {
    if (totalItems > 0 && totalItems !== prevItemsCount.current) {
      prevItemsCount.current = totalItems;
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.04,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 4,
          tension: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [totalItems, bounceAnim]);

  if (totalItems <= 0) return null;

  // Last 3 items added (most recent first)
  const last3Items = storeItems.slice(-3).reverse();
  const remainingCount = Math.max(0, storeItems.length - 3);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        { transform: [{ scale: bounceAnim }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPressViewCart}
        style={styles.pill}
      >
        {/* Left: Last 3 Item Icons + Total Items & Total Amount */}
        <View style={styles.leftGroup}>
          {/* Overlapping Thumbnails of last 3 items */}
          <View style={styles.thumbnailsStack}>
            {last3Items.map((cartItem, idx) => {
              const imgUri =
                cartItem.item.photoUrl ||
                'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100';

              return (
                <View
                  key={cartItem.item.id || `thumb-${idx}`}
                  style={[
                    styles.thumbnailBox,
                    idx > 0 && { marginLeft: -9 },
                    { zIndex: 10 - idx },
                  ]}
                >
                  <Image
                    source={{ uri: imgUri }}
                    style={styles.thumbnailImg}
                    resizeMode="cover"
                  />
                </View>
              );
            })}

            {remainingCount > 0 && (
              <View style={[styles.moreBadge, { marginLeft: -8, zIndex: 0 }]}>
                <Text style={styles.moreBadgeText}>+{remainingCount}</Text>
              </View>
            )}
          </View>

          {/* Total items and Total Amount */}
          <View style={styles.infoCol}>
            <Text style={styles.itemsCountText}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </Text>
            <Text style={styles.totalAmountText}>₹{totalRupees}</Text>
          </View>
        </View>

        {/* Right: View Cart Action */}
        <View style={styles.viewCartBtn}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    backgroundColor: '#047A36',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 280,
    maxWidth: 330,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#047A36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  thumbnailsStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  moreBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#025224',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBadgeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  infoCol: {
    justifyContent: 'center',
  },
  itemsCountText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: '#DCFCE7',
    lineHeight: 14,
  },
  totalAmountText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  viewCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
  },
  viewCartText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
});

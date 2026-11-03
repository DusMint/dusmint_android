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
          toValue: 1.035,
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

  // Free delivery threshold: ₹99 (9900 paise)
  const thresholdPaise = 9900;
  const isUnlocked = totalPaise >= thresholdPaise;
  const neededPaise = Math.max(0, thresholdPaise - totalPaise);
  const neededRupees = Math.ceil(neededPaise / 100);

  // Progress percentage (min 15% for visual presence up to 100%)
  const progressRatio = Math.min(1, Math.max(0.15, totalPaise / thresholdPaise));
  const progressPercent = `${Math.round(progressRatio * 100)}%`;

  // Up to 3 overlapping product thumbnails to represent multi-item cart
  const visibleItems = storeItems.slice(0, 3);
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
        {/* Top Row: Delivery Status & Price on Left, Stacked Photos & View Cart on Right */}
        <View style={styles.topRow}>
          {/* Left: Free delivery status message + Live Cart Price */}
          <View style={styles.leftMessageContainer}>
            <Text style={styles.messageText} numberOfLines={1}>
              {isUnlocked ? (
                <>
                  You&apos;ve unlocked{' '}
                  <Text style={styles.highlightText}>FREE DELIVERY</Text>
                </>
              ) : (
                <>
                  Add{' '}
                  <Text style={styles.highlightText}>₹{neededRupees} more</Text>{' '}
                  for <Text style={styles.highlightText}>FREE DELIVERY</Text>
                </>
              )}
            </Text>

            <View style={styles.priceMetaRow}>
              <Text style={styles.totalAmountText}>₹{totalRupees}</Text>
              <View style={styles.metaDivider} />
              <Text style={styles.itemCountText}>
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </View>

          {/* Right: Stacked Product Thumbnails + View Cart Action */}
          <View style={styles.rightActionContainer}>
            {/* Overlapping Thumbnails Stack of all added items */}
            <View style={styles.thumbnailsStack}>
              {visibleItems.map((cartItem, idx) => {
                const imgUri =
                  cartItem.item.photoUrl ||
                  'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100';

                return (
                  <View
                    key={cartItem.item.id || `thumb-${idx}`}
                    style={[
                      styles.thumbnailBox,
                      idx > 0 && { marginLeft: -12 },
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

              {/* Extra count badge if more than 3 distinct items */}
              {remainingCount > 0 && (
                <View style={[styles.moreBadge, { marginLeft: -10, zIndex: 0 }]}>
                  <Text style={styles.moreBadgeText}>+{remainingCount}</Text>
                </View>
              )}
            </View>

            {/* View Cart Text + Chevron */}
            <View style={styles.viewCartAction}>
              <Text style={styles.viewCartTitle}>View Cart</Text>
              <Ionicons name="chevron-forward" size={17} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Bottom Progress Bar to Free Delivery */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: progressPercent as any,
                backgroundColor: isUnlocked ? '#48BB78' : '#FFFFFF',
              },
            ]}
          >
            {/* Glowing tip dot */}
            <View
              style={[
                styles.progressGlowDot,
                { backgroundColor: isUnlocked ? '#48BB78' : '#FFFFFF' },
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 6,
    paddingBottom: 4,
    width: '100%',
  },
  pill: {
    backgroundColor: '#0055FF', // Swiggy Instamart signature electric royal blue
    borderRadius: 18,
    paddingTop: 11,
    paddingBottom: 9,
    paddingHorizontal: 14,
    shadowColor: '#003DA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 10,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftMessageContainer: {
    flex: 1,
    paddingRight: 8,
    justifyContent: 'center',
  },
  messageText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
    color: '#D8E6FF',
    lineHeight: 15,
  },
  highlightText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  priceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  totalAmountText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 6,
  },
  itemCountText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#E0EBFF',
  },
  rightActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thumbnailsStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  moreBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0039B3',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  viewCartAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  viewCartTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    marginRight: 2,
    letterSpacing: 0.2,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    marginTop: 8,
    position: 'relative',
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
    position: 'relative',
  },
  progressGlowDot: {
    position: 'absolute',
    right: -3,
    top: -2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 3,
  },
});

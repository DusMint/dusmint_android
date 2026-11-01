import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ViewStyle,
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

  if (totalItems <= 0) return null;

  // Free delivery threshold: ₹99 (9900 paise)
  const thresholdPaise = 9900;
  const isUnlocked = totalPaise >= thresholdPaise;
  const neededPaise = Math.max(0, thresholdPaise - totalPaise);
  const neededRupees = Math.ceil(neededPaise / 100);

  // Progress percentage (10% min for visual presence up to 100%)
  const progressRatio = Math.min(1, Math.max(0.12, totalPaise / thresholdPaise));
  const progressPercent = `${Math.round(progressRatio * 100)}%`;

  // Get the most recently added product image for thumbnail
  const lastItem = storeItems[storeItems.length - 1];
  const itemImageUrl =
    lastItem?.item.photoUrl ||
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100';

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPressViewCart}
        style={styles.pill}
      >
        {/* Top Content Row */}
        <View style={styles.topRow}>
          {/* Left: Free delivery message */}
          <View style={styles.leftMessageContainer}>
            {isUnlocked ? (
              <Text style={styles.messageText}>
                You've unlocked <Text style={styles.highlightText}>FREE DELIVERY</Text>
              </Text>
            ) : (
              <Text style={styles.messageText}>
                Add <Text style={styles.highlightText}>₹{neededRupees} more</Text> to unlock{' '}
                <Text style={styles.highlightText}>FREE DELIVERY</Text>
              </Text>
            )}
          </View>

          {/* Right: CART count + Thumbnail + Chevron */}
          <View style={styles.rightActionContainer}>
            <View style={styles.cartCountCol}>
              <Text style={styles.cartTitle}>CART</Text>
              <Text style={styles.itemsSub}>
                {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'}
              </Text>
            </View>

            {/* Product Thumbnail */}
            <View style={styles.thumbnailBox}>
              <Image
                source={{ uri: itemImageUrl }}
                style={styles.thumbnailImg}
                resizeMode="cover"
              />
            </View>

            {/* Right Chevron */}
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </View>
        </View>

        {/* Bottom Progress Bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: progressPercent as any }]}>
            {/* Glowing dot indicator at tip */}
            <View style={styles.progressGlowDot} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingBottom: 6,
    width: '100%',
  },
  pill: {
    backgroundColor: '#0055FF', // Swiggy Instamart electric royal blue
    borderRadius: 16,
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 14,
    shadowColor: '#003DA5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftMessageContainer: {
    flex: 1,
    paddingRight: 10,
  },
  messageText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#E0EBFF',
    lineHeight: 16,
  },
  highlightText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rightActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartCountCol: {
    alignItems: 'flex-end',
  },
  cartTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    lineHeight: 15,
  },
  itemsSub: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    fontWeight: '700',
    color: '#BFD7FF',
    lineHeight: 12,
  },
  thumbnailBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'visible',
    position: 'relative',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 3,
  },
});

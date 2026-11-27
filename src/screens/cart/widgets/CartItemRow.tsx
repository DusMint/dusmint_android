import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../../../state/useCartStore';
import { AppTypography } from '../../../ui/theme/appTypography';

interface Props {
  cartItem: CartItem;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onMoveToWishlist: (id: string, name: string) => void;
}

export const CartItemRow: React.FC<Props> = ({
  cartItem,
  onIncrement,
  onDecrement,
  onMoveToWishlist,
}) => {
  const { item, quantity } = cartItem;
  const isOutOfStock = item.isInStock === false;
  const itemPrice = Math.round(item.pricePaise / 100);
  const itemMrp = Math.round(itemPrice * 1.25);

  const photoUri =
    item.photoUrl ||
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=150';

  return (
    <View style={[styles.container, isOutOfStock && styles.outOfStockRow]}>
      {/* 1. Item Image */}
      <Image source={{ uri: photoUri }} style={styles.image} resizeMode="contain" />

      {/* 2. Middle Details */}
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>
          {item.nameEn}
        </Text>
        <Text style={styles.unit}>{item.unit}</Text>

        {isOutOfStock ? (
          <Text style={styles.outOfStockBadge}>Out of stock</Text>
        ) : (
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={() => onMoveToWishlist(item.id, item.nameEn)}
            activeOpacity={0.7}
          >
            <Text style={styles.wishlistText}>Move to wishlist</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 3. Right: Stepper & Price */}
      <View style={styles.rightSection}>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepperAction}
            onPress={() => onDecrement(item.id)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
          >
            <Ionicons name="remove" size={17} color="#047A36" />
          </TouchableOpacity>

          <Text style={styles.stepperCount}>{quantity}</Text>

          <TouchableOpacity
            style={styles.stepperAction}
            onPress={() => onIncrement(item.id)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          >
            <Ionicons name="add" size={17} color="#047A36" />
          </TouchableOpacity>
        </View>

        <View style={styles.priceRow}>
          {itemMrp > itemPrice && (
            <Text style={styles.mrp}>₹{itemMrp * quantity}</Text>
          )}
          <Text style={styles.price}>₹{itemPrice * quantity}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    gap: 12,
  },
  outOfStockRow: {
    opacity: 0.55,
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#F1F1F1',
  },
  details: {
    flex: 1,
  },
  name: {
    ...AppTypography.bodyText,
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Medium',
    lineHeight: 18,
  },
  unit: {
    ...AppTypography.cardMeta,
    fontSize: 11,
    marginTop: 2,
  },
  wishlistBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  wishlistText: {
    ...AppTypography.cardMeta,
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  outOfStockBadge: {
    ...AppTypography.badgeText,
    fontSize: 11,
    color: '#D32F2F',
    marginTop: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  stepper: {
    height: 32,
    width: 84,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#047A36',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stepperAction: {
    width: 26,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCount: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: '#0F172A',
    textAlign: 'center',
    minWidth: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
  },
  mrp: {
    ...AppTypography.mrpText,
    fontSize: 10,
  },
  price: {
    ...AppTypography.priceText,
    fontSize: 13,
  },
});

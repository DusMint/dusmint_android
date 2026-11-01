import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { CartItem } from '../../../state/useCartStore';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

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
        <Text style={styles.name} numberOfLines={2}>
          {item.nameEn}
        </Text>
        <Text style={styles.unit}>{item.unit}</Text>

        {isOutOfStock ? (
          <Text style={styles.outOfStockBadge}>Out of stock</Text>
        ) : (
          <TouchableOpacity
            onPress={() => onMoveToWishlist(item.id, item.nameEn)}
            activeOpacity={0.7}
            style={styles.wishlistBtn}
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
          >
            <Text style={styles.stepperActionText}>−</Text>
          </TouchableOpacity>

          <Text style={styles.stepperCount}>{quantity}</Text>

          <TouchableOpacity
            style={styles.stepperAction}
            onPress={() => onIncrement(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.stepperActionText}>+</Text>
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
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: InstamartColors.ink,
    lineHeight: 18,
  },
  unit: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
  },
  wishlistBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  wishlistText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#666666',
    textDecorationLine: 'underline',
  },
  outOfStockBadge: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#D32F2F',
    marginTop: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  stepper: {
    height: 30,
    width: 80,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: InstamartColors.accentBlue,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  stepperAction: {
    width: 20,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperActionText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: InstamartColors.accentBlue,
  },
  stepperCount: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
  },
  mrp: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  price: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
});


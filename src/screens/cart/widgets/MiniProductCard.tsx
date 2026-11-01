import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ProductItem } from '../../home/data/homeData';
import { useCartStore } from '../../../state/useCartStore';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  product: ProductItem;
  onPress: (product: ProductItem) => void;
}

export const MiniProductCard: React.FC<Props> = ({ product, onPress }) => {
  const quantity = useCartStore((s) => s.getItemQuantity(product.id));
  const addItem = useCartStore((s) => s.addItem);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);

  const discountPercent =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const handleAdd = (e: any) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      vendorId: 'vendor-cart-suggest',
      categoryId: product.category,
      nameEn: product.name,
      unit: product.quantityLabel,
      stepQuantity: 1,
      pricePaise: product.price * 100,
      photoUrl: product.imageUrl,
      isInStock: product.inStock,
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(product)}
      activeOpacity={0.9}
    >
      {/* 1. Image Box with Floating Add / Stepper */}
      <View style={styles.imageBox}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />

        {quantity === 0 ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAdd}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.addBtnPlus}>+</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => decrementItem(product.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperQty}>{quantity}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => incrementItem(product.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 2. Delivery Time Badge */}
      <Text style={styles.deliveryText}>{product.deliveryMins || '10 MINS'}</Text>

      {/* 3. Product Title */}
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>

      {/* 4. Quantity Label */}
      <Text style={styles.qtyLabel}>{product.quantityLabel}</Text>

      {/* 5. Discount Tag */}
      {discountPercent > 0 && (
        <Text style={styles.discountText}>{discountPercent}% OFF</Text>
      )}

      {/* 6. Price & MRP */}
      <View style={styles.priceRow}>
        <Text style={styles.price}>₹{product.price}</Text>
        {product.mrp > product.price && (
          <Text style={styles.mrp}>₹{product.mrp}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 104,
  },
  imageBox: {
    width: 104,
    height: 104,
    borderRadius: 12,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 6,
  },
  image: {
    width: '90%',
    height: '90%',
  },
  addBtn: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: InstamartColors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  addBtnPlus: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    lineHeight: 22,
    color: InstamartColors.accentBlue,
  },
  stepperContainer: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    height: 28,
    borderRadius: 8,
    backgroundColor: InstamartColors.accentBlue,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 4,
  },
  stepperBtn: {
    paddingHorizontal: 3,
  },
  stepperBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  stepperQty: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  deliveryText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    color: '#888888',
    marginTop: 6,
  },
  name: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
    color: InstamartColors.ink,
    lineHeight: 15,
    marginTop: 2,
  },
  qtyLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
  },
  discountText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    fontWeight: '700',
    color: '#1B9A5B',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  price: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 13,
    fontWeight: '800',
    color: InstamartColors.ink,
  },
  mrp: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
});

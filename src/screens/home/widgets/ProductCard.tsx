import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors, InstamartRadii, InstamartTypography } from '../../../ui/theme/instamartTheme';
import { ProductItem } from '../data/homeData';
import { useCartStore } from '../../../state/useCartStore';

interface Props {
  product: ProductItem;
  onPress?: () => void;
}

export const ProductCard: React.FC<Props> = ({ product, onPress }) => {
  const quantity = useCartStore((s) => s.getItemQuantity(product.id));
  const addItem = useCartStore((s) => s.addItem);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);

  const discountPercent =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const handleAdd = () => {
    addItem({
      id: product.id,
      vendorId: 'vendor-mandi-1',
      categoryId: 'cat-veg',
      nameEn: product.name,
      unit: product.quantityLabel,
      stepQuantity: 1,
      pricePaise: product.price * 100,
      photoUrl: product.imageUrl,
      isInStock: product.inStock,
    });
  };

  const handleIncrement = () => {
    incrementItem(product.id);
  };

  const handleDecrement = () => {
    decrementItem(product.id);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Image Container */}
      <View style={styles.imageBox}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="contain" />

        {/* Top-Left Tag */}
        {product.tag && (
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{product.tag}</Text>
          </View>
        )}

        {/* Top-Right Heart */}
        <TouchableOpacity style={styles.heartBox} activeOpacity={0.7}>
          <Ionicons name="heart-outline" size={12} color="#888888" />
        </TouchableOpacity>

        {/* Floating Add / Stepper Button */}
        {quantity === 0 ? (
          <TouchableOpacity
            style={styles.floatingAdd}
            onPress={handleAdd}
            disabled={!product.inStock}
            activeOpacity={0.8}
          >
            <Text style={styles.addPlus}>+</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.stepperContainer}>
            <TouchableOpacity style={styles.stepperBtn} onPress={handleDecrement} activeOpacity={0.7}>
              <Ionicons name="remove" size={14} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.stepperQty}>{quantity}</Text>
            <TouchableOpacity style={styles.stepperBtn} onPress={handleIncrement} activeOpacity={0.7}>
              <Ionicons name="add" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quantity Chip */}
      <View style={styles.quantityChip}>
        <Text style={styles.quantityText}>{product.quantityLabel}</Text>
      </View>

      {/* Name */}
      <Text style={InstamartTypography.productName} numberOfLines={2}>
        {product.name}
      </Text>

      {/* Price & Discount */}
      <View style={styles.priceRow}>
        <Text style={InstamartTypography.productPrice}>₹{product.price}</Text>
        {product.mrp > product.price && (
          <Text style={InstamartTypography.mrp}>₹{product.mrp}</Text>
        )}
      </View>

      {discountPercent > 0 && (
        <Text style={InstamartTypography.discount}>{discountPercent}% OFF</Text>
      )}

      {/* Meta Row: Rating & Delivery Mins */}
      <View style={styles.metaRow}>
        <Ionicons name="star" size={10} color={InstamartColors.successGreen} />
        <Text style={styles.ratingText}>{product.rating}</Text>
        <Text style={InstamartTypography.meta}> &bull; {product.deliveryMins}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 132,
    marginRight: 10,
  },
  imageBox: {
    width: 132,
    height: 132,
    backgroundColor: InstamartColors.imagePlaceholder,
    borderRadius: InstamartRadii.card,
    padding: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 8,
  },
  tagBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: InstamartColors.tagBlueBg,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 8,
  },
  tagText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: InstamartColors.tagBlueText,
  },
  heartBox: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingAdd: {
    position: 'absolute',
    bottom: -6,
    right: 6,
    width: 36,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: InstamartRadii.plusButton,
    borderWidth: 1.5,
    borderColor: InstamartColors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addPlus: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 22,
    color: InstamartColors.accentBlue,
    lineHeight: 26,
    marginTop: -2,
  },
  stepperContainer: {
    position: 'absolute',
    bottom: -6,
    right: 4,
    width: 86,
    height: 34,
    backgroundColor: InstamartColors.accentBlue,
    borderRadius: InstamartRadii.plusButton,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  stepperBtn: {
    padding: 4,
  },
  stepperQty: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  quantityChip: {
    backgroundColor: InstamartColors.quantityChipBg,
    borderRadius: InstamartRadii.chip,
    paddingVertical: 1,
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 4,
  },
  quantityText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: InstamartColors.inkSoft,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: InstamartColors.successGreen,
    marginLeft: 2,
  },
});

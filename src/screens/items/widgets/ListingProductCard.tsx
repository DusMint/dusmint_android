import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { ListingProduct, ProductVariant } from '../data/listingData';
import { useCartStore } from '../../../state/useCartStore';

interface Props {
  product: ListingProduct;
  cardWidth: number;
  onPress?: () => void;
}

export const ListingProductCard: React.FC<Props> = ({ product, cardWidth, onPress }) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || { id: 'def', label: '1 unit', price: 20, mrp: 25 }
  );

  const cartItemId = `${product.id}_${selectedVariant.id}`;
  const quantity = useCartStore((s) => s.getItemQuantity(cartItemId));
  const addItem = useCartStore((s) => s.addItem);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);

  const handleAdd = () => {
    addItem({
      id: cartItemId,
      vendorId: 'vendor-listing',
      categoryId: product.subcategoryId,
      nameEn: `${product.name} (${selectedVariant.label})`,
      unit: selectedVariant.label,
      stepQuantity: 1,
      pricePaise: selectedVariant.price * 100,
      photoUrl: product.imageUrl,
      isInStock: product.inStock,
    });
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* 1. Image Container with Overlays */}
      <View style={[styles.imageBox, { width: cardWidth }]}>
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} resizeMode="contain" />

        {/* Top-Right: Bookmark Icon */}
        <TouchableOpacity style={styles.bookmarkBox} activeOpacity={0.7}>
          <Ionicons name="heart-outline" size={12} color="#888888" />
        </TouchableOpacity>

        {/* Bottom-Left: Ad Tag (if sponsored) */}
        {product.isAd && (
          <View style={styles.adTag}>
            <Text style={styles.adText}>Ad</Text>
          </View>
        )}

        {/* Bottom-Left: Veg / Non-Veg Indicator */}
        <View style={[styles.vegBox, { borderColor: product.isVeg ? '#1B9A5B' : '#E53935' }]}>
          <View
            style={[styles.vegCircle, { backgroundColor: product.isVeg ? '#1B9A5B' : '#E53935' }]}
          />
        </View>

        {/* Bottom-Right: Floating "+" or Stepper Button */}
        {quantity === 0 ? (
          <TouchableOpacity
            style={styles.floatingAdd}
            onPress={handleAdd}
            disabled={!product.inStock}
            activeOpacity={0.8}
            accessibilityLabel="Add to cart"
          >
            <Text style={styles.addPlus}>+</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => decrementItem(cartItemId)}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={13} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.stepperQty}>{quantity}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => incrementItem(cartItemId)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 2. Variant Chips Row */}
      <View style={styles.variantsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
          {product.variants.map((v) => {
            const isSelected = v.id === selectedVariant.id;
            return (
              <TouchableOpacity
                key={v.id}
                style={[styles.variantChip, isSelected && styles.selectedVariantChip]}
                onPress={() => setSelectedVariant(v)}
                activeOpacity={0.8}
              >
                <Text style={[styles.variantText, isSelected && styles.selectedVariantText]}>
                  {v.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Price & MRP Row */}
      <View style={styles.priceRow}>
        <Text style={styles.sellingPrice}>₹{selectedVariant.price}</Text>
        {selectedVariant.mrp > selectedVariant.price && (
          <Text style={styles.mrpText}>₹{selectedVariant.mrp}</Text>
        )}
      </View>

      {/* 4. Unit Price & "Price for you" */}
      <View style={styles.unitRow}>
        {selectedVariant.unitPriceText ? (
          <Text style={styles.unitPriceText}>{selectedVariant.unitPriceText}</Text>
        ) : null}
        {product.isPriceForYou && (
          <Text style={styles.priceForYouTag}>Price for you</Text>
        )}
      </View>

      {/* 5. Product Name */}
      <Text style={styles.productName} numberOfLines={2}>
        {product.name}
      </Text>

      {/* 6. Delivery Time */}
      <Text style={styles.deliveryMins}>{product.deliveryMins}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 6,
  },
  imageBox: {
    height: 146,
    backgroundColor: InstamartColors.imagePlaceholder, // #F1F1F1
    borderRadius: 14,
    padding: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '90%',
    height: '90%',
    borderRadius: 8,
  },
  bookmarkBox: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#BBBBBB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adTag: {
    position: 'absolute',
    left: 6,
    bottom: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  adText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 8,
    color: '#777777',
  },
  vegBox: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    width: 13,
    height: 13,
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  vegCircle: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  floatingAdd: {
    position: 'absolute',
    bottom: -14,
    right: 6,
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: InstamartColors.accentBlue, // #2F4FD8
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
    bottom: -14,
    right: 4,
    width: 80,
    height: 34,
    borderRadius: 10,
    backgroundColor: InstamartColors.accentBlue,
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
    padding: 3,
  },
  stepperQty: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  variantsRow: {
    marginTop: 18,
    marginBottom: 4,
  },
  variantChip: {
    backgroundColor: '#EEF1F6',
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  selectedVariantChip: {
    backgroundColor: '#DCEBFF',
  },
  variantText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 9,
    color: '#333333',
  },
  selectedVariantText: {
    fontFamily: 'Poppins_700Bold',
    color: '#2563C9',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  sellingPrice: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 15,
    fontWeight: '800',
    color: InstamartColors.ink,
  },
  mrpText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 1,
  },
  unitPriceText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#888888',
  },
  priceForYouTag: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    color: '#D32F2F',
  },
  productName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
    color: InstamartColors.ink,
    marginTop: 4,
    lineHeight: 16,
  },
  deliveryMins: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: '#888888',
    marginTop: 3,
  },
});

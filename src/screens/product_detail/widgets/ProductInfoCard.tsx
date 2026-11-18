import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { ProductDetailModel, ProductVariantDetail } from '../data/productDetailData';
import { VariantSelector } from './VariantSelector';
import { VendorShop } from '../../../api-client/types';

interface Props {
  product: ProductDetailModel;
  selectedVariant: ProductVariantDetail;
  shop?: VendorShop;
  onSelectVariant: (v: ProductVariantDetail) => void;
  onCategoryLinkPress: () => void;
  onStorePress?: (shop: VendorShop) => void;
}

export const ProductInfoCard: React.FC<Props> = ({
  product,
  selectedVariant,
  shop,
  onSelectVariant,
  onCategoryLinkPress,
  onStorePress,
}) => {
  return (
    <View style={styles.card}>
      {/* Category Link */}
      <TouchableOpacity
        onPress={onCategoryLinkPress}
        activeOpacity={0.7}
        style={styles.categoryLink}
      >
        <Text style={styles.categoryLinkText}>
          Explore all {product.categoryName} items &gt;
        </Text>
      </TouchableOpacity>

      {/* Product Name */}
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>

      {/* Short Description */}
      <Text style={styles.description} numberOfLines={3}>
        {product.shortDescription}
      </Text>

      {/* Sold By Store Card (Zomato Multi-Vendor Model) */}
      {shop && (
        <TouchableOpacity
          style={styles.storeBadgeCard}
          onPress={() => onStorePress && onStorePress(shop)}
          activeOpacity={0.75}
        >
          <View style={styles.storeIconCircle}>
            <Ionicons name="storefront" size={15} color="#0055FF" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.storeLabel}>SOLD &amp; FULFILLED BY</Text>
            <Text style={styles.storeNameText} numberOfLines={1}>
              {shop.shopName}
            </Text>
            <Text style={styles.storeMetaText}>
              {shop.deliveryTimeMins} mins &bull; {shop.distanceKm} km away
            </Text>
          </View>
          <View style={styles.storeRatingChip}>
            <Text style={styles.storeRatingText}>{shop.score || '4.8'}</Text>
            <Ionicons name="star" size={10} color="#FFFFFF" style={{ marginLeft: 2 }} />
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      )}

      {/* Selected Variant Label */}
      <Text style={styles.quantityHeading}>
        Quantity: <Text style={styles.quantityHighlight}>{selectedVariant.label}</Text>
      </Text>

      {/* Variant Selector */}
      <VariantSelector
        variants={product.variants}
        selectedVariantId={selectedVariant.id}
        onSelectVariant={onSelectVariant}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryLink: {
    alignSelf: 'flex-start',
  },
  categoryLinkText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: InstamartColors.accentBlue,
  },
  name: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 19,
    fontWeight: '700',
    color: InstamartColors.ink,
    marginTop: 10,
    lineHeight: 25,
  },
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#666666',
    lineHeight: 17,
    marginTop: 4,
  },
  storeBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  storeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    fontWeight: '700',
    color: '#0055FF',
    letterSpacing: 0.5,
  },
  storeNameText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  storeMetaText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10.5,
    color: '#64748B',
  },
  storeRatingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  storeRatingText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10.5,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  quantityHeading: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#555555',
    marginTop: 14,
    marginBottom: 8,
  },
  quantityHighlight: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: InstamartColors.ink,
  },
});


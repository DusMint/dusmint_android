import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { ProductDetailModel, ProductVariantDetail } from '../data/productDetailData';
import { VariantSelector } from './VariantSelector';

interface Props {
  product: ProductDetailModel;
  selectedVariant: ProductVariantDetail;
  onSelectVariant: (v: ProductVariantDetail) => void;
  onCategoryLinkPress: () => void;
}

export const ProductInfoCard: React.FC<Props> = ({
  product,
  selectedVariant,
  onSelectVariant,
  onCategoryLinkPress,
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


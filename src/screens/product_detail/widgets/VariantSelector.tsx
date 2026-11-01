import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { ProductVariantDetail } from '../data/productDetailData';

interface Props {
  variants: ProductVariantDetail[];
  selectedVariantId: string;
  onSelectVariant: (variant: ProductVariantDetail) => void;
}

export const VariantSelector: React.FC<Props> = ({
  variants,
  selectedVariantId,
  onSelectVariant,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {variants.map((v) => {
        const isSelected = v.id === selectedVariantId;
        const isDisabled = !v.inStock;

        return (
          <TouchableOpacity
            key={v.id}
            style={[
              styles.card,
              isSelected && styles.selectedCard,
              isDisabled && styles.disabledCard,
            ]}
            onPress={() => !isDisabled && onSelectVariant(v)}
            disabled={isDisabled}
            activeOpacity={0.8}
          >
            {/* Discount Badge if available */}
            {v.discountPercent && v.discountPercent > 0 && !isDisabled ? (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{v.discountPercent}% OFF</Text>
              </View>
            ) : null}

            {/* Label */}
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>
              {v.label}
            </Text>

            {/* Price & MRP Row */}
            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{v.price}</Text>
              {v.mrp > v.price && (
                <Text style={styles.mrp}>₹{v.mrp}</Text>
              )}
            </View>

            {/* Unit Price or Out of Stock label */}
            {isDisabled ? (
              <Text style={styles.outOfStock}>Out of stock</Text>
            ) : (
              <Text style={styles.unitPrice}>{v.unitPriceLabel}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  card: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E4EA',
    borderRadius: 12,
    padding: 10,
    justifyContent: 'space-between',
    minHeight: 90,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: InstamartColors.accentBlue,
    backgroundColor: '#F8FAFF',
  },
  disabledCard: {
    opacity: 0.5,
    backgroundColor: '#F9F9F9',
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E4F7F1',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 4,
  },
  discountText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 10,
    fontWeight: '800',
    color: '#1B9A5B',
  },
  label: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
    color: InstamartColors.ink,
    marginBottom: 4,
  },
  selectedLabel: {
    color: InstamartColors.accentBlue,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 15,
    fontWeight: '800',
    color: InstamartColors.ink,
  },
  mrp: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  unitPrice: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
  },
  outOfStock: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#D32F2F',
    marginTop: 2,
  },
});


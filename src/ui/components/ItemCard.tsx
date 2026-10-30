import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

export interface ItemCardProps {
  id: string;
  nameEn: string;
  nameHi?: string;
  unit: string;
  pricePaise: number;
  mrpPaise?: number;
  mandiBandMinPaise?: number;
  mandiBandMaxPaise?: number;
  discountPercent?: number;
  photoUrl?: string;
  imagePlaceholder?: string;
  isInStock?: boolean;
  quantityInCart?: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onPressCard?: () => void;
  style?: ViewStyle;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  id,
  nameEn,
  unit,
  pricePaise,
  mrpPaise,
  mandiBandMaxPaise,
  discountPercent,
  photoUrl,
  imagePlaceholder = '🥗',
  isInStock = true,
  quantityInCart = 0,
  onAdd,
  onIncrement,
  onDecrement,
  onPressCard,
  style,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const priceRupees = Math.round(pricePaise / 100);
  const mrpRupees = mrpPaise
    ? Math.round(mrpPaise / 100)
    : mandiBandMaxPaise
    ? Math.round(mandiBandMaxPaise / 100)
    : Math.round(priceRupees * 1.18);

  const calculatedDiscount =
    discountPercent ||
    (mrpRupees > priceRupees
      ? Math.round(((mrpRupees - priceRupees) / mrpRupees) * 100)
      : 0);

  const savingsRupees = Math.max(0, mrpRupees - priceRupees);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPressCard}
      disabled={!isInStock}
      style={[styles.card, style, !isInStock ? styles.outOfStockCard : null]}
    >
      {/* Product Image Area */}
      <View style={styles.imageContainer}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderEmoji}>{imagePlaceholder}</Text>
          </View>
        )}

        {/* Top-Left: Solid Vibrant Green Discount Pill (e.g. 17% OFF) */}
        {calculatedDiscount > 0 ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{calculatedDiscount}% OFF</Text>
          </View>
        ) : null}

        {/* Top-Right: Circular Heart / Wishlist Button */}
        <TouchableOpacity
          style={styles.heartButton}
          activeOpacity={0.8}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={15}
            color={isFavorite ? '#DC2626' : '#15803D'}
          />
        </TouchableOpacity>
      </View>

      {/* Product Details Area */}
      <View style={styles.body}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {nameEn}
        </Text>

        {/* Unit */}
        <Text style={styles.unitText}>{unit}</Text>

        {/* Price & Strikethrough MRP Row */}
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>₹{priceRupees}</Text>
          {mrpRupees > priceRupees ? (
            <Text style={styles.mrpText}>MRP ₹{mrpRupees}</Text>
          ) : null}
        </View>

        {/* Save Tag Pill (e.g. Save ₹8) */}
        {savingsRupees > 0 ? (
          <View style={styles.saveBadge}>
            <Text style={styles.saveBadgeText}>Save ₹{savingsRupees}</Text>
          </View>
        ) : (
          <View style={[styles.saveBadge, { opacity: 0 }]}>
            <Text style={styles.saveBadgeText}>Save ₹0</Text>
          </View>
        )}

        {/* Bottom Full-Width Emerald ADD Button or Stepper */}
        {!isInStock ? (
          <View style={styles.outOfStockButton}>
            <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
          </View>
        ) : quantityInCart > 0 ? (
          <View style={styles.stepperButton}>
            <TouchableOpacity
              style={styles.stepperAction}
              onPress={onDecrement}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.stepperActionText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.stepperValueText}>{quantityInCart}</Text>

            <TouchableOpacity
              style={styles.stepperAction}
              onPress={onIncrement}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.stepperActionText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.88}
            onPress={onAdd}
          >
            <Text style={styles.addButtonText}>ADD</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  outOfStockCard: {
    opacity: 0.65,
  },
  imageContainer: {
    width: '100%',
    height: 114,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#15803D',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    elevation: 2,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
    letterSpacing: 0.3,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  body: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
  },
  title: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.headingBold,
    color: '#1E293B',
    lineHeight: 18,
  },
  unitText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.body,
    color: '#64748B',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  priceText: {
    fontSize: 19,
    fontFamily: Typography.fontFamily.headingBold,
    color: '#0F172A',
  },
  mrpText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.body,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  saveBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
  },
  saveBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
  },
  addButton: {
    backgroundColor: '#11663A',
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: Typography.fontFamily.headingBold,
    letterSpacing: 0.5,
  },
  stepperButton: {
    backgroundColor: '#11663A',
    height: 36,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    elevation: 1,
  },
  stepperAction: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Typography.fontFamily.headingBold,
  },
  stepperValueText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: Typography.fontFamily.headingBold,
  },
  outOfStockButton: {
    backgroundColor: '#F1F5F9',
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    color: '#94A3B8',
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
  },
});

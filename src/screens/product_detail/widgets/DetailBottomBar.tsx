import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { ProductVariantDetail } from '../data/productDetailData';
import { useCartStore } from '../../../state/useCartStore';

interface Props {
  variant: ProductVariantDetail;
  productName: string;
  productImage: string;
  onViewCart: () => void;
}

export const DetailBottomBar: React.FC<Props> = ({
  variant,
  productName,
  productImage,
  onViewCart,
}) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 8);

  const cartItemId = variant.id;
  const quantity = useCartStore((s) => s.getItemQuantity(cartItemId));
  const addItem = useCartStore((s) => s.addItem);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);

  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());
  const totalRupees = (totalPaise / 100).toFixed(0);

  const handleAdd = () => {
    addItem({
      id: cartItemId,
      vendorId: 'vendor-detail',
      categoryId: 'cat-detail',
      nameEn: `${productName} (${variant.label})`,
      unit: variant.label,
      stepQuantity: 1,
      pricePaise: variant.price * 100,
      photoUrl: productImage,
      isInStock: variant.inStock,
    });
  };

  return (
    <View style={styles.outerContainer}>
      {/* 1. Floating Cart Strip above bar (when cart not empty) */}
      {totalItemsCount > 0 && (
        <TouchableOpacity
          style={styles.cartStrip}
          onPress={onViewCart}
          activeOpacity={0.9}
        >
          <View style={styles.cartStripLeft}>
            <Ionicons name="cart" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.cartStripText}>
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} | ₹{totalRupees}
            </Text>
          </View>
          <View style={styles.cartStripRight}>
            <Text style={styles.cartStripAction}>View cart</Text>
            <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}

      {/* 2. Main Pinned Bottom Bar */}
      <View style={[styles.mainBar, { paddingBottom: bottomInset }]}>
        {/* Left: Price and Variant info */}
        <View style={styles.leftInfo}>
          <View style={styles.variantBadgeRow}>
            <Text style={styles.variantLabel} numberOfLines={1}>
              {variant.label}
            </Text>
            {variant.discountPercent && variant.discountPercent > 0 ? (
              <Text style={styles.discountBadge}>
                {variant.discountPercent}% OFF
              </Text>
            ) : null}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{variant.price}</Text>
            {variant.mrp > variant.price && (
              <Text style={styles.mrp}>₹{variant.mrp}</Text>
            )}
          </View>
        </View>

        {/* Right: ADD or Stepper Button */}
        {!variant.inStock ? (
          <View style={[styles.actionBtn, styles.disabledBtn]}>
            <Text style={styles.disabledBtnText}>Out of stock</Text>
          </View>
        ) : quantity === 0 ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleAdd}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>ADD</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => decrementItem(cartItemId)}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.stepperCount}>{quantity}</Text>

            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => incrementItem(cartItemId)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 90,
  },
  cartStrip: {
    height: 40,
    backgroundColor: InstamartColors.cartWidget, // #3B2A1D
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    marginHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  cartStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartStripText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  cartStripRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cartStripAction: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  mainBar: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  leftInfo: {
    flex: 1,
    marginRight: 12,
  },
  variantBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  variantLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#555555',
    maxWidth: 130,
  },
  discountBadge: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#1B9A5B',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  price: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 18,
    fontWeight: '800',
    color: InstamartColors.ink,
  },
  mrp: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  actionBtn: {
    width: 176,
    height: 46,
    borderRadius: 12,
    backgroundColor: InstamartColors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  disabledBtn: {
    backgroundColor: '#CCCCCC',
  },
  disabledBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#666666',
  },
  stepperContainer: {
    width: 176,
    height: 46,
    borderRadius: 12,
    backgroundColor: InstamartColors.accentBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCount: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

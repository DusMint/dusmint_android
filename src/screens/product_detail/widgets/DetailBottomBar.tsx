import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { AppTypography } from '../../../ui/theme/appTypography';
import { ProductVariantDetail } from '../data/productDetailData';
import { useCartStore } from '../../../state/useCartStore';

interface Props {
  variant: ProductVariantDetail;
  productName: string;
  productImage: string;
  vendorId?: string;
  vendorName?: string;
  onViewCart: () => void;
}

export const DetailBottomBar: React.FC<Props> = ({
  variant,
  productName,
  productImage,
  vendorId = 's1',
  vendorName = 'Sharma Kirana Store',
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
    const cart = useCartStore.getState();
    if (cart.items.length > 0 && cart.currentVendorId && cart.currentVendorId !== vendorId) {
      const existingVendorName = cart.currentVendorName || 'another store';
      Alert.alert(
        'Replace cart items?',
        `Your cart contains items from ${existingVendorName}. Do you want to discard them and add items from ${vendorName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace Cart',
            style: 'destructive',
            onPress: () => {
              cart.clearCart();
              addItem({
                id: cartItemId,
                vendorId: vendorId,
                vendorName: vendorName,
                categoryId: 'cat-detail',
                nameEn: `${productName} (${variant.label})`,
                unit: variant.label,
                stepQuantity: 1,
                pricePaise: variant.price * 100,
                photoUrl: productImage,
                isInStock: variant.inStock,
              });
            },
          },
        ]
      );
      return;
    }

    addItem({
      id: cartItemId,
      vendorId: vendorId,
      vendorName: vendorName,
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
    ...AppTypography.badgeText,
    fontSize: 12,
    color: '#FFFFFF',
  },
  cartStripRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cartStripAction: {
    ...AppTypography.buttonText,
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
    ...AppTypography.cardMeta,
    fontSize: 11,
    maxWidth: 130,
  },
  discountBadge: {
    ...AppTypography.badgeText,
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
    ...AppTypography.priceText,
    fontSize: 18,
  },
  mrp: {
    ...AppTypography.mrpText,
    fontSize: 12,
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
    ...AppTypography.buttonText,
    fontSize: 16,
  },
  disabledBtn: {
    backgroundColor: '#CCCCCC',
  },
  disabledBtnText: {
    ...AppTypography.cardMeta,
    fontSize: 14,
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
    ...AppTypography.cardMetaStrong,
    fontSize: 16,
    color: '#FFFFFF',
  },
});


import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTypography, AppTextColors } from '../../../ui/theme/appTypography';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { useCartStore } from '../../../state/useCartStore';
import { CatalogueItem } from '@dusmint/api-client';
import { PriceComparisonResult, StorePriceOption } from '../../../services/voicePriceComparator';

interface Props {
  result: PriceComparisonResult;
  onItemPress?: (item: CatalogueItem) => void;
}

export const PriceComparisonCard: React.FC<Props> = ({ result, onItemPress }) => {
  const { winner, competitors, totalStoresCount, productName } = result;

  const addItem = useCartStore((s) => s.addItem);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const getItemQuantity = useCartStore((s) => s.getItemQuantity);
  const clearCart = useCartStore((s) => s.clearCart);

  const winnerQty = getItemQuantity(winner.item.id);

  const handleAdd = (option: StorePriceOption) => {
    const res = addItem(option.item);
    if (!res.success && res.conflict) {
      const cart = useCartStore.getState();
      Alert.alert(
        'Replace cart items?',
        `Your cart contains items from ${cart.currentVendorName || 'another store'}. Discard them and switch to ${option.storeName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace Cart',
            style: 'destructive',
            onPress: () => {
              clearCart();
              addItem(option.item);
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Comparison Heading */}
      <View style={styles.comparisonHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.comparisonTitle}>Best Price Comparison</Text>
          <Text style={styles.comparisonSubtitle}>
            Compared across {totalStoresCount} nearby {totalStoresCount === 1 ? 'store' : 'stores'}
          </Text>
        </View>
        <View style={styles.verifiedBadge}>
          <Ionicons name="shield-checkmark" size={13} color="#059669" />
          <Text style={styles.verifiedText}>Live Rates</Text>
        </View>
      </View>

      {/* WINNER HERO CARD (Lowest Price Guaranteed) */}
      <TouchableOpacity
        style={styles.winnerCard}
        activeOpacity={0.9}
        onPress={() => onItemPress && onItemPress(winner.item)}
      >
        {/* Lowest Price Banner */}
        <View style={styles.winnerBadgeRow}>
          <View style={styles.lowestPriceBadge}>
            <Ionicons name="flash" size={12} color="#FFFFFF" />
            <Text style={styles.lowestPriceBadgeText}>SABSE SASTA RATE</Text>
          </View>
          {winner.savingsVsCompetitorRupees > 0 && (
            <View style={styles.savingsPill}>
              <Text style={styles.savingsPillText}>
                Bachayein ₹{winner.savingsVsCompetitorRupees}
              </Text>
            </View>
          )}
        </View>

        {/* Product Details Row */}
        <View style={styles.winnerContentRow}>
          {/* Product Image */}
          <View style={styles.imageContainer}>
            {winner.item.photoUrl ? (
              <Image source={{ uri: winner.item.photoUrl }} style={styles.productImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="basket-outline" size={26} color="#9CA3AF" />
              </View>
            )}
            <View style={styles.vegIndicator}>
              <View style={styles.vegDot} />
            </View>
          </View>

          {/* Details */}
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={1}>
              {winner.item.nameEn || productName}
            </Text>
            <Text style={styles.unitText}>
              {winner.item.unit || '1 unit'}
            </Text>

            {/* Store Info */}
            <View style={styles.storeInfoRow}>
              <Ionicons name="storefront-outline" size={12} color="#6B7280" />
              <Text style={styles.storeNameText} numberOfLines={1}>
                {winner.storeName}
              </Text>
              <Text style={styles.bulletSeparator}>•</Text>
              <Ionicons name="time-outline" size={12} color="#059669" />
              <Text style={styles.deliveryTimeText}>{winner.deliveryTimeMins}m</Text>
            </View>

            {/* Pricing Section */}
            <View style={styles.pricingRow}>
              <Text style={styles.priceCurrent}>₹{winner.priceRupees}</Text>
              {winner.mrpRupees > winner.priceRupees && (
                <Text style={styles.priceMrp}>₹{winner.mrpRupees}</Text>
              )}
              {winner.discountPercent > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{winner.discountPercent}% OFF</Text>
                </View>
              )}
            </View>
          </View>

          {/* Add to Cart Button */}
          <View style={styles.actionColumn}>
            {winnerQty === 0 ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAdd(winner)}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>ADD</Text>
                <Ionicons name="add" size={14} color="#059669" />
              </TouchableOpacity>
            ) : (
              <View style={styles.qtyContainer}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => decrementItem(winner.item.id)}
                >
                  <Ionicons name="remove" size={13} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{winnerQty}</Text>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => incrementItem(winner.item.id)}
                >
                  <Ionicons name="add" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* COMPETITOR STORES ACCORDION / LIST */}
      {competitors.length > 0 && (
        <View style={styles.competitorsContainer}>
          <Text style={styles.competitorsHeaderTitle}>
            Other stores selling this item ({competitors.length})
          </Text>

          {competitors.map((comp, idx) => {
            const compQty = getItemQuantity(comp.item.id);
            const priceDiff = comp.priceRupees - winner.priceRupees;

            return (
              <View key={comp.item.id || `comp-${idx}`} style={styles.competitorRow}>
                <View style={styles.compStoreInfo}>
                  <Text style={styles.compStoreName} numberOfLines={1}>
                    {comp.storeName}
                  </Text>
                  <View style={styles.compMetaRow}>
                    <Text style={styles.compMetaText}>
                      {comp.distanceKm} km • {comp.deliveryTimeMins} mins
                    </Text>
                    {priceDiff > 0 && (
                      <Text style={styles.compDiffText}>+₹{priceDiff} higher</Text>
                    )}
                  </View>
                </View>

                <View style={styles.compPriceAndAction}>
                  <Text style={styles.compPrice}>₹{comp.priceRupees}</Text>

                  {compQty === 0 ? (
                    <TouchableOpacity
                      style={styles.compAddBtn}
                      onPress={() => handleAdd(comp)}
                    >
                      <Text style={styles.compAddBtnText}>ADD</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.compQtyBox}>
                      <TouchableOpacity onPress={() => decrementItem(comp.item.id)}>
                        <Ionicons name="remove" size={12} color="#111827" />
                      </TouchableOpacity>
                      <Text style={styles.compQtyNum}>{compQty}</Text>
                      <TouchableOpacity onPress={() => incrementItem(comp.item.id)}>
                        <Ionicons name="add" size={12} color="#111827" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  comparisonTitle: {
    ...AppTypography.cardTitle,
    fontSize: 16,
    color: AppTextColors.primary,
  },
  comparisonSubtitle: {
    ...AppTypography.cardMeta,
    fontSize: 12,
    color: AppTextColors.secondary,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 4,
  },
  verifiedText: {
    ...AppTypography.badgeText,
    fontSize: 11,
    color: '#059669',
  },
  winnerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  winnerBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lowestPriceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    gap: 4,
  },
  lowestPriceBadgeText: {
    ...AppTypography.badgeText,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  savingsPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#FCD34D',
  },
  savingsPillText: {
    ...AppTypography.badgeText,
    color: '#B45309',
    fontWeight: '700',
    fontSize: 11,
  },
  winnerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vegIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 13,
    height: 13,
    borderWidth: 1.2,
    borderColor: '#059669',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
  },
  vegDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#059669',
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  productName: {
    ...AppTypography.cardTitle,
    fontSize: 15,
    color: AppTextColors.primary,
  },
  unitText: {
    ...AppTypography.cardMeta,
    fontSize: 12,
    color: AppTextColors.secondary,
    marginTop: 1,
  },
  storeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  storeNameText: {
    ...AppTypography.cardMeta,
    fontSize: 11,
    color: '#4B5563',
    maxWidth: 90,
  },
  bulletSeparator: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  deliveryTimeText: {
    ...AppTypography.cardMetaStrong,
    fontSize: 11,
    color: '#059669',
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 6,
  },
  priceCurrent: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  priceMrp: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums'],
  },
  discountBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  discountText: {
    ...AppTypography.badgeText,
    fontSize: 9.5,
    color: '#15803D',
  },
  actionColumn: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 2,
    elevation: 1,
  },
  addButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    color: '#059669',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 3,
    gap: 6,
  },
  qtyButton: {
    padding: 3,
  },
  qtyText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    minWidth: 16,
    textAlign: 'center',
  },
  competitorsContainer: {
    marginTop: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  competitorsHeaderTitle: {
    ...AppTypography.sectionLabel,
    fontSize: 10.5,
    color: '#6B7280',
    marginBottom: 6,
  },
  competitorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  compStoreInfo: {
    flex: 1,
    marginRight: 8,
  },
  compStoreName: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12.5,
    color: AppTextColors.primary,
  },
  compMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  compMetaText: {
    ...AppTypography.cardMeta,
    fontSize: 11,
    color: '#6B7280',
  },
  compDiffText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 10.5,
    color: '#DC2626',
  },
  compPriceAndAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compPrice: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13.5,
    color: AppTextColors.primary,
    fontVariant: ['tabular-nums'],
  },
  compAddBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  compAddBtnText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10.5,
    color: '#374151',
  },
  compQtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 4,
  },
  compQtyNum: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    color: '#111827',
  },
});

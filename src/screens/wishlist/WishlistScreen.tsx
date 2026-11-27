import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  StatusBar,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWishlistStore, WishlistProduct } from '../../state/useWishlistStore';
import { useCartStore } from '../../state/useCartStore';
import { useLocationStore } from '../../state/useLocationStore';
import { CartStickyBar } from '../../ui/components/CartStickyBar';
import { dusmintApi, CatalogueItem } from '@dusmint/api-client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

interface Props {
  navigation: any;
}

export const WishlistScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;

  const wishlistItems = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addItemToWishlist = useWishlistStore((s) => s.addItem);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const syncWishlist = useWishlistStore((s) => s.syncFromBackend);

  const cartItems = useCartStore((s) => s.items);
  const currentVendorId = useCartStore((s) => s.currentVendorId);
  const currentVendorName = useCartStore((s) => s.currentVendorName);
  const addItemToCart = useCartStore((s) => s.addItem);
  const incrementCart = useCartStore((s) => s.incrementItem);
  const decrementCart = useCartStore((s) => s.decrementItem);
  const getItemQuantity = useCartStore((s) => s.getItemQuantity);

  const currentAddress = useLocationStore((s) => s.currentAddress);
  const displayAddress = currentAddress?.streetArea || currentAddress?.houseNo || 'Vijay Nagar, Indore';

  // Live real catalogue products loaded directly from Supabase DB
  const [liveRecommendations, setLiveRecommendations] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load live real items from backend
  const loadData = useCallback(async () => {
    try {
      await syncWishlist();
      const dbItems: CatalogueItem[] = await dusmintApi.getAllItems();
      if (dbItems && dbItems.length > 0) {
        const mapped: WishlistProduct[] = dbItems.map((item) => {
          const priceRupees = Math.round(item.pricePaise / 100);
          const mrpRupees = item.mrpPaise ? Math.round(item.mrpPaise / 100) : Math.round(priceRupees * 1.25);
          const discount = item.mrpPaise && item.mrpPaise > item.pricePaise
            ? Math.round(((item.mrpPaise - item.pricePaise) / item.mrpPaise) * 100)
            : 15;

          return {
            ...item,
            deliveryMins: '9 MINS',
            rating: 4.8,
            discountPercent: discount,
          };
        });

        setLiveRecommendations(mapped);
      }
    } catch (e) {
      console.warn('Live items sync notice:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [syncWishlist]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  const handleClearAll = () => {
    if (wishlistItems.length === 0) return;
    Alert.alert(
      'Clear Wishlist',
      'Are you sure you want to remove all saved items from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearWishlist },
      ]
    );
  };

  const handleAddToCart = (product: WishlistProduct) => {
    const targetVendorId = product.vendorId || 's1';
    const targetVendorName = product.vendorName || 'Local Partner Store';

    if (cartItems.length > 0 && currentVendorId && currentVendorId !== targetVendorId) {
      const existingVendorName = currentVendorName || 'another store';
      Alert.alert(
        'Replace cart items?',
        `Your cart contains items from ${existingVendorName}. Do you want to discard them and add items from ${targetVendorName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace Cart',
            style: 'destructive',
            onPress: () => {
              useCartStore.getState().clearCart();
              addItemToCart(product);
            },
          },
        ]
      );
      return;
    }

    addItemToCart(product);
  };

  const handleMoveAllToCart = () => {
    if (wishlistItems.length === 0) return;
    const firstItem = wishlistItems[0];
    const targetVendorId = firstItem.vendorId || 's1';
    const targetVendorName = firstItem.vendorName || 'Local Partner Store';

    const executeAdd = () => {
      let addedCount = 0;
      wishlistItems.forEach((item) => {
        if (item.isInStock && (item.vendorId || 's1') === targetVendorId) {
          addItemToCart(item);
          addedCount++;
        }
      });

      Alert.alert(
        'Items Added to Cart',
        `${addedCount} items from ${targetVendorName} moved to your cart. Ready for 9-minute instant delivery!`,
        [
          { text: 'Keep Browsing', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
        ]
      );
    };

    if (cartItems.length > 0 && currentVendorId && currentVendorId !== targetVendorId) {
      const existingVendorName = currentVendorName || 'another store';
      Alert.alert(
        'Replace cart items?',
        `Your cart contains items from ${existingVendorName}. Do you want to discard them and add items from ${targetVendorName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace Cart',
            style: 'destructive',
            onPress: () => {
              useCartStore.getState().clearCart();
              executeAdd();
            },
          },
        ]
      );
      return;
    }

    executeAdd();
  };

  const renderProductCard = useCallback(
    (product: WishlistProduct, isFromWishlist: boolean) => {
      const priceRupees = Math.round(product.pricePaise / 100);
      const mrpRupees = product.mrpPaise ? Math.round(product.mrpPaise / 100) : Math.round(priceRupees * 1.25);
      const discount = product.discountPercent || (mrpRupees > priceRupees ? Math.round(((mrpRupees - priceRupees) / mrpRupees) * 100) : 0);
      const quantityInCart = getItemQuantity(product.id);
      const isItemWishlisted = isFromWishlist || wishlistItems.some((i) => i.id === product.id);

      return (
        <View key={product.id} style={styles.card}>
          {/* Top Image Box */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: product.photoUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400' }}
              style={styles.productImage}
              resizeMode="contain"
            />

            {/* Discount Badge */}
            {discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discount}% OFF</Text>
              </View>
            )}

            {/* Top Right Heart/Bookmark Button */}
            <TouchableOpacity
              style={[styles.heartButton, isItemWishlisted && styles.heartButtonActive]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => {
                if (isItemWishlisted) {
                  removeItem(product.id);
                } else {
                  addItemToWishlist(product);
                }
              }}
            >
              <Ionicons
                name={isItemWishlisted ? 'heart' : 'heart-outline'}
                size={16}
                color={isItemWishlisted ? '#E11D48' : '#6B7280'}
              />
            </TouchableOpacity>

            {/* Delivery tag pill */}
            <View style={styles.deliveryTag}>
              <Ionicons name="flash" size={10} color="#047A36" style={{ marginRight: 2 }} />
              <Text style={styles.deliveryText}>{product.deliveryMins || '9 MINS'}</Text>
            </View>
          </View>

          {/* Product Info */}
          <View style={styles.cardInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.nameEn}
            </Text>
            <Text style={styles.unitText}>{product.unit}</Text>

            {/* Price & Add Row */}
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceText}>₹{priceRupees}</Text>
                {mrpRupees > priceRupees && (
                  <Text style={styles.mrpText}>₹{mrpRupees}</Text>
                )}
              </View>

              {/* Add / Stepper Button */}
              {quantityInCart === 0 ? (
                <TouchableOpacity
                  style={styles.addBtn}
                  activeOpacity={0.8}
                  onPress={() => handleAddToCart(product)}
                >
                  <Text style={styles.addBtnText}>ADD</Text>
                  <Ionicons name="add" size={14} color="#047A36" style={{ marginLeft: 2 }} />
                </TouchableOpacity>
              ) : (
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    activeOpacity={0.7}
                    onPress={() => decrementCart(product.id)}
                  >
                    <Ionicons name="remove" size={14} color="#047A36" />
                  </TouchableOpacity>
                  <Text style={styles.stepperQty}>{quantityInCart}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    activeOpacity={0.7}
                    onPress={() => incrementCart(product.id)}
                  >
                    <Ionicons name="add" size={14} color="#047A36" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      );
    },
    [getItemQuantity, addItemToCart, incrementCart, decrementCart, removeItem, addItemToWishlist, wishlistItems, handleAddToCart]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* Sticky Instamart Header */}
      <View style={[styles.headerContainer, { paddingTop: statusBarHeight }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>My Wishlist</Text>
          {wishlistItems.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{wishlistItems.length}</Text>
            </View>
          )}

          {wishlistItems.length > 0 && (
            <TouchableOpacity
              style={styles.actionIconBtn}
              onPress={handleClearAll}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={19} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#047A36']} />
        }
      >
        {loading && wishlistItems.length === 0 ? (
          <View style={{ paddingTop: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#047A36" />
            <Text style={{ fontFamily: 'PlusJakartaSans-Medium', color: '#64748B', marginTop: 12 }}>
              Loading saved items...
            </Text>
          </View>
        ) : wishlistItems.length > 0 ? (
          /* 1. If Wishlist Has Items (Real Saved Items) */
          <>
            {/* Quick Action Strip (Instamart Style) */}
            <View style={styles.quickActionStrip}>
              <View style={styles.lightningBox}>
                <Ionicons name="flash" size={15} color="#047A36" />
                <Text style={styles.stripDeliveryText}>Ready for quick delivery</Text>
              </View>
              <TouchableOpacity
                style={styles.moveAllBtn}
                onPress={handleMoveAllToCart}
                activeOpacity={0.8}
              >
                <Ionicons name="cart-outline" size={14} color="#047A36" style={{ marginRight: 4 }} />
                <Text style={styles.moveAllText}>Add All to Cart</Text>
              </TouchableOpacity>
            </View>

            {/* 2-Column Product Grid */}
            <View style={styles.productsGrid}>
              {wishlistItems.map((item) => renderProductCard(item, true))}
            </View>
          </>
        ) : (
          /* 2. Empty Wishlist State */
          <>
            {/* Top Empty State Hero Card */}
            <View style={styles.emptySection}>
              <Text style={styles.caption}>SAVED ITEMS</Text>
              <View style={styles.emptyCard}>
                <Ionicons name="heart-outline" size={38} color="#94A3B8" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>No saved items yet</Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => navigation.navigate('HomeTab')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyActionBtnText}>Explore Fresh Store</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Live Recommended Section - Professional 2-Column Instamart Grid */}
            {liveRecommendations.length > 0 && (
              <View style={styles.recommendedSection}>
                <View style={styles.recommendedHeaderRow}>
                  <View style={styles.badgeRow}>
                    <View style={styles.fireBadge}>
                      <Ionicons name="flame" size={13} color="#EA580C" />
                      <Text style={styles.fireBadgeText}>TRENDING</Text>
                    </View>
                    <Text style={styles.recommendedTitle}>Popular Mandi Essentials</Text>
                  </View>
                  <Text style={styles.recommendedSubtitle}>
                    Frequently ordered fresh items near you • 9-min delivery
                  </Text>
                </View>

                {/* 2-Column Balanced Grid */}
                <View style={styles.productsGrid}>
                  {liveRecommendations.slice(0, 8).map((item) => renderProductCard(item, false))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Bottom padding to clear sticky bar */}
        <View style={{ height: cartItems.length > 0 ? 110 : 40 }} />
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      <CartStickyBar onPressViewCart={() => navigation.navigate('Cart')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: '#0F172A',
  },
  countBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  countText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: '#047A36',
  },
  headerSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  scrollBody: {
    paddingTop: 14,
    paddingHorizontal: 16,
  },
  quickActionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lightningBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stripDeliveryText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#0F172A',
    marginLeft: 6,
  },
  moveAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  moveAllText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: '#047A36',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 128,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '85%',
    height: '85%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 9.5,
    color: '#FFFFFF',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 5,
  },
  heartButtonActive: {
    backgroundColor: '#FFF1F2',
  },
  deliveryTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  deliveryText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 9,
    color: '#047A36',
  },
  cardInfo: {
    padding: 10,
  },
  productName: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 18,
    minHeight: 36,
  },
  unitText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    color: '#0F172A',
  },
  mrpText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 10.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.2,
    borderColor: '#0055FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  addBtnText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: '#047A36',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: '#0055FF',
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  stepperBtn: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  stepperQty: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#047A36',
    minWidth: 16,
    textAlign: 'center',
  },
  emptySection: {
    marginTop: 6,
    marginBottom: 20,
  },
  caption: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#777777',
    marginBottom: 8,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  emptyTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 16,
  },
  emptyActionBtn: {
    backgroundColor: '#047A36',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 22,
  },
  emptyActionBtnText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#FFFFFF',
  },
  recommendedSection: {
    width: '100%',
    marginBottom: 16,
  },
  recommendedHeaderRow: {
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fireBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    gap: 2,
  },
  fireBadgeText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 9.5,
    color: '#EA580C',
    letterSpacing: 0.4,
  },
  recommendedTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: '#0F172A',
  },
  recommendedSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});

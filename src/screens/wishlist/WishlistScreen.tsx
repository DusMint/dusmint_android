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
import { useWishlistStore, WishlistProduct, WishlistShop } from '../../state/useWishlistStore';
import { useCartStore } from '../../state/useCartStore';
import { useLocationStore } from '../../state/useLocationStore';
import { CartStickyBar } from '../../ui/components/CartStickyBar';
import { useDropAnimationStore } from '../../state/useDropAnimationStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

interface Props {
  navigation: any;
}

export const WishlistScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;

  const [activeTab, setActiveTab] = useState<'items' | 'shops'>('items');

  const wishlistItems = useWishlistStore((s) => s.items);
  const wishlistShops = useWishlistStore((s) => s.shops);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const removeShop = useWishlistStore((s) => s.removeShop);
  const addItemToWishlist = useWishlistStore((s) => s.addItem);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const clearShops = useWishlistStore((s) => s.clearShops);
  const syncWishlist = useWishlistStore((s) => s.syncFromBackend);

  const cartItems = useCartStore((s) => s.items);
  const currentVendorId = useCartStore((s) => s.currentVendorId);
  const currentVendorName = useCartStore((s) => s.currentVendorName);
  const addItemToCart = useCartStore((s) => s.addItem);
  const incrementCart = useCartStore((s) => s.incrementItem);
  const decrementCart = useCartStore((s) => s.decrementItem);
  const getItemQuantity = useCartStore((s) => s.getItemQuantity);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      await syncWishlist();
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
    if (activeTab === 'items') {
      if (wishlistItems.length === 0) return;
      Alert.alert(
        'Clear Wishlist Items',
        'Are you sure you want to remove all saved items from your wishlist?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear All', style: 'destructive', onPress: clearWishlist },
        ]
      );
    } else {
      if (wishlistShops.length === 0) return;
      Alert.alert(
        'Clear Wishlist Shops',
        'Are you sure you want to remove all saved shops from your wishlist?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear All', style: 'destructive', onPress: clearShops },
        ]
      );
    }
  };

  const handleAddToCart = (product: WishlistProduct, e?: any) => {
    const pageX = e?.nativeEvent?.pageX;
    const pageY = e?.nativeEvent?.pageY;
    useDropAnimationStore.getState().triggerDrop({
      startX: pageX,
      startY: pageY,
      imageUrl: product.photoUrl,
    });

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
    (product: WishlistProduct) => {
      const priceRupees = Math.round(product.pricePaise / 100);
      const mrpRupees = product.mrpPaise ? Math.round(product.mrpPaise / 100) : Math.round(priceRupees * 1.25);
      const discount = product.discountPercent || (mrpRupees > priceRupees ? Math.round(((mrpRupees - priceRupees) / mrpRupees) * 100) : 0);
      const quantityInCart = getItemQuantity(product.id);

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

            {/* Top Right Heart: Remove Item singularly */}
            <TouchableOpacity
              style={[styles.heartButton, styles.heartButtonActive]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => removeItem(product.id)}
            >
              <Ionicons name="heart" size={16} color="#E11D48" />
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
                  onPress={(e) => handleAddToCart(product, e)}
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
                    onPress={(e) => {
                      const pageX = e?.nativeEvent?.pageX;
                      const pageY = e?.nativeEvent?.pageY;
                      useDropAnimationStore.getState().triggerDrop({
                        startX: pageX,
                        startY: pageY,
                        imageUrl: product.photoUrl,
                      });
                      incrementCart(product.id);
                    }}
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
    [getItemQuantity, addItemToCart, incrementCart, decrementCart, removeItem]
  );

  const renderShopCard = (shop: WishlistShop) => {
    return (
      <TouchableOpacity
        key={shop.id}
        style={styles.shopCard}
        onPress={() => navigation.navigate('ShopDetail', { shop })}
        activeOpacity={0.92}
      >
        <View style={styles.shopImageContainer}>
          <Image
            source={{
              uri:
                shop.bannerPhotoUrl ||
                'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
            }}
            style={styles.shopHeroImage}
            resizeMode="cover"
          />

          {/* Heart button to unfavorite shop */}
          <TouchableOpacity
            style={styles.shopHeartBtn}
            onPress={(e) => {
              e.stopPropagation();
              removeShop(shop.id);
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="heart" size={18} color="#E11D48" />
          </TouchableOpacity>
        </View>

        <View style={styles.shopBody}>
          <View style={styles.shopTitleRow}>
            <Text style={styles.shopName} numberOfLines={1}>
              {shop.shopName}
            </Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
              <Text style={styles.ratingText}>
                {shop.score ? Number(shop.score).toFixed(1) : '4.8'}
              </Text>
            </View>
          </View>

          <View style={styles.shopMetaRow}>
            <View style={styles.etaPill}>
              <Ionicons name="flash" size={11} color="#047A36" style={{ marginRight: 3 }} />
              <Text style={styles.etaText}>{shop.deliveryTimeMins || 12} mins</Text>
            </View>
            <Text style={styles.bulletSeparator}>•</Text>
            <Ionicons name="location-outline" size={12} color="#64748B" />
            <Text style={styles.distanceMeta}>
              {shop.distanceKm ? `${Number(shop.distanceKm).toFixed(2)} km` : '0.40 km'}
            </Text>
            <Text style={styles.bulletSeparator}>•</Text>
            <Text style={styles.areaMeta}>{shop.areaName || 'Main Market'}</Text>
          </View>

          <View style={styles.shopActionRow}>
            <TouchableOpacity
              style={styles.exploreStoreBtn}
              onPress={() => navigation.navigate('ShopDetail', { shop })}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreStoreText}>Explore Store</Text>
              <Ionicons name="arrow-forward" size={13} color="#047A36" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const totalWishlistCount = activeTab === 'items' ? wishlistItems.length : wishlistShops.length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* Header Bar */}
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
          {totalWishlistCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{totalWishlistCount}</Text>
            </View>
          )}

          <View style={{ flex: 1 }} />

          {totalWishlistCount > 0 && (
            <TouchableOpacity
              style={styles.actionIconBtn}
              onPress={handleClearAll}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={19} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Dual Tab Switcher: Items & Shops */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'items' && styles.tabButtonActive]}
            onPress={() => setActiveTab('items')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={activeTab === 'items' ? 'bag' : 'bag-outline'}
              size={15}
              color={activeTab === 'items' ? '#FFFFFF' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabButtonText, activeTab === 'items' && styles.tabButtonTextActive]}>
              Items ({wishlistItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'shops' && styles.tabButtonActive]}
            onPress={() => setActiveTab('shops')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={activeTab === 'shops' ? 'storefront' : 'storefront-outline'}
              size={15}
              color={activeTab === 'shops' ? '#FFFFFF' : '#64748B'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabButtonText, activeTab === 'shops' && styles.tabButtonTextActive]}>
              Shops ({wishlistShops.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#047A36']} />
        }
      >
        {activeTab === 'items' ? (
          // ===================== ITEMS TAB =====================
          loading && wishlistItems.length === 0 ? (
            <View style={{ paddingTop: 60, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#047A36" />
              <Text style={{ fontFamily: 'PlusJakartaSans-Medium', color: '#64748B', marginTop: 12 }}>
                Loading saved items...
              </Text>
            </View>
          ) : wishlistItems.length > 0 ? (
            <>
              {/* Quick Action Strip */}
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
                {wishlistItems.map((item) => renderProductCard(item))}
              </View>
            </>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.caption}>SAVED ITEMS</Text>
              <View style={styles.emptyCard}>
                <Ionicons name="heart-outline" size={38} color="#94A3B8" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>No saved items yet</Text>
                <Text style={styles.emptySubtitle}>Tap the heart on any product to save it here.</Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => navigation.navigate('HomeTab')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyActionBtnText}>Explore Fresh Store</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        ) : (
          // ===================== SHOPS TAB =====================
          wishlistShops.length > 0 ? (
            <View style={styles.shopsList}>
              {wishlistShops.map((shop) => renderShopCard(shop))}
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.caption}>SAVED SHOPS</Text>
              <View style={styles.emptyCard}>
                <Ionicons name="storefront-outline" size={38} color="#94A3B8" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>No saved shops yet</Text>
                <Text style={styles.emptySubtitle}>Tap the heart inside any store to bookmark it here.</Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => navigation.navigate('HomeTab')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyActionBtnText}>Explore Nearby Stores</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        )}

        {/* Bottom padding to clear sticky bar */}
        <View style={{ height: cartItems.length > 0 ? 110 : 40 }} />
      </ScrollView>

      {/* Floating Bottom Cart Pill (Centered at standard raised position) */}
      {cartItems.length > 0 && (
        <View
          style={[
            styles.floatingCartContainer,
            { bottom: Math.max(insets.bottom, 16) + 28 },
          ]}
        >
          <CartStickyBar onPressViewCart={() => navigation.navigate('Cart')} />
        </View>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBar: {
    height: 52,
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
    marginRight: 10,
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
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSwitcher: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  tabButtonActive: {
    backgroundColor: '#047A36',
  },
  tabButtonText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#64748B',
  },
  tabButtonTextActive: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deliveryText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 9.5,
    color: '#047A36',
  },
  cardInfo: {
    padding: 10,
  },
  productName: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12.5,
    color: '#0F172A',
    lineHeight: 17,
    minHeight: 34,
  },
  unitText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: '#0F172A',
  },
  mrpText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 10,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#047A36',
    backgroundColor: '#FFFFFF',
  },
  addBtnText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11.5,
    color: '#047A36',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#047A36',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    gap: 6,
  },
  stepperBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQty: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11.5,
    color: '#0F172A',
    minWidth: 12,
    textAlign: 'center',
  },

  // Shops List Styles
  shopsList: {
    gap: 14,
  },
  shopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 14,
  },
  shopImageContainer: {
    width: '100%',
    height: 125,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  shopHeroImage: {
    width: '100%',
    height: '100%',
  },
  shopHeartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  shopBody: {
    padding: 12,
  },
  shopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  shopName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#047A36',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  shopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  etaText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    color: '#047A36',
  },
  bulletSeparator: {
    marginHorizontal: 6,
    color: '#94A3B8',
    fontSize: 10,
  },
  distanceMeta: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11.5,
    color: '#64748B',
    marginLeft: 2,
  },
  areaMeta: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11.5,
    color: '#64748B',
  },
  shopActionRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  exploreStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  exploreStoreText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    color: '#047A36',
  },

  // Empty Section Styles
  emptySection: {
    paddingTop: 10,
  },
  caption: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#777777',
    marginBottom: 8,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyActionBtn: {
    backgroundColor: '#047A36',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  emptyActionBtnText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },

  // Floating Cart Container
  floatingCartContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
});

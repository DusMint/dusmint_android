import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Linking,
  ActivityIndicator,
  Alert,
  Dimensions,
  Share,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { VendorShop, CatalogueItem } from '../../api-client/types';
import { dusmintApi } from '@dusmint/api-client';
import { CartStickyBar } from '../../ui/components/CartStickyBar';
import { useDropAnimationStore } from '../../state/useDropAnimationStore';
import { useCartStore } from '../../state/useCartStore';
import { useWishlistStore } from '../../state/useWishlistStore';
import { LOCAL_SHOPS } from '../home/data/homeData';
import { AppTypography, AppTextColors } from '../../ui/theme/appTypography';
import { subscribeVendorInventory } from '../../services/realtimeInventory';

type Props = NativeStackScreenProps<RootStackParamList, 'VendorShop'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - 32 - 12) / 2);

export const ShopDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { vendorId, shop: initialShop } = route.params;

  // 1. Resolve Shop Details
  const shop: VendorShop = useMemo(() => {
    if (initialShop) return initialShop;
    const found = LOCAL_SHOPS.find((s) => s.id === vendorId);
    if (found) return found;
    return {
      id: vendorId,
      clusterId: 'cluster-indore-1',
      shopName: 'Local Dukandar Partner',
      ownerName: 'Store Owner',
      ownerPhone: '+91 98260 12345',
      category: 'groceries',
      addressText: 'Main Market, Burhanpur',
      areaName: 'Main Market',
      score: 4.8,
      isOpen: true,
      bannerPhotoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
      totalDeliveredOrders: 210,
      deliveryTimeMins: 15,
      distanceKm: 0.8,
      offersText: '20% OFF UP TO ₹50',
      tags: ['Local Partner', 'FSSAI Verified'],
    };
  }, [vendorId, initialShop]);

  // 2. State
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // 3. Cart Store state & actions
  const cartItems = useCartStore((s) => s.items);
  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());
  const addItem = useCartStore((s) => s.addItem);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const clearCart = useCartStore((s) => s.clearCart);

  // 4. Fetch Vendor's real catalog items (no dummy product fallback)
  const [refreshing, setRefreshing] = useState(false);

  const loadShopItems = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const liveItems = await dusmintApi.getCatalogueItems(vendorId);
      setItems(Array.isArray(liveItems) ? liveItems : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [vendorId]);

  useFocusEffect(
    useCallback(() => {
      loadShopItems();
    }, [loadShopItems])
  );

  // 4b. Lightweight real-time inventory sync while viewing this store
  useEffect(() => {
    if (!vendorId) return;
    return subscribeVendorInventory(
      vendorId,
      ({ action, item }) => {
        if (!item?.id) return;
        setItems((prev) => {
          if (action === 'deleted') {
            return prev.filter((i) => i.id !== item.id);
          }
          const exists = prev.some((i) => i.id === item.id);
          if (exists) {
            return prev.map((i) =>
              i.id === item.id ? { ...i, ...(item as Partial<CatalogueItem>) } : i
            );
          }
          if (action === 'added') {
            return [item as CatalogueItem, ...prev];
          }
          return prev;
        });
      },
      () => {
        loadShopItems();
      }
    );
  }, [vendorId, loadShopItems]);

  // 5. Partner-aligned Categories: Strictly All, Vegetables, Fruits, Meat, Dairy
  const categoriesList = useMemo(
    () => ['All', 'Vegetables', 'Fruits', 'Meat', 'Dairy'],
    []
  );

  // 6. Filtered Items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const catName = (item.categoryName || '').trim().toLowerCase();
      const targetCat = selectedCategory.toLowerCase();
      const matchesCat =
        selectedCategory === 'All' ||
        catName === targetCat ||
        catName.includes(targetCat) ||
        (targetCat === 'vegetables' && (catName === 'fresh' || catName === 'produce')) ||
        (targetCat === 'dairy' && catName === 'groceries');
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.nameEn.toLowerCase().includes(q) ||
        (item.nameHi && item.nameHi.includes(q));
      return matchesCat && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  // 7. Handle Add to Cart with Multi-Vendor conflict guard
  const handleAddToCart = useCallback(
    (item: CatalogueItem, e?: any) => {
      const pageX = e?.nativeEvent?.pageX;
      const pageY = e?.nativeEvent?.pageY;
      useDropAnimationStore.getState().triggerDrop({
        startX: pageX,
        startY: pageY,
        imageUrl: item.photoUrl,
      });
      if (cartItems.length > 0) {
        const existingVendorId = cartItems[0].item.vendorId;
        if (existingVendorId && existingVendorId !== item.vendorId) {
          const existingVendorName =
            cartItems[0].item.vendorName || 'another store';
          Alert.alert(
            'Replace cart items?',
            `Your cart contains items from ${existingVendorName}. Do you want to discard them and add items from ${shop.shopName}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Replace Cart',
                style: 'destructive',
                onPress: () => {
                  clearCart();
                  addItem(item);
                },
              },
            ]
          );
          return;
        }
      }
      addItem(item);
    },
    [cartItems, shop.shopName, addItem, clearCart]
  );

  // 8. Phone call handler
  const handleCallShop = () => {
    if (shop.ownerPhone) {
      const cleanPhone = shop.ownerPhone.replace(/\s+/g, '');
      Linking.openURL(`tel:${cleanPhone}`);
    }
  };

  // 9. Share Shop Handler
  const isShopWishlisted = useWishlistStore((s) => s.isShopWishlisted(shop.id));
  const toggleWishlistShop = useWishlistStore((s) => s.toggleShop);

  const handleToggleWishlistShop = () => {
    toggleWishlistShop({
      id: shop.id,
      shopName: shop.shopName,
      areaName: shop.areaName,
      distanceKm: shop.distanceKm,
      deliveryTimeMins: shop.deliveryTimeMins,
      score: shop.score,
      ratingCount: shop.ratingCount,
      bannerPhotoUrl: shop.bannerPhotoUrl,
      category: shop.category,
      address: (shop as any).address || shop.areaName,
      isOpen: shop.isOpen,
    });
  };

  const handleShareShop = async () => {
    try {
      await Share.share({
        message: `Order fresh groceries & daily staples from ${shop.shopName} on DusMint in 10 mins!`,
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadShopItems(true);
            }}
            colors={['#047A36']}
          />
        }
      >
        {/* Top Shop Photo Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{
              uri:
                shop.bannerPhotoUrl ||
                'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
            }}
            style={styles.bannerImage}
            resizeMode="cover"
          />

          {/* Top Floating Buttons inside Banner (scrolls with banner) */}
          <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 14) }]}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <TouchableOpacity
              style={styles.iconCircle}
              onPress={handleShareShop}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social-outline" size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Store Header overlapping banner bottom */}
        <View style={styles.storeHeaderSection}>
          <View style={styles.titleAndRatingRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.storeTitle} numberOfLines={1}>
                {shop.shopName}
              </Text>
              <View style={styles.metaRow}>
                <View style={styles.etaBadgePill}>
                  <Ionicons name="flash" size={11} color="#047A36" style={{ marginRight: 3 }} />
                  <Text style={styles.etaBadgeText}>
                    {shop.deliveryTimeMins || 12} mins
                  </Text>
                </View>
                <Text style={styles.bulletSeparator}>•</Text>
                <Ionicons name="location-outline" size={13} color="#64748B" />
                <Text style={styles.metaText}>
                  {shop.distanceKm ? `${shop.distanceKm} km` : '0.4 km'}
                </Text>
                <Text style={styles.bulletSeparator}>•</Text>
                <Text style={styles.areaText}>
                  {shop.areaName || 'Main Market'}
                </Text>
              </View>
            </View>

            {/* Rating Box on Top Right */}
            <View style={styles.ratingBox}>
              <View style={styles.ratingBadgePill}>
                <Ionicons name="star" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                <Text style={styles.ratingScore}>
                  {shop.score ? Number(shop.score).toFixed(1) : '4.8'}
                </Text>
              </View>
              <Text style={styles.ratingCountSubText}>
                {shop.ratingCount || 340} ratings
              </Text>
            </View>
          </View>
        </View>

        {/* In-Store Search Bar */}
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={18} color="#047A36" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search in ${shop.shopName}...`}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Horizontal Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsContainer}
        >
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Header */}
        <View style={styles.catalogSectionHeader}>
          <Text style={styles.catalogTitle}>
            {selectedCategory === 'All' ? 'Top Picks & Store Items' : selectedCategory}
          </Text>
          <Text style={styles.itemsCountText}>
            {filteredItems.length} items
          </Text>
        </View>

        {/* Loading Spinner */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#16A34A" />
            <Text style={styles.loadingText}>Loading store items...</Text>
          </View>
        )}

        {/* 1-PER-ROW CLEAN PRODUCT LIST */}
        {!loading && (
          <View style={styles.itemListContainer}>
            {filteredItems.length === 0 ? (
              <View style={{ paddingVertical: 48, alignItems: 'center' }}>
                <Ionicons name="basket-outline" size={32} color="#0F172A" style={{ marginBottom: 10 }} />
                <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 15, color: '#0F172A' }}>
                  No items available
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, color: '#64748B', marginTop: 4 }}>
                  Items added by {shop.shopName} will appear here.
                </Text>
              </View>
            ) : (
              filteredItems.map((item) => {
              const inCart = cartItems.find((ci) => ci.item.id === item.id);
              const quantity = inCart ? inCart.quantity : 0;
              const price = Math.round(item.pricePaise / 100);
              const mrp = item.mrpPaise ? Math.round(item.mrpPaise / 100) : null;
              const isAvailable = item.isInStock !== false;

              return (
                <View key={item.id} style={[styles.itemRowCard, !isAvailable && { opacity: 0.6 }]}>
                  <Image
                    source={{
                      uri:
                        item.photoUrl ||
                        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
                    }}
                    style={styles.itemRowPhoto}
                    resizeMode="cover"
                  />

                  <View style={styles.itemRowInfo}>
                    <View style={styles.nameRow}>
                      <View style={styles.vegDotBorder}>
                        <View style={styles.vegDotInner} />
                      </View>
                      <Text style={styles.productTitle} numberOfLines={2}>
                        {item.nameEn}
                      </Text>
                    </View>

                    <Text style={styles.productUnit}>{item.unit}</Text>

                    <View style={styles.priceContainer}>
                      <Text style={styles.priceRowText}>₹{price}</Text>
                      {mrp && mrp > price && (
                        <Text style={styles.mrpStrikeText}>₹{mrp}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.itemRowAction}>
                    {!isAvailable ? (
                      <View style={{ paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, backgroundColor: '#F1F5F9' }}>
                        <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans-Medium', color: '#64748B' }}>
                          Out of stock
                        </Text>
                      </View>
                    ) : quantity === 0 ? (
                      <TouchableOpacity
                        style={styles.rowAddButton}
                        onPress={(e) => handleAddToCart(item, e)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.rowAddText}>Add</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.rowCounterPill}>
                        <TouchableOpacity
                          style={styles.counterActionBtn}
                          onPress={() => decrementItem(item.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="remove" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.floatingCounterText}>{quantity}</Text>
                        <TouchableOpacity
                          style={styles.counterActionBtn}
                          onPress={(e) => {
                            const pageX = e?.nativeEvent?.pageX;
                            const pageY = e?.nativeEvent?.pageY;
                            useDropAnimationStore.getState().triggerDrop({
                              startX: pageX,
                              startY: pageY,
                              imageUrl: item.photoUrl,
                            });
                            incrementItem(item.id);
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="add" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Category Quick Jump Modal */}
      {showCategoryModal && (
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalDismissArea}
            onPress={() => setShowCategoryModal(false)}
            activeOpacity={1}
          />
          <View
            style={[
              styles.modalSheet,
              { paddingBottom: Math.max(insets.bottom, 16) + 10 },
            ]}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Store Categories</Text>
            {categoriesList.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.modalCategoryRow,
                  selectedCategory === cat && styles.modalCategoryRowActive,
                ]}
                onPress={() => {
                  setSelectedCategory(cat);
                  setShowCategoryModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalCategoryText,
                    selectedCategory === cat && styles.modalCategoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
                {selectedCategory === cat && (
                  <Ionicons name="checkmark-circle" size={18} color="#15803D" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Floating Bottom Cart Pill */}
      {totalItemsCount > 0 && (
        <View
          style={[
            styles.floatingCartContainer,
            { bottom: Math.max(insets.bottom, 16) + 28 },
          ]}
        >
          <CartStickyBar
            totalItems={totalItemsCount}
            totalPaise={totalPaise}
            onPressViewCart={() => navigation.navigate('Cart')}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  topBarTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#0F172A',
    flex: 1,
    marginHorizontal: 10,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 0,
  },
  bannerContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#E2E8F0',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  storeHeaderSection: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -22,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 14,
  },
  titleAndRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  storeTitle: {
    fontSize: 22,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  etaBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  etaBadgeText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#047A36',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    ...AppTypography.cardMeta,
    marginLeft: 3,
  },
  bulletSeparator: {
    fontSize: 11,
    color: AppTextColors.tertiary,
    marginHorizontal: 6,
  },
  areaText: {
    ...AppTypography.cardMeta,
  },
  ratingBox: {
    alignItems: 'flex-end',
  },
  ratingBadgePill: {
    backgroundColor: '#15803D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  ratingScore: {
    ...AppTypography.ratingText,
  },
  ratingCountSubText: {
    ...AppTypography.cardMeta,
    fontSize: 10.5,
    marginTop: 2,
  },
  valuePropositionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 10,
  },
  valueIconBox: {
    marginRight: 8,
  },
  valueTextBox: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#92400E',
  },
  valueSubtitle: {
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#B45309',
    marginTop: 1,
  },
  offerBannerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  offerBannerText: {
    ...AppTypography.offerText,
    flex: 1,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  categoryPillsContainer: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  categoryPill: {
    paddingHorizontal: 13,
    paddingVertical: 6.5,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#047A36',
    borderColor: '#047A36',
  },
  itemListContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  itemRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemRowPhoto: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  itemRowInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  priceRowText: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#0F172A',
    marginRight: 6,
  },
  itemRowAction: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rowAddButton: {
    paddingHorizontal: 18,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#047A36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowAddText: {
    fontSize: 13.5,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#047A36',
  },
  rowCounterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 10,
    backgroundColor: '#047A36',
    paddingHorizontal: 6,
    gap: 8,
  },
  categoryPillText: {
    ...AppTypography.chipText,
  },
  categoryPillTextActive: {
    ...AppTypography.chipTextActive,
    color: '#FFFFFF',
  },
  catalogSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  catalogTitle: {
    ...AppTypography.cardTitle,
  },
  itemsCountText: {
    ...AppTypography.cardMeta,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  twoColumnGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  photoContainer: {
    width: '100%',
    height: 132,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  productPhoto: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountBadgeText: {
    ...AppTypography.badgeText,
    color: '#FFFFFF',
    fontSize: 9,
  },
  floatingAddWrapper: {
    position: 'absolute',
    bottom: -13,
    right: 8,
    zIndex: 10,
  },
  floatingAddButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#15803D',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  floatingAddText: {
    ...AppTypography.buttonText,
    fontSize: 12,
    color: '#15803D',
  },
  floatingCounterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803D',
    borderRadius: 14,
    paddingHorizontal: 5,
    paddingVertical: 3.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 3,
    gap: 6,
  },
  counterActionBtn: {
    padding: 2,
  },
  floatingCounterText: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
  },
  cardInfoBody: {
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  vegDotBorder: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: '#16A34A',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 5,
    flexShrink: 0,
  },
  vegDotInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
  },
  productTitle: {
    ...AppTypography.cardTitle,
    fontSize: 13,
    lineHeight: 17,
    flex: 1,
  },
  productUnit: {
    ...AppTypography.cardMeta,
    fontSize: 11,
    marginTop: 3,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  pricePill: {
    backgroundColor: '#DCFCE7',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
  },
  pricePillText: {
    ...AppTypography.priceText,
    fontSize: 12,
    color: '#15803D',
  },
  mrpStrikeText: {
    ...AppTypography.mrpText,
    fontSize: 11,
    marginLeft: 6,
  },
  floatingMenuBtn: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    gap: 5,
  },
  floatingMenuText: {
    ...AppTypography.buttonText,
    fontSize: 12.5,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#0F172A',
    marginBottom: 12,
  },
  modalCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalCategoryRowActive: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modalCategoryText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#334155',
  },
  modalCategoryTextActive: {
    color: '#15803D',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  floatingCartContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  floatingCartBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#15803D',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cartItemsCount: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans-Medium',
    letterSpacing: 0.5,
  },
  cartTotalAmount: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 9,
    gap: 5,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontFamily: 'PlusJakartaSans-Medium',
  },
});

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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { VendorShop, CatalogueItem } from '../../api-client/types';
import { dusmintApi } from '@dusmint/api-client';
import { useCartStore } from '../../state/useCartStore';
import { LOCAL_SHOPS, DUMMY_PRODUCTS } from '../home/data/homeData';
import { AppTypography, AppTextColors } from '../../ui/theme/appTypography';

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

  // 4. Fetch Vendor's specific catalog items
  useEffect(() => {
    async function loadShopItems() {
      setLoading(true);
      try {
        const liveItems = await dusmintApi.getCatalogueItems(vendorId);
        if (liveItems && liveItems.length > 0) {
          setItems(liveItems);
        } else {
          // Fallback to rich local catalog tagged to this specific vendor
          const fallback = DUMMY_PRODUCTS.map((p, idx) => ({
            id: `${vendorId}-item-${idx}`,
            vendorId: vendorId,
            vendorName: shop.shopName,
            categoryId: p.category || 'cat-general',
            categoryName: p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'General',
            nameEn: p.name,
            nameHi: undefined,
            unit: p.quantityLabel || '1 kg',
            stepQuantity: 1,
            pricePaise: p.price * 100,
            mrpPaise: (p.mrp || Math.round(p.price * 1.25)) * 100,
            photoUrl: p.imageUrl,
            isInStock: true,
          }));
          setItems(fallback);
        }
      } catch (err) {
        const fallback = DUMMY_PRODUCTS.map((p, idx) => ({
          id: `${vendorId}-item-${idx}`,
          vendorId: vendorId,
          vendorName: shop.shopName,
          categoryId: p.category || 'cat-general',
          categoryName: p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'General',
          nameEn: p.name,
          nameHi: undefined,
          unit: p.quantityLabel || '1 kg',
          stepQuantity: 1,
          pricePaise: p.price * 100,
          mrpPaise: (p.mrp || Math.round(p.price * 1.25)) * 100,
          photoUrl: p.imageUrl,
          isInStock: true,
        }));
        setItems(fallback);
      } finally {
        setLoading(false);
      }
    }
    loadShopItems();
  }, [vendorId, shop.shopName]);

  // 5. Unique Categories inside this Shop
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.categoryName) set.add(i.categoryName);
    });
    return ['All', ...Array.from(set)];
  }, [items]);

  // 6. Filtered Items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCat =
        selectedCategory === 'All' || item.categoryName === selectedCategory;
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
    (item: CatalogueItem) => {
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
      {/* Top Floating App Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 14) }]}>
        <TouchableOpacity
          style={styles.iconCircle}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle} numberOfLines={1}>
          {shop.shopName}
        </Text>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={handleShareShop}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={18} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconCircle, { marginLeft: 8 }]}
            onPress={handleCallShop}
            activeOpacity={0.8}
          >
            <Ionicons name="call-outline" size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Compact Modern Store Info Card (Reference App Style) */}
        <View style={styles.storeHeaderSection}>
          <View style={styles.titleAndRatingRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.storeTitle} numberOfLines={1}>
                {shop.shopName}
              </Text>
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={13} color="#64748B" />
                <Text style={styles.metaText}>
                  {shop.deliveryTimeMins || 12} mins
                </Text>
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
          <Ionicons name="search" size={16} color="#94A3B8" />
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
            {filteredItems.map((item) => {
              const inCart = cartItems.find((ci) => ci.item.id === item.id);
              const quantity = inCart ? inCart.quantity : 0;
              const price = Math.round(item.pricePaise / 100);
              const mrp = item.mrpPaise ? Math.round(item.mrpPaise / 100) : null;

              return (
                <View key={item.id} style={styles.itemRowCard}>
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
                    {quantity === 0 ? (
                      <TouchableOpacity
                        style={styles.rowAddButton}
                        onPress={() => handleAddToCart(item)}
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
                          onPress={() => incrementItem(item.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="add" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
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

      {/* Floating Bottom Cart Bar */}
      {totalItemsCount > 0 && (
        <View
          style={[
            styles.floatingCartBar,
            { bottom: Math.max(insets.bottom, 12) + 6 },
          ]}
        >
          <View>
            <Text style={styles.cartItemsCount}>
              {totalItemsCount} {totalItemsCount === 1 ? 'ITEM' : 'ITEMS'}
            </Text>
            <Text style={styles.cartTotalAmount}>
              ₹{Math.round(totalPaise / 100)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewCartButton}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.85}
          >
            <Text style={styles.viewCartText}>View Cart</Text>
            <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingTop: 10,
  },
  storeHeaderSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  titleAndRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  storeTitle: {
    ...AppTypography.screenTitle,
    marginBottom: 4,
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
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    ...AppTypography.searchHint,
    fontSize: 13.5,
    color: '#0F172A',
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

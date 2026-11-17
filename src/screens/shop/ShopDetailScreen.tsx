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
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { VendorShop, CatalogueItem } from '../../api-client/types';
import { dusmintApi } from '@dusmint/api-client';
import { useCartStore } from '../../state/useCartStore';
import { LOCAL_SHOPS, DUMMY_PRODUCTS } from '../home/data/homeData';

type Props = NativeStackScreenProps<RootStackParamList, 'VendorShop'>;

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
            categoryId: p.categoryId || 'cat-general',
            categoryName: p.categoryTitle || 'General',
            nameEn: p.name,
            nameHi: p.nameHi,
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
        // Fallback on network delay
        const fallback = DUMMY_PRODUCTS.map((p, idx) => ({
          id: `${vendorId}-item-${idx}`,
          vendorId: vendorId,
          vendorName: shop.shopName,
          categoryId: p.categoryId || 'cat-general',
          categoryName: p.categoryTitle || 'General',
          nameEn: p.name,
          nameHi: p.nameHi,
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

  // 7. Handle Add to Cart with Zomato Multi-Vendor conflict guard
  const handleAddToCart = useCallback(
    (item: CatalogueItem) => {
      // Check if cart already has items from another vendor
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

  return (
    <View style={styles.container}>
      {/* Top Floating App Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity
          style={styles.iconCircle}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.topBarTitle} numberOfLines={1}>
          {shop.shopName}
        </Text>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={handleCallShop}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Banner */}
        <View style={styles.heroBannerContainer}>
          <Image
            source={{
              uri:
                shop.bannerPhotoUrl ||
                'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
        </View>

        {/* Shop Info Card (Zomato Style Floating Card) */}
        <View style={styles.shopMetaCard}>
          <View style={styles.metaHeaderRow}>
            <Text style={styles.storeTitle} numberOfLines={2}>
              {shop.shopName}
            </Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingBadgeText}>
                {shop.score ? Number(shop.score).toFixed(1) : '4.8'}
              </Text>
              <Ionicons name="star" size={12} color="#FFFFFF" style={{ marginLeft: 3 }} />
            </View>
          </View>

          {/* Delivery & Distance Meta */}
          <View style={styles.metaDetailsRow}>
            <Ionicons name="time-outline" size={15} color="#475569" />
            <Text style={styles.metaSubText}>
              {shop.deliveryTimeMins || 15}-{Number(shop.deliveryTimeMins || 15) + 5} mins
            </Text>
            <Text style={styles.dot}>•</Text>
            <Ionicons name="location-outline" size={15} color="#475569" />
            <Text style={styles.metaSubText}>
              {shop.distanceKm ? `${shop.distanceKm} km away` : 'Near you'}
            </Text>
          </View>

          {/* Shop Address & Phone Row */}
          <View style={styles.contactContainer}>
            <View style={styles.addressLeft}>
              <Ionicons name="storefront-outline" size={15} color="#64748B" />
              <Text style={styles.addressText} numberOfLines={2}>
                {shop.addressText}
              </Text>
            </View>

            {shop.ownerPhone && (
              <TouchableOpacity
                style={styles.directCallPill}
                onPress={handleCallShop}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={13} color="#FFFFFF" />
                <Text style={styles.directCallText}>Call</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Offer Banner */}
          {shop.offersText && (
            <View style={styles.offerBannerPill}>
              <MaterialCommunityIcons
                name="brightness-percent"
                size={16}
                color="#1D4ED8"
              />
              <Text style={styles.offerBannerText}>{shop.offersText}</Text>
            </View>
          )}
        </View>

        {/* In-Store Search Bar */}
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={18} color="#94A3B8" />
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

        {/* Category Horizontal Filter Pills */}
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

        {/* Catalog Items Header */}
        <View style={styles.catalogSectionHeader}>
          <Text style={styles.catalogTitle}>
            {selectedCategory === 'All'
              ? 'All Products'
              : selectedCategory}
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

        {/* Products List */}
        {!loading && (
          <View style={styles.productsGrid}>
            {filteredItems.map((item) => {
              const inCart = cartItems.find((ci) => ci.item.id === item.id);
              const quantity = inCart ? inCart.quantity : 0;
              const price = Math.round(item.pricePaise / 100);
              const mrp = item.mrpPaise ? Math.round(item.mrpPaise / 100) : null;
              const discount = mrp && mrp > price
                ? Math.round(((mrp - price) / mrp) * 100)
                : null;

              return (
                <View key={item.id} style={styles.productCard}>
                  {/* Image with discount badge */}
                  <View style={styles.productImageWrapper}>
                    <Image
                      source={{
                        uri:
                          item.photoUrl ||
                          'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
                      }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                    {discount && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>
                          {discount}% OFF
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Product Details */}
                  <View style={styles.productInfo}>
                    <View style={styles.vegIndicator}>
                      <View style={styles.vegDot} />
                    </View>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.nameEn}
                    </Text>
                    {item.nameHi && (
                      <Text style={styles.productNameHi} numberOfLines={1}>
                        {item.nameHi}
                      </Text>
                    )}
                    <Text style={styles.unitBadge}>{item.unit}</Text>

                    {/* Price and Add/Counter Row */}
                    <View style={styles.priceRow}>
                      <View>
                        <Text style={styles.priceText}>₹{price}</Text>
                        {mrp && mrp > price && (
                          <Text style={styles.mrpText}>₹{mrp}</Text>
                        )}
                      </View>

                      {quantity === 0 ? (
                        <TouchableOpacity
                          style={styles.addButton}
                          onPress={() => handleAddToCart(item)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.addButtonText}>ADD</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.counterPill}>
                          <TouchableOpacity
                            style={styles.counterBtn}
                            onPress={() => decrementItem(item.id)}
                          >
                            <Ionicons name="remove" size={16} color="#FFFFFF" />
                          </TouchableOpacity>
                          <Text style={styles.counterText}>{quantity}</Text>
                          <TouchableOpacity
                            style={styles.counterBtn}
                            onPress={() => incrementItem(item.id)}
                          >
                            <Ionicons name="add" size={16} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

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
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginHorizontal: 12,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 80,
  },
  heroBannerContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
  },
  shopMetaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: -30,
    padding: 16,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
    letterSpacing: -0.3,
  },
  ratingBadge: {
    backgroundColor: '#15803D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  metaDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaSubText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    marginLeft: 4,
  },
  dot: {
    marginHorizontal: 6,
    color: '#94A3B8',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 10,
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    gap: 6,
  },
  addressText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  directCallPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  directCallText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  offerBannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  offerBannerText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  categoryPillsContainer: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  catalogSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  catalogTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemsCountText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
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
    fontWeight: '600',
  },
  productsGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  productImageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#2563EB',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderBottomRightRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  vegIndicator: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#16A34A',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  productNameHi: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  unitBadge: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  mrpText: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#16A34A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A34A',
  },
  counterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 8,
  },
  counterBtn: {
    padding: 2,
  },
  counterText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  floatingCartBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#16A34A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cartTotalAmount: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

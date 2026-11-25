import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { InstamartColors } from '../../ui/theme/instamartTheme';
import { AppTypography } from '../../ui/theme/appTypography';
import { DUMMY_PRODUCTS, ProductItem, LOCAL_SHOPS, resolveProductVendor } from '../home/data/homeData';
import { ProductCard } from '../home/widgets/ProductCard';
import { useCartStore } from '../../state/useCartStore';
import { CartStickyBar } from '../../ui/components/CartStickyBar';
import { dusmintApi } from '@dusmint/api-client';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

const POPULAR_SEARCHES = [
  'Desi Tomato',
  'Toned Milk',
  'Fresh Paneer',
  'Nashik Onion',
  'Farm Eggs',
  'Atta',
  'Desi Ghee',
];

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [liveProducts, setLiveProducts] = useState<ProductItem[]>(DUMMY_PRODUCTS);

  useEffect(() => {
    let active = true;
    dusmintApi.getAllItems().then((items) => {
      if (items && items.length > 0 && active) {
        const mapped: ProductItem[] = items.map((i: any) => {
          const name = i.nameEn || i.name || 'Fresh Item';
          const nameLower = name.toLowerCase();
          const pricePaise = i.pricePaise || (i.price ? Math.round(Number(i.price) * 100) : 3500);
          const mrpPaise = i.mrpPaise || (i.mrp ? Math.round(Number(i.mrp) * 100) : Math.round(pricePaise * 1.25));
          const unit = i.unit || '1 pc';
          const photoUrl = i.photoUrl || i.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300';
          const inStock = i.isInStock !== undefined ? i.isInStock : true;
          const catSlug = (i.categorySlug || '').toLowerCase();

          const category =
            catSlug === 'dairy'
              ? 'dairy'
              : catSlug === 'vegetables' || catSlug === 'fruits' || nameLower.includes('tomato') || nameLower.includes('onion')
              ? 'fresh'
              : 'groceries';

          const resolvedShop = resolveProductVendor({
            vendorId: i.vendorId,
            category,
          });

          return {
            id: i.id,
            name: name,
            quantityLabel: unit,
            price: Math.round(pricePaise / 100),
            mrp: Math.round(mrpPaise / 100),
            tag: nameLower.includes('tomato') || nameLower.includes('atta') ? 'BESTSELLER' : undefined,
            rating: 4.8,
            ratingCount: 140,
            deliveryMins: '9 MINS',
            imageUrl: photoUrl,
            inStock: inStock,
            category,
            vendorId: resolvedShop.id,
          };
        });
        setLiveProducts(mapped);
      }
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0
  );

  const matchingShops = query.trim().length > 0
    ? LOCAL_SHOPS.filter((s) => {
        const q = query.toLowerCase();
        return (
          s.shopName.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.tags && s.tags.some((t) => t.toLowerCase().includes(q)))
        );
      })
    : [];

  const filteredProducts = query.trim().length > 0
    ? liveProducts.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header Search Input */}
      <View style={[styles.header, { paddingTop: topInset + 6 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={InstamartColors.ink} />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Ionicons name="search" size={18} color={InstamartColors.inkMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="Search groceries, sabzi, dairy..."
            placeholderTextColor={InstamartColors.inkMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus={true}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={InstamartColors.inkMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Body */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {query.trim().length === 0 ? (
          <View style={styles.trendingContainer}>
            <Text style={styles.sectionTitle}>Trending Searches</Text>
            <View style={styles.pillsRow}>
              {POPULAR_SEARCHES.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.pill}
                  onPress={() => setQuery(tag)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trending-up" size={14} color={InstamartColors.accentBlue} style={{ marginRight: 6 }} />
                  <Text style={styles.pillText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            {/* Matching Stores / Vendors (Zomato Search Model) */}
            {matchingShops.length > 0 && (
              <View style={styles.shopsSection}>
                <Text style={styles.sectionTitle}>
                  Stores & Vendors ({matchingShops.length})
                </Text>
                {matchingShops.map((shop) => (
                  <TouchableOpacity
                    key={shop.id}
                    style={styles.shopRow}
                    onPress={() =>
                      navigation.navigate('VendorShop', {
                        vendorId: shop.id,
                        shop,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.shopRowInfo}>
                      <Text style={styles.shopRowName}>{shop.shopName}</Text>
                      <Text style={styles.shopRowMeta}>
                        {shop.deliveryTimeMins} mins • {shop.distanceKm} km • ★ {shop.score}
                      </Text>
                      <Text style={styles.shopRowAddress} numberOfLines={1}>
                        {shop.addressText}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: matchingShops.length > 0 ? 16 : 0 }]}>
              {filteredProducts.length} Items for &quot;{query}&quot;
            </Text>

            {filteredProducts.length === 0 && matchingShops.length === 0 ? (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={48} color={InstamartColors.inkMuted} />
                <Text style={styles.noResultsText}>No stores or items found matching your search</Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {filteredProducts.map((p) => (
                  <View key={p.id} style={{ marginBottom: 14 }}>
                    <ProductCard
                      product={p}
                      onPress={() =>
                        navigation.navigate('ProductDetail', {
                          productId: p.id,
                          vendorId: p.vendorId,
                        })
                      }
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Cart Bar if any items */}
      {totalItemsCount > 0 && (
        <View style={styles.cartBarContainer}>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  inputWrapper: {
    flex: 1,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    ...AppTypography.searchHint,
    fontSize: 13,
    color: InstamartColors.ink,
  },
  scrollContent: {
    padding: 16,
  },
  trendingContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    ...AppTypography.cardTitle,
    fontSize: 15,
    marginBottom: 12,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: InstamartColors.tileBlue,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillText: {
    ...AppTypography.chipText,
    fontSize: 12,
  },
  resultsContainer: {
    marginTop: 8,
  },
  shopsSection: {
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  shopRowInfo: {
    flex: 1,
    paddingRight: 10,
  },
  shopRowName: {
    ...AppTypography.cardTitle,
    fontSize: 14,
  },
  shopRowMeta: {
    ...AppTypography.cardMetaStrong,
    fontSize: 11,
    color: '#059669',
    marginTop: 2,
  },
  shopRowAddress: {
    ...AppTypography.cardMeta,
    fontSize: 11,
    marginTop: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  noResults: {
    alignItems: 'center',
    marginTop: 60,
  },
  noResultsText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: InstamartColors.inkSoft,
    marginTop: 10,
  },
  cartBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});


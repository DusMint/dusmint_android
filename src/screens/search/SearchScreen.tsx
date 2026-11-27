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
import {
  DUMMY_PRODUCTS,
  ProductItem,
  LOCAL_SHOPS,
  resolveProductVendor,
  CATEGORY_QUICK_CHIPS,
} from '../home/data/homeData';
import { CategoryChips } from '../home/widgets/CategoryChips';
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
  'Chakki Atta',
  'Desi Ghee',
  'Curd & Dahi',
  'Potato & Ginger',
  'Green Chillies',
];

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [liveProducts, setLiveProducts] = useState<ProductItem[]>(DUMMY_PRODUCTS);

  useEffect(() => {
    let active = true;
    dusmintApi
      .getAllItems()
      .then((items) => {
        if (items && items.length > 0 && active) {
          const mapped: ProductItem[] = items.map((i: any) => {
            const name = i.nameEn || i.name || 'Fresh Item';
            const nameLower = name.toLowerCase();
            const pricePaise = i.pricePaise || (i.price ? Math.round(Number(i.price) * 100) : 3500);
            const mrpPaise =
              i.mrpPaise || (i.mrp ? Math.round(Number(i.mrp) * 100) : Math.round(pricePaise * 1.25));
            const unit = i.unit || '1 pc';
            const photoUrl =
              i.photoUrl ||
              i.imageUrl ||
              'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300';
            const inStock = i.isInStock !== undefined ? i.isInStock : true;
            const catSlug = (i.categorySlug || '').toLowerCase();

            const category =
              catSlug === 'dairy'
                ? 'dairy'
                : catSlug === 'vegetables' ||
                  catSlug === 'fruits' ||
                  nameLower.includes('tomato') ||
                  nameLower.includes('onion')
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
              tag:
                nameLower.includes('tomato') || nameLower.includes('atta')
                  ? 'BESTSELLER'
                  : undefined,
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
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
  );

  const matchingShops =
    query.trim().length > 0
      ? LOCAL_SHOPS.filter((s) => {
          const q = query.toLowerCase();
          return (
            s.shopName.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q) ||
            (s.tags && s.tags.some((t) => t.toLowerCase().includes(q)))
          );
        })
      : [];

  const filteredProducts =
    query.trim().length > 0
      ? liveProducts.filter(
          (p) =>
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
          <Ionicons name="search" size={19} color="#64748B" />
          <TextInput
            style={styles.input}
            placeholder="Search groceries, sabzi, dairy..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            autoFocus={true}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={19} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Body */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {query.trim().length === 0 ? (
          <View style={styles.emptySearchContainer}>
            {/* Section 1: Popular Searches */}
            <View style={styles.popularSection}>
              <Text style={styles.sectionTitle}>Popular Searches</Text>
              <View style={styles.pillsRow}>
                {POPULAR_SEARCHES.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.pill}
                    onPress={() => setQuery(tag)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name="trending-up"
                      size={13}
                      color="#047A36"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.pillText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Section 2: Categories (Exact "What's On Your Mind" Strip) */}
            <View style={styles.categoriesSection}>
              <CategoryChips
                title="Categories"
                onSelectCategory={(catId) => {
                  const chip = CATEGORY_QUICK_CHIPS.find((c) => c.id === catId);
                  if (chip) {
                    if (chip.id === 'all') {
                      setQuery('fresh');
                    } else {
                      setQuery(chip.label);
                    }
                  }
                }}
              />
            </View>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            {/* Matching Stores / Vendors */}
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

            <Text
              style={[
                styles.sectionTitle,
                { marginTop: matchingShops.length > 0 ? 16 : 0, paddingHorizontal: 16 },
              ]}
            >
              {filteredProducts.length} Items for &quot;{query}&quot;
            </Text>

            {filteredProducts.length === 0 && matchingShops.length === 0 ? (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={48} color={InstamartColors.inkMuted} />
                <Text style={styles.noResultsText}>
                  No stores or items found matching your search
                </Text>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputWrapper: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13.5,
    color: '#0F172A',
    paddingVertical: 0,
    marginLeft: 8,
  },
  scrollContent: {
    paddingVertical: 14,
  },
  emptySearchContainer: {
    paddingTop: 4,
  },
  popularSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  categoriesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  pillText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12.5,
    color: '#334155',
  },
  resultsContainer: {
    marginTop: 8,
  },
  shopsSection: {
    marginBottom: 20,
    marginHorizontal: 16,
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
    paddingHorizontal: 16,
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
    bottom: 34,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
});

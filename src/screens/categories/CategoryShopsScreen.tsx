import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { dusmintApi } from '@dusmint/api-client';
import { RootStackParamList } from '../../navigation/types';
import { CatalogueItem, VendorShop } from '../../api-client/types';
import {
  PRODUCE_CATEGORIES,
  ProduceCategoryItem,
  ShopCategorySlug,
  findProduceCategoryByQuery,
} from '../home/data/produceCategories';
import { LOCAL_SHOPS } from '../home/data/homeData';
import { ZomatoShopCard } from '../home/widgets/ZomatoShopCard';
import { useAuthStore } from '../../state/useAuthStore';
import { useCartStore } from '../../state/useCartStore';
import { CartStickyBar } from '../../ui/components/CartStickyBar';
import { AppTextColors, AppTypography } from '../../ui/theme/appTypography';

type Props = NativeStackScreenProps<RootStackParamList, 'CategoryShops'>;

type SortMode = 'recommended' | 'speed' | 'rating' | 'price_low';

interface EnrichedShopResult {
  shop: VendorShop;
  highlightItemLabel: string;
  highlightItemPriceRupees: number;
  highlightItemImageUrl?: string;
  startingPriceRupees: number;
  hasLiveItemMatches: boolean;
}

const SORT_LABELS: { id: SortMode; label: string }[] = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'speed', label: 'Fastest Delivery' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'price_low', label: 'Lowest Price' },
];

function mapShopCategoryToDetailTab(category?: string): string {
  const c = (category || '').toLowerCase();
  if (c === 'vegetables') return 'Vegetables';
  if (c === 'fruits') return 'Fruits';
  if (c === 'meat') return 'Meat';
  if (c === 'dairy') return 'Dairy';
  return 'All';
}

function getPriceCapThreshold(basePrice: number): number {
  if (basePrice <= 45) return 50;
  if (basePrice <= 140) return 150;
  if (basePrice <= 240) return 250;
  return 500;
}

function mergeVendorsWithFallback(liveShops: VendorShop[]): VendorShop[] {
  if (!liveShops || liveShops.length === 0) {
    return LOCAL_SHOPS;
  }
  const seenIds = new Set(liveShops.map((s) => s.id));
  const seenNames = new Set(liveShops.map((s) => s.shopName.trim().toLowerCase()));
  const extraFallback = LOCAL_SHOPS.filter(
    (s) =>
      !seenIds.has(s.id) &&
      !seenNames.has(s.shopName.trim().toLowerCase())
  );
  return [...liveShops, ...extraFallback];
}

export const CategoryShopsScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
  );

  const { categoryId, query, title } = route.params || {};
  const isVegOnly = useAuthStore((s) => s.isVegOnly);
  const setVegOnly = useAuthStore((s) => s.setVegOnly);
  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());

  const initialProduce: ProduceCategoryItem | undefined = useMemo(() => {
    if (categoryId) {
      const exact = PRODUCE_CATEGORIES.find((c) => c.id === categoryId);
      if (exact) return exact;
    }
    if (query || title) {
      return findProduceCategoryByQuery(query || title || '');
    }
    return undefined;
  }, [categoryId, query, title]);

  const [searchText, setSearchText] = useState(
    initialProduce?.label || title || query || 'Fresh Produce'
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [nearFastActive, setNearFastActive] = useState(false);
  const [underPriceActive, setUnderPriceActive] = useState(false);
  const [topRatedActive, setTopRatedActive] = useState(false);
  const [lowestPriceActive, setLowestPriceActive] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('recommended');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const [vendors, setVendors] = useState<VendorShop[]>(LOCAL_SHOPS);
  const [liveItems, setLiveItems] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const activeProduce = useMemo(() => {
    const matched = findProduceCategoryByQuery(searchText);
    return matched || initialProduce;
  }, [searchText, initialProduce]);

  const activeVariant = useMemo(() => {
    if (!selectedVariantId || !activeProduce) return undefined;
    return activeProduce.subVariants.find((v) => v.id === selectedVariantId);
  }, [selectedVariantId, activeProduce]);

  const priceCapThreshold = getPriceCapThreshold(
    activeProduce?.basePriceRupees || 60
  );

  const loadDirectoryData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [vendorsRes, itemsRes] = await Promise.allSettled([
        dusmintApi.getAllVendors(),
        dusmintApi.getAllItems(),
      ]);
      if (vendorsRes.status === 'fulfilled') {
        setVendors(mergeVendorsWithFallback(vendorsRes.value || []));
      } else {
        setVendors(LOCAL_SHOPS);
      }
      if (itemsRes.status === 'fulfilled' && Array.isArray(itemsRes.value)) {
        setLiveItems(itemsRes.value);
      }
    } catch {
      setVendors(LOCAL_SHOPS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDirectoryData();
  }, [loadDirectoryData]);

  const activeSearchTokens = useMemo(() => {
    const tokens = new Set<string>();
    const rawText = searchText.trim().toLowerCase();
    if (rawText) {
      tokens.add(rawText);
      rawText
        .split(/[\s,&()]+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 3)
        .forEach((t) => tokens.add(t));
    }
    if (activeProduce) {
      activeProduce.matchKeywords.forEach((kw) => tokens.add(kw.toLowerCase()));
    }
    if (activeVariant) {
      tokens.add(activeVariant.searchKeyword.toLowerCase());
    }
    return Array.from(tokens);
  }, [searchText, activeProduce, activeVariant]);

  const matchedResults = useMemo<EnrichedShopResult[]>(() => {
    const targetShopCategory: ShopCategorySlug | undefined =
      activeProduce?.shopCategory;

    const itemMatchesByVendor = new Map<string, CatalogueItem[]>();
    for (const item of liveItems) {
      const haystack = `${item.nameEn || ''} ${item.nameHi || ''} ${
        item.categoryName || ''
      } ${item.categorySlug || ''}`.toLowerCase();
      const matched = activeSearchTokens.some((tok) => haystack.includes(tok));
      if (matched) {
        const list = itemMatchesByVendor.get(item.vendorId) || [];
        list.push(item);
        itemMatchesByVendor.set(item.vendorId, list);
      }
    }

    const enriched: EnrichedShopResult[] = [];
    const baseRupees = activeProduce?.basePriceRupees || 45;

    vendors.forEach((shop, idx) => {
      if (isVegOnly && shop.category === 'meat') {
        return;
      }

      const vendorLiveMatches = itemMatchesByVendor.get(shop.id) || [];
      const shopCategories = [
        shop.category,
        ...(shop.categories || []),
        ...(shop.tags || []),
      ]
        .join(' ')
        .toLowerCase();

      const categoryMatched = targetShopCategory
        ? shop.category === targetShopCategory ||
          (shop.categories || []).includes(targetShopCategory)
        : shopCategories.includes((searchText || '').trim().toLowerCase());

      if (vendorLiveMatches.length === 0 && !categoryMatched) {
        return;
      }

      const sortedLive = [...vendorLiveMatches].sort((a, b) => {
        if (activeVariant) {
          const vKw = activeVariant.searchKeyword.toLowerCase();
          const aExact = a.nameEn.toLowerCase().includes(vKw) ? 0 : 1;
          const bExact = b.nameEn.toLowerCase().includes(vKw) ? 0 : 1;
          if (aExact !== bExact) return aExact - bExact;
        }
        return a.pricePaise - b.pricePaise;
      });

      const primaryLive = sortedLive[0];
      const variantLabel = activeVariant
        ? activeVariant.label
        : activeProduce?.label || searchText || shop.featuredDishName || 'Fresh Item';

      const fallbackDelta = (idx % 3 === 0 ? 0 : idx % 3 === 1 ? -3 : 6);
      const highlightItemPriceRupees = primaryLive
        ? Math.max(1, Math.round(primaryLive.pricePaise / 100))
        : Math.max(10, baseRupees + fallbackDelta);

      const minLiveRupees = sortedLive.length
        ? Math.max(1, Math.round(Math.min(...sortedLive.map((i) => i.pricePaise)) / 100))
        : Math.max(10, highlightItemPriceRupees - 8);

      const highlightItemImageUrl =
        primaryLive?.photoUrl && primaryLive.photoUrl.startsWith('http')
          ? primaryLive.photoUrl
          : shop.featuredDishImageUrl || shop.bannerPhotoUrl;

      enriched.push({
        shop,
        highlightItemLabel: primaryLive?.nameEn || variantLabel,
        highlightItemPriceRupees,
        highlightItemImageUrl,
        startingPriceRupees: minLiveRupees,
        hasLiveItemMatches: sortedLive.length > 0,
      });
    });

    const filtered = enriched.filter((entry) => {
      if (nearFastActive) {
        const fast = (entry.shop.deliveryTimeMins || 15) <= 15;
        const near = (entry.shop.distanceKm ?? 0.8) <= 1.2;
        if (!fast || !near) return false;
      }
      if (underPriceActive && entry.highlightItemPriceRupees > priceCapThreshold) {
        return false;
      }
      if (topRatedActive && (entry.shop.score || 0) < 4.8) {
        return false;
      }
      return true;
    });

    const effectiveSort: SortMode = lowestPriceActive ? 'price_low' : sortMode;
    filtered.sort((a, b) => {
      if (effectiveSort === 'speed') {
        return (a.shop.deliveryTimeMins || 15) - (b.shop.deliveryTimeMins || 15);
      }
      if (effectiveSort === 'rating') {
        return (b.shop.score || 0) - (a.shop.score || 0);
      }
      if (effectiveSort === 'price_low') {
        return a.highlightItemPriceRupees - b.highlightItemPriceRupees;
      }
      return (a.shop.distanceKm || 0.8) - (b.shop.distanceKm || 0.8);
    });

    return filtered;
  }, [
    vendors,
    liveItems,
    activeProduce,
    activeVariant,
    activeSearchTokens,
    isVegOnly,
    nearFastActive,
    underPriceActive,
    topRatedActive,
    lowestPriceActive,
    sortMode,
    priceCapThreshold,
    searchText,
  ]);

  const openShops = useMemo(
    () => matchedResults.filter((r) => r.shop.isOpen),
    [matchedResults]
  );
  const closedShops = useMemo(
    () => matchedResults.filter((r) => !r.shop.isOpen),
    [matchedResults]
  );

  const handlePressShop = (entry: EnrichedShopResult) => {
    const targetTab = mapShopCategoryToDetailTab(
      activeProduce?.shopCategory || entry.shop.category
    );
    const targetQuery =
      activeVariant?.searchKeyword ||
      (entry.hasLiveItemMatches ? activeProduce?.matchKeywords[0] : '') ||
      '';
    navigation.navigate('VendorShop', {
      vendorId: entry.shop.id,
      shop: entry.shop,
      initialCategory: targetTab,
      initialSearchQuery: targetQuery,
    });
  };

  const handleResetFilters = () => {
    setSelectedVariantId(null);
    setNearFastActive(false);
    setUnderPriceActive(false);
    setTopRatedActive(false);
    setLowestPriceActive(false);
    setSortMode('recommended');
  };

  const vegBlockingNonVeg = Boolean(
    isVegOnly && activeProduce && !activeProduce.isVeg
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. Pinned Top Search Pill + Voice Search */}
      <View style={[styles.topHeader, { paddingTop: topInset + 8 }]}>
        <View style={styles.searchRow}>
          <View style={styles.searchPill}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={22} color="#DC2626" />
            </TouchableOpacity>

            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={(val) => {
                setSearchText(val);
                setSelectedVariantId(null);
              }}
              placeholder="Search tomatoes, chicken, fish..."
              placeholderTextColor="#94A3B8"
              returnKeyType="search"
            />

            {searchText.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchText('');
                  setSelectedVariantId(null);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Ionicons name="close" size={19} color="#64748B" />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('SmartFeed')}
            style={styles.micCircle}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel="Voice search"
          >
            <Ionicons name="mic-outline" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>

        {/* 2. Row 1: Filters dropdown + Contextual Sub-Variant Chips with Thumbnails */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow1Content}
        >
          <TouchableOpacity
            style={[
              styles.filtersChip,
              sortMode !== 'recommended' && styles.chipActive,
            ]}
            onPress={() => setSortModalVisible(true)}
            activeOpacity={0.78}
          >
            <Ionicons
              name="options-outline"
              size={14}
              color={sortMode !== 'recommended' ? '#15803D' : '#0F172A'}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.chipText,
                sortMode !== 'recommended' && styles.chipTextActive,
              ]}
            >
              {sortMode === 'recommended'
                ? 'Filters'
                : SORT_LABELS.find((s) => s.id === sortMode)?.label}
            </Text>
            <Ionicons
              name="chevron-down"
              size={13}
              color={sortMode !== 'recommended' ? '#15803D' : '#0F172A'}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>

          {(activeProduce?.subVariants || []).map((variant) => {
            const active = selectedVariantId === variant.id;
            return (
              <TouchableOpacity
                key={variant.id}
                style={[styles.variantChip, active && styles.chipActive]}
                onPress={() =>
                  setSelectedVariantId((prev) =>
                    prev === variant.id ? null : variant.id
                  )
                }
                activeOpacity={0.78}
              >
                <Image
                  source={variant.image}
                  style={styles.variantThumb}
                  resizeMode="contain"
                />
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {variant.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 3. Row 2: Quick Shop Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow2Content}
        >
          <TouchableOpacity
            style={[styles.quickChip, nearFastActive && styles.chipActive]}
            onPress={() => setNearFastActive((p) => !p)}
            activeOpacity={0.78}
          >
            <Ionicons
              name="flash-outline"
              size={13}
              color={nearFastActive ? '#15803D' : '#15803D'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[styles.chipText, nearFastActive && styles.chipTextActive]}
            >
              Near & Fast
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickChip, underPriceActive && styles.chipActive]}
            onPress={() => setUnderPriceActive((p) => !p)}
            activeOpacity={0.78}
          >
            <Text
              style={[styles.chipText, underPriceActive && styles.chipTextActive]}
            >
              Under ₹{priceCapThreshold}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickChip, topRatedActive && styles.chipActive]}
            onPress={() => setTopRatedActive((p) => !p)}
            activeOpacity={0.78}
          >
            <Text
              style={[styles.chipText, topRatedActive && styles.chipTextActive]}
            >
              Rating 4.8+
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickChip, lowestPriceActive && styles.chipActive]}
            onPress={() => setLowestPriceActive((p) => !p)}
            activeOpacity={0.78}
          >
            <Text
              style={[
                styles.chipText,
                lowestPriceActive && styles.chipTextActive,
              ]}
            >
              Lowest Price
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 4. Scrollable Shop Feeds */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: totalItemsCount > 0 ? 115 : Math.max(insets.bottom, 28) },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadDirectoryData(true);
            }}
            colors={['#15803D']}
          />
        }
      >
        {loading && vendors.length === 0 ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#15803D" />
          </View>
        ) : vegBlockingNonVeg ? (
          <View style={styles.emptyBox}>
            <Ionicons name="leaf-outline" size={38} color="#15803D" />
            <Text style={styles.emptyTitle}>Pure Veg Mode is enabled</Text>
            <Text style={styles.emptySub}>
              Turn off Pure Veg Mode to view Chicken, Mutton, Fish and Egg shops near you.
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => setVegOnly(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>Show All Stores</Text>
            </TouchableOpacity>
          </View>
        ) : matchedResults.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="storefront-outline" size={38} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No stores match these filters</Text>
            <Text style={styles.emptySub}>
              Try relaxing price, rating or sub-variant filters to see nearby stores.
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetFilters}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {openShops.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeader}>ALL STORES</Text>
                {openShops.map((entry) => (
                  <ZomatoShopCard
                    key={entry.shop.id}
                    shop={entry.shop}
                    highlightItemLabel={entry.highlightItemLabel}
                    highlightItemPriceRupees={entry.highlightItemPriceRupees}
                    highlightItemImageUrl={entry.highlightItemImageUrl}
                    startingPriceRupees={entry.startingPriceRupees}
                    onPress={() => handlePressShop(entry)}
                  />
                ))}
              </View>
            )}

            {closedShops.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeader}>
                  STORES NOT DELIVERING CURRENTLY
                </Text>
                {closedShops.map((entry) => (
                  <ZomatoShopCard
                    key={entry.shop.id}
                    shop={entry.shop}
                    highlightItemLabel={entry.highlightItemLabel}
                    highlightItemPriceRupees={entry.highlightItemPriceRupees}
                    highlightItemImageUrl={entry.highlightItemImageUrl}
                    startingPriceRupees={entry.startingPriceRupees}
                    isClosedMuted
                    onPress={() => handlePressShop(entry)}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Sort & Filter Sheet */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sort Stores</Text>
            {SORT_LABELS.map((opt) => {
              const active = sortMode === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.modalOption}
                  onPress={() => {
                    setSortMode(opt.id);
                    if (opt.id !== 'price_low') {
                      setLowestPriceActive(false);
                    }
                    setSortModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      active && styles.modalOptionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Ionicons
                    name={active ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={active ? '#15803D' : '#94A3B8'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {totalItemsCount > 0 && (
        <View
          style={[
            styles.floatingCartContainer,
            { bottom: Math.max(insets.bottom, 16) },
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
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchPill: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  backBtn: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    paddingVertical: 0,
  },
  micCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow1Content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 8,
  },
  filterRow2Content: {
    paddingHorizontal: 14,
    paddingTop: 8,
    gap: 8,
  },
  filtersChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  variantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  variantThumb: {
    width: 19,
    height: 19,
    borderRadius: 9.5,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    borderColor: '#15803D',
    backgroundColor: '#F0FDF4',
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  chipTextActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  scrollContent: {
    paddingTop: 10,
    backgroundColor: '#F8FAFC',
    minHeight: '100%',
  },
  sectionBlock: {
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: '#64748B',
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 6,
  },
  centerBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyBox: {
    margin: 24,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  emptyTitle: {
    ...AppTypography.cardTitle,
    color: AppTextColors.primary,
    marginTop: 12,
    textAlign: 'center',
  },
  emptySub: {
    ...AppTypography.cardMeta,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  resetButton: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#15803D',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  modalTitle: {
    ...AppTypography.cardTitle,
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
  modalOptionTextActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  floatingCartContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
});

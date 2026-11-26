import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { useCartStore } from '../../state/useCartStore';
import { useLocationStore } from '../../state/useLocationStore';
import { useAuthStore } from '../../state/useAuthStore';
import { dusmintApi } from '@dusmint/api-client';
import { CartStickyBar } from '../../ui/components/CartStickyBar';
import { InstamartColors } from '../../ui/theme/instamartTheme';
import { AppTypography, AppTextColors } from '../../ui/theme/appTypography';
import { useNetworkStore } from '../../state/useNetworkStore';
import { OfflineFullScreenView } from '../../ui/components/OfflineFullScreenView';
import { Ionicons } from '@expo/vector-icons';

// Zomato Marketplace Widgets
import { HomeHeader } from './widgets/HomeHeader';
import { CategoryChips } from './widgets/CategoryChips';
import { StoreArchCards } from './widgets/StoreArchCards';
import { ZomatoShopCard } from './widgets/ZomatoShopCard';
import { BrandBannerCarousel } from './widgets/BrandBannerCarousel';
import { FreeDeliveryStrip } from './widgets/FreeDeliveryStrip';

// Data
import {
  LOCAL_SHOPS,
  PromoBanner,
} from './data/homeData';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0
  );
  const HEADER_MAX_HEIGHT = topInset + 140;

  const scrollY = useRef(new Animated.Value(0)).current;

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isOffline = useNetworkStore((s) => s.isOffline);
  const checkConnectivity = useNetworkStore((s) => s.checkConnectivity);
  const [refreshing, setRefreshing] = useState(false);
  const [shops, setShops] = useState<VendorShop[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<'none' | 'fast' | 'rating' | 'offers' | 'veg'>('none');
  const [sortBy, setSortBy] = useState<'default' | 'speed' | 'rating' | 'distance'>('default');

  // Cart Store State
  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());

  // Location Store State (Persistent & Auto-Detected via GPS)
  const shortAddress = useLocationStore((s) => s.shortAddress);
  const locality = useLocationStore((s) => s.locality);
  const city = useLocationStore((s) => s.city);
  const userAddress = useLocationStore((s) => s.userAddress);
  const hasPermission = useLocationStore((s) => s.hasPermission);
  const currentAddress = useLocationStore((s) => s.currentAddress);

  const locationLabel = currentAddress?.label
    ? currentAddress.label.charAt(0).toUpperCase() + currentAddress.label.slice(1)
    : 'Home';

  const displayAddress = useMemo(() => {
    const raw =
      shortAddress ||
      userAddress ||
      (locality ? `${locality}, ${city || 'Indore'}` : 'Vijay Nagar, Indore');
    return raw.replace(/^To Home:\s*/i, '').replace(/^To:\s*/i, '');
  }, [shortAddress, locality, city, userAddress]);

  // Filter & sort shops by category & active quick filter pill (Zomato/Swiggy Style)
  const filteredShops = useMemo(() => {
    let list = shops;
    if (selectedCategory !== 'all') {
      list = list.filter(
        (shop) =>
          shop.category === selectedCategory ||
          (shop.categories && shop.categories.includes(selectedCategory))
      );
    }

    if (activeFilter === 'fast') {
      list = list.filter((s) => (s.deliveryTimeMins || 15) <= 12);
    } else if (activeFilter === 'rating') {
      list = list.filter((s) => s.score >= 4.8);
    } else if (activeFilter === 'offers') {
      list = list.filter((s) => !!s.offersText);
    } else if (activeFilter === 'veg') {
      list = list.filter(
        (s) =>
          s.category === 'vegetables' ||
          (s.tags &&
            s.tags.some(
              (t) =>
                t.toLowerCase().includes('sabzi') ||
                t.toLowerCase().includes('veg') ||
                t.toLowerCase().includes('fruit')
            ))
      );
    }

    if (sortBy === 'speed') {
      list = [...list].sort(
        (a, b) => (a.deliveryTimeMins || 15) - (b.deliveryTimeMins || 15)
      );
    } else if (sortBy === 'rating') {
      list = [...list].sort((a, b) => b.score - a.score);
    } else if (sortBy === 'distance') {
      list = [...list].sort(
        (a, b) => (a.distanceKm || 0) - (b.distanceKm || 0)
      );
    }

    return list;
  }, [shops, selectedCategory, activeFilter, sortBy]);

  const loadShops = useCallback(async () => {
    try {
      const liveShops = await dusmintApi.getAllVendors();
      setShops(liveShops);
    } catch {
      // Keep current list on transient network error
    }
  }, []);

  useEffect(() => {
    // Auto-detect accurate street-level location via GPS + Ola Maps on launch
    useLocationStore.getState().autoDetectLocation();
    loadShops();
  }, [loadShops]);

  const handleAddressPress = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login', { canGoBack: true, fromModal: true });
    } else {
      navigation.navigate('SelectLocation');
    }
  };

  const handleProfilePress = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login', { canGoBack: true, fromModal: true });
    } else {
      navigation.navigate('Profile');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([checkConnectivity(), loadShops()]);
    setRefreshing(false);
  };

  const handleBannerPress = (banner: PromoBanner) => {
    if (banner.categoryId === 'vegetables') {
      const shop = LOCAL_SHOPS.find((s) => s.category === 'vegetables');
      if (shop) {
        navigation.navigate('VendorShop', { vendorId: shop.id, shop });
        return;
      }
    } else if (banner.categoryId === 'groceries') {
      const shop = LOCAL_SHOPS.find((s) => s.category === 'groceries');
      if (shop) {
        navigation.navigate('VendorShop', { vendorId: shop.id, shop });
        return;
      }
    }
    // Default fallback to first shop
    navigation.navigate('VendorShop', {
      vendorId: LOCAL_SHOPS[0].id,
      shop: LOCAL_SHOPS[0],
    });
  };

  // Cold launch / startup offline state: Show Instamart-grade Offline View
  if (isOffline) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <HomeHeader
          isGuest={!isAuthenticated}
          hasLocationPermission={hasPermission}
          locationLabel={locationLabel}
          deliveryMins="9 mins"
          addressText={displayAddress}
          isAbsolute={false}
          onAddressPress={handleAddressPress}
          onProfilePress={handleProfilePress}
          onBookmarkPress={() => navigation.navigate('Wishlist')}
          onSearchPress={() => navigation.navigate('Search')}
          onVoicePress={() => navigation.navigate('SmartFeed', { autoStartVoice: true })}
        />
        <OfflineFullScreenView
          onRetry={async () => {
            await checkConnectivity();
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Collapsible Sticky Header */}
      <HomeHeader
        isGuest={!isAuthenticated}
        hasLocationPermission={hasPermission}
        locationLabel={locationLabel}
        deliveryMins="9 mins"
        addressText={displayAddress}
        scrollY={scrollY}
        isAbsolute={true}
        onAddressPress={handleAddressPress}
        onProfilePress={handleProfilePress}
        onBookmarkPress={() => navigation.navigate('Wishlist')}
        onSearchPress={() => navigation.navigate('Search')}
        onVoicePress={() => navigation.navigate('SmartFeed', { autoStartVoice: true })}
      />

      {/* Scrollable Zomato Hyperlocal Feed */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[InstamartColors.accentBlue]}
            progressViewOffset={HEADER_MAX_HEIGHT}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: HEADER_MAX_HEIGHT },
        ]}
      >
        {/* 1. Category Quick Chips (All Stores, Kirana, Mandi Sabzi, Dairy, Sweets) */}
        <CategoryChips
          selectedCategoryId={selectedCategory}
          onSelectCategory={(id) => setSelectedCategory(id)}
        />

        {/* 2. Top Offers & Promo Banners Carousel */}
        <BrandBannerCarousel onBannerPress={handleBannerPress} />

        {/* 3. "Shop by Store" Quick Arch Tiles */}
        <StoreArchCards
          shops={shops}
          onStorePress={(store) => {
            navigation.navigate('VendorShop', {
              vendorId: store.id,
              shop: store,
            });
          }}
        />

        {/* 4. Tier-1 Quick Commerce "Stores Delivering to You" Feed */}
        <View style={styles.storesSectionContainer}>
          <View style={styles.storesSectionHeader}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.storesSectionTitle}>All Stores</Text>
              <View style={styles.storeCountBadge}>
                <Text style={styles.storeCountBadgeText}>
                  {filteredShops.length} {filteredShops.length === 1 ? 'store' : 'stores'} near you
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Filter Horizontal Scroll Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillsScroll}
            style={styles.filterPillsContainer}
          >
            {/* Sort by pill */}
            <TouchableOpacity
              style={[
                styles.filterPill,
                sortBy !== 'default' && styles.filterPillActive,
              ]}
              onPress={() => {
                setSortBy((prev) =>
                  prev === 'default'
                    ? 'speed'
                    : prev === 'speed'
                      ? 'rating'
                      : 'default'
                );
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterPillText,
                  sortBy !== 'default' && styles.filterPillTextActive,
                ]}
              >
                Sort by {sortBy === 'speed' ? '• Speed' : sortBy === 'rating' ? '• Rating' : ''}
              </Text>
              <Ionicons
                name="chevron-down"
                size={12}
                color={sortBy !== 'default' ? '#15803D' : '#64748B'}
                style={{ marginLeft: 3 }}
              />
            </TouchableOpacity>

            {/* Fast Delivery (< 15 mins) */}
            <TouchableOpacity
              style={[
                styles.filterPill,
                activeFilter === 'fast' && styles.filterPillActive,
              ]}
              onPress={() => {
                setActiveFilter((prev) => (prev === 'fast' ? 'none' : 'fast'));
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="flash"
                size={11}
                color={activeFilter === 'fast' ? '#15803D' : '#64748B'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === 'fast' && styles.filterPillTextActive,
                ]}
              >
                Under 15 Mins
              </Text>
            </TouchableOpacity>

            {/* Rating 4.8+ */}
            <TouchableOpacity
              style={[
                styles.filterPill,
                activeFilter === 'rating' && styles.filterPillActive,
              ]}
              onPress={() => {
                setActiveFilter((prev) => (prev === 'rating' ? 'none' : 'rating'));
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="star"
                size={11}
                color={activeFilter === 'rating' ? '#15803D' : '#64748B'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === 'rating' && styles.filterPillTextActive,
                ]}
              >
                Rating 4.8+
              </Text>
            </TouchableOpacity>

            {/* Pure Veg / Mandi Fresh */}
            <TouchableOpacity
              style={[
                styles.filterPill,
                activeFilter === 'veg' && styles.filterPillActive,
              ]}
              onPress={() => {
                setActiveFilter((prev) => (prev === 'veg' ? 'none' : 'veg'));
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="leaf"
                size={11}
                color={activeFilter === 'veg' ? '#15803D' : '#64748B'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === 'veg' && styles.filterPillTextActive,
                ]}
              >
                Pure Veg
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Shops Grid / Cards */}
          {filteredShops.map((shop) => (
            <ZomatoShopCard
              key={shop.id}
              shop={shop}
              onPress={(s) =>
                navigation.navigate('VendorShop', {
                  vendorId: s.id,
                  shop: s,
                })
              }
            />
          ))}

          {/* Empty filter state */}
          {filteredShops.length === 0 && (
            <View style={styles.emptyFilterContainer}>
              <Text style={styles.emptyFilterTitle}>No stores match this filter</Text>
              <Text style={styles.emptyFilterSubtitle}>
                Tap below to reset filters and view all stores delivering to you
              </Text>
              <TouchableOpacity
                style={styles.resetFilterButton}
                onPress={() => {
                  setSelectedCategory('all');
                  setActiveFilter('none');
                  setSortBy('default');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.resetFilterButtonText}>Reset All Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Extra bottom padding to scroll completely clear of the floating Zomato bottom bar */}
        <View style={{ height: 110 }} />
      </Animated.ScrollView>

      {/* Bottom Floating Cart Pill (Only shown when items exist) */}
      {totalItemsCount > 0 && (
        <View style={styles.floatingCartContainer}>
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
    backgroundColor: InstamartColors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: 74,
    left: 12,
    right: 12,
    zIndex: 1000,
  },
  bottomStripsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  storesSectionContainer: {
    marginTop: 14,
    marginBottom: 8,
  },
  storesSectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storesSectionTitle: {
    ...AppTypography.cardTitle,
  },
  storeCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  storeCountBadgeText: {
    ...AppTypography.cardMetaStrong,
    fontSize: 11.5,
    color: AppTextColors.secondary,
  },
  filterPillsContainer: {
    marginBottom: 14,
  },
  filterPillsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 11,
    paddingVertical: 6.5,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  filterPillActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  filterPillText: {
    ...AppTypography.chipText,
  },
  filterPillTextActive: {
    ...AppTypography.chipTextActive,
  },
  emptyFilterContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFilterTitle: {
    ...AppTypography.cardTitle,
    marginBottom: 6,
  },
  emptyFilterSubtitle: {
    ...AppTypography.cardMeta,
    textAlign: 'center',
    marginBottom: 16,
  },
  resetFilterButton: {
    backgroundColor: InstamartColors.accentBlue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetFilterButtonText: {
    ...AppTypography.buttonText,
    fontSize: 13,
  },
});

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
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
import { useNetworkStore } from '../../state/useNetworkStore';
import { OfflineFullScreenView } from '../../ui/components/OfflineFullScreenView';

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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isOffline = useNetworkStore((s) => s.isOffline);
  const checkConnectivity = useNetworkStore((s) => s.checkConnectivity);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Cart Store State
  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());

  // Location Store State (Persistent & Auto-Detected via GPS)
  const shortAddress = useLocationStore((s) => s.shortAddress);
  const locality = useLocationStore((s) => s.locality);
  const city = useLocationStore((s) => s.city);
  const userAddress = useLocationStore((s) => s.userAddress);

  const displayAddress = useMemo(() => {
    const raw = shortAddress || (locality ? `${locality}, ${city || 'Indore'}` : userAddress) || 'Vijay Nagar, Indore';
    const cleaned = raw.replace(/^To Home:\s*/i, '').replace(/^To:\s*/i, '');
    return `To Home: ${cleaned}`;
  }, [shortAddress, locality, city, userAddress]);

  // Filter shops by active category pill (Multi-Category Support)
  const filteredShops = useMemo(() => {
    if (selectedCategory === 'all') return LOCAL_SHOPS;
    return LOCAL_SHOPS.filter(
      (shop) =>
        shop.category === selectedCategory ||
        (shop.categories && shop.categories.includes(selectedCategory))
    );
  }, [selectedCategory]);

  useEffect(() => {
    // Only auto-detect real GPS location when user is logged in (not skipped/guest)
    if (isAuthenticated) {
      useLocationStore.getState().autoDetectLocation();
    }
  }, [isAuthenticated]);

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
    await checkConnectivity();
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
          deliveryMins="9 mins"
          addressText={displayAddress}
          onAddressPress={handleAddressPress}
          onProfilePress={handleProfilePress}
          onBookmarkPress={() => navigation.navigate('Wishlist')}
          onSearchPress={() => navigation.navigate('Search')}
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

      {/* Pinned Sticky Header */}
      <HomeHeader
        isGuest={!isAuthenticated}
        deliveryMins="9 mins"
        addressText={displayAddress}
        onAddressPress={handleAddressPress}
        onProfilePress={handleProfilePress}
        onBookmarkPress={() => navigation.navigate('Wishlist')}
        onSearchPress={() => navigation.navigate('Search')}
      />

      {/* Scrollable Zomato Hyperlocal Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[InstamartColors.accentBlue]} />
        }
        contentContainerStyle={styles.scrollContent}
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
          onStorePress={(store) => {
            const foundShop = LOCAL_SHOPS.find(
              (s) =>
                s.id === store.id ||
                s.shopName.toLowerCase().includes(store.name.toLowerCase())
            );
            navigation.navigate('VendorShop', {
              vendorId: foundShop?.id || store.id,
              shop: foundShop,
            });
          }}
        />

        {/* 4. Zomato-Style "Shops Delivering to You" Feed */}
        <View style={styles.storesSectionContainer}>
          <View style={styles.storesSectionHeader}>
            <Text style={styles.storesSectionSubtitle}>
              {filteredShops.length} {filteredShops.length === 1 ? 'STORE' : 'STORES'} DELIVERING TO YOU
            </Text>
            <Text style={styles.storesSectionTitle}>
              Neighbourhood Kirana & Mandi Partners
            </Text>
          </View>

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

          {filteredShops.length === 0 && (
            <View style={styles.emptyFilterContainer}>
              <Text style={styles.emptyFilterTitle}>No stores found in this category</Text>
              <Text style={styles.emptyFilterSubtitle}>
                Tap below to view all available stores near you
              </Text>
              <TouchableOpacity
                style={styles.resetFilterButton}
                onPress={() => setSelectedCategory('all')}
                activeOpacity={0.8}
              >
                <Text style={styles.resetFilterButtonText}>View All Stores</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Extra bottom padding so content clears bottom strips */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Bottom Floating Cart Pill or Free Delivery Strip */}
      {totalItemsCount > 0 ? (
        <View style={styles.floatingCartContainer}>
          <CartStickyBar
            totalItems={totalItemsCount}
            totalPaise={totalPaise}
            onPressViewCart={() => navigation.navigate('Cart')}
          />
        </View>
      ) : (
        <View style={styles.bottomStripsContainer}>
          <FreeDeliveryStrip />
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
    bottom: 12,
    left: 12,
    right: 12,
  },
  bottomStripsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  storesSectionContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  storesSectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  storesSectionSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  storesSectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  emptyFilterContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFilterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptyFilterSubtitle: {
    fontSize: 13,
    color: '#64748B',
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
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

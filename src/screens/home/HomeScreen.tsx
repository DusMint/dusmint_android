import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { useCartStore } from '../../state/useCartStore';
import { useLocationStore } from '../../state/useLocationStore';
import { dusmintApi } from '@dusmint/api-client';
import { CartStickyBar } from '../../ui/components/CartStickyBar';
import { InstamartColors } from '../../ui/theme/instamartTheme';
import { useNetworkStore } from '../../state/useNetworkStore';
import { OfflineFullScreenView } from '../../ui/components/OfflineFullScreenView';

// Instamart Widgets
import { HomeHeader } from './widgets/HomeHeader';
import { HeroCarousel } from './widgets/HeroCarousel';
import { CategoryChips } from './widgets/CategoryChips';
import { FestivePromoBlock } from './widgets/FestivePromoBlock';
import { ProductCarousel } from './widgets/ProductCarousel';
import { BlueWrapperCarousel } from './widgets/BlueWrapperCarousel';
import { CategoryGridSection } from './widgets/CategoryGridSection';
import { StoreArchCards } from './widgets/StoreArchCards';
import { BrandBannerCarousel } from './widgets/BrandBannerCarousel';
import { FeaturedFavourites } from './widgets/FeaturedFavourites';
import { FreeDeliveryStrip } from './widgets/FreeDeliveryStrip';

// Data
import {
  DUMMY_PRODUCTS,
  FRESH_ITEMS_GRID,
  GROCERY_KITCHEN_GRID,
  ProductItem,
} from './data/homeData';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const isOffline = useNetworkStore((s) => s.isOffline);
  const checkConnectivity = useNetworkStore((s) => s.checkConnectivity);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [hasLoadedSuccessfully, setHasLoadedSuccessfully] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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

  const loadLiveProducts = useCallback(async () => {
    try {
      const liveItems = await dusmintApi.getAllItems();
      if (liveItems && liveItems.length > 0) {
        const mapped: ProductItem[] = liveItems.map((i: any) => {
          const name = i.nameEn || i.name || 'Fresh Item';
          const nameLower = name.toLowerCase();
          const pricePaise = i.pricePaise || (i.price ? Math.round(Number(i.price) * 100) : 3500);
          const mrpPaise = i.mrpPaise || (i.mrp ? Math.round(Number(i.mrp) * 100) : Math.round(pricePaise * 1.25));
          const unit = i.unit || '1 pc';
          const photoUrl = i.photoUrl || i.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300';
          const inStock = i.isInStock !== undefined ? i.isInStock : (i.inStock !== undefined ? i.inStock : true);
          const catSlug = (i.categorySlug || '').toLowerCase();

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
            category:
              catSlug === 'dairy'
                ? 'dairy'
                : catSlug === 'vegetables' || catSlug === 'fruits' || nameLower.includes('tomato') || nameLower.includes('onion') || nameLower.includes('potato')
                ? 'fresh'
                : 'groceries',
            vendorId: i.vendorId || 'vendor-default',
          };
        });
        setProducts(mapped);
        setHasLoadedSuccessfully(true);
      } else {
        setProducts(DUMMY_PRODUCTS);
        setHasLoadedSuccessfully(true);
      }
    } catch (err) {
      console.warn('Live products fetch notice:', err);
      if (!hasLoadedSuccessfully && !useNetworkStore.getState().isOffline) {
        setProducts(DUMMY_PRODUCTS);
        setHasLoadedSuccessfully(true);
      }
    } finally {
      setInitialLoading(false);
    }
  }, [hasLoadedSuccessfully]);

  useEffect(() => {
    // 1. Auto-detect real GPS location when the app opens
    useLocationStore.getState().autoDetectLocation();
    // 2. Load live products from backend
    loadLiveProducts();
  }, [loadLiveProducts]);

  // Auto-refresh when network is restored
  useEffect(() => {
    if (!isOffline && (!hasLoadedSuccessfully || products.length === 0)) {
      loadLiveProducts();
    }
  }, [isOffline, hasLoadedSuccessfully, products.length, loadLiveProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    const online = await checkConnectivity();
    if (online) {
      await loadLiveProducts();
    }
    setRefreshing(false);
  };

  const freshProducts = products.filter((p) => p.category === 'fresh');
  const dairyProducts = products.filter((p) => p.category === 'dairy');

  // Cold launch / startup offline state: Show Instamart-grade Offline View
  if (isOffline && !hasLoadedSuccessfully && products.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <HomeHeader
          deliveryMins="9 mins"
          addressText={displayAddress}
          onAddressPress={() => navigation.navigate('SelectLocation')}
          onProfilePress={() => navigation.navigate('AccountTab')}
          onBookmarkPress={() => navigation.navigate('Wishlist')}
          onSearchPress={() => navigation.navigate('Search')}
        />
        <OfflineFullScreenView
          onRetry={async () => {
            const online = await checkConnectivity();
            if (online) {
              await loadLiveProducts();
            }
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
        deliveryMins="9 mins"
        addressText={displayAddress}
        onAddressPress={() => navigation.navigate('SelectLocation')}
        onProfilePress={() => navigation.navigate('AccountTab')}
        onBookmarkPress={() => navigation.navigate('Wishlist')}
        onSearchPress={() => navigation.navigate('Search')}
      />

      {/* Scrollable Instamart Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[InstamartColors.accentBlue]} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Hero Carousel (Mandi Week / Most Shopped) */}
        <HeroCarousel
          items={products}
          onSeeAll={() => navigation.navigate('CategoriesTab')}
          onItemPress={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
        />

        {/* 2. Category Quick Chips */}
        <CategoryChips
          onSelectCategory={() => navigation.navigate('CategoriesTab')}
        />

        {/* 3. Festive Promo Block */}
        <FestivePromoBlock
          onTilePress={() => navigation.navigate('CategoriesTab')}
        />

        {/* 4. "Fresh Store" Product Carousel */}
        <ProductCarousel
          title="Fresh Store"
          products={freshProducts}
          showSeeAll={true}
          showBottomSeeAllButton={true}
          onSeeAllPress={() => navigation.navigate('CategoriesTab')}
          onProductPress={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
        />

        {/* 5. "Lowest prices only for you" Carousel (Blue Wrapper) */}
        <BlueWrapperCarousel
          products={products}
          onArrowPress={() => navigation.navigate('CategoriesTab')}
          onProductPress={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
        />

        {/* 6. "Dairy & Eggs" Product Carousel */}
        <ProductCarousel
          title="Dairy & Eggs"
          products={dairyProducts}
          showSeeAll={true}
          onSeeAllPress={() => navigation.navigate('CategoriesTab')}
          onProductPress={(p) => navigation.navigate('ProductDetail', { productId: p.id })}
        />

        {/* 7. "Fresh items" Category Grid (4 columns) */}
        <CategoryGridSection
          title="Fresh items"
          items={FRESH_ITEMS_GRID}
          onItemPress={() => navigation.navigate('CategoriesTab')}
        />

        {/* 8. "Grocery & Kitchen" Category Grid (4 columns) */}
        <CategoryGridSection
          title="Grocery & Kitchen"
          items={GROCERY_KITCHEN_GRID}
          onItemPress={() => navigation.navigate('CategoriesTab')}
        />

        {/* 9. "Shop by Store" Arch Cards */}
        <StoreArchCards
          onStorePress={() => navigation.navigate('CategoriesTab')}
        />

        {/* 10. Brand Banner Carousel with Dots */}
        <BrandBannerCarousel
          onBannerPress={(banner) =>
            navigation.navigate('ItemList', {
              title: banner.categoryTitle,
              categoryId: banner.categoryId,
            })
          }
        />

        {/* 11. "Featured Favourites" Brand Tiles */}
        <FeaturedFavourites
          onBrandPress={(brand) =>
            navigation.navigate('ItemList', {
              title: `${brand.name} Store`,
            })
          }
        />

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
});

import React, { useState, useEffect, useCallback } from 'react';
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
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>(DUMMY_PRODUCTS);

  // Cart Store State
  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());

  // Location Store State
  const shortAddress = useLocationStore((s) => s.shortAddress);
  const userAddress = useLocationStore((s) => s.userAddress);

  const displayAddress = shortAddress || userAddress || 'To Home: Vijay Nagar, Indore';

  const loadLiveProducts = useCallback(async () => {
    try {
      const liveItems = await dusmintApi.getAllItems();
      if (liveItems && liveItems.length > 0) {
        const mapped: ProductItem[] = liveItems.map((i) => ({
          id: i.id,
          name: i.nameEn,
          quantityLabel: i.unit,
          price: Math.round(i.pricePaise / 100),
          mrp: i.mrpPaise ? Math.round(i.mrpPaise / 100) : Math.round((i.pricePaise / 100) * 1.25),
          tag:
            i.nameEn.toLowerCase().includes('tomato') || i.nameEn.toLowerCase().includes('atta')
              ? 'BESTSELLER'
              : undefined,
          rating: 4.8,
          ratingCount: 140,
          deliveryMins: '9 MINS',
          imageUrl: i.photoUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
          inStock: i.isInStock,
          category:
            i.categorySlug === 'dairy'
              ? 'dairy'
              : i.categorySlug === 'vegetables' || i.categorySlug === 'fruits'
              ? 'fresh'
              : 'groceries',
          vendorId: i.vendorId,
        }));
        setProducts(mapped);
      }
    } catch (err) {
      console.warn('Live products fetch notice:', err);
    }
  }, []);

  useEffect(() => {
    loadLiveProducts();
  }, [loadLiveProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLiveProducts();
    setRefreshing(false);
  };

  const freshProducts = products.filter((p) => p.category === 'fresh');
  const dairyProducts = products.filter((p) => p.category === 'dairy');

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor="transparent"
      />

      {/* Pinned Sticky Header */}
      <HomeHeader
        deliveryMins="9 mins"
        addressText={displayAddress}
        onAddressPress={() => navigation.navigate('SelectLocation')}
        onProfilePress={() => navigation.navigate('AccountTab')}
        onBookmarkPress={() => {}}
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
        <HeroCarousel />

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
        <BrandBannerCarousel />

        {/* 11. "Featured Favourites" Brand Tiles */}
        <FeaturedFavourites />

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

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { useCartStore } from '../../state/useCartStore';
import { useLocationStore } from '../../state/useLocationStore';
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
} from './data/homeData';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  // Cart Store State
  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());

  // Location Store State
  const shortAddress = useLocationStore((s) => s.shortAddress);
  const userAddress = useLocationStore((s) => s.userAddress);

  const displayAddress = shortAddress || userAddress || 'To Home: Vijay Nagar, Indore';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const freshProducts = DUMMY_PRODUCTS.filter((p) => p.category === 'fresh');
  const dairyProducts = DUMMY_PRODUCTS.filter((p) => p.category === 'dairy');

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
        onAddressPress={() => navigation.navigate('SlotAndAddress')}
        onProfilePress={() => navigation.navigate('ProfileTab')}
        onBookmarkPress={() => {}}
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
        />

        {/* 5. "Lowest prices only for you" Carousel (Blue Wrapper) */}
        <BlueWrapperCarousel
          products={DUMMY_PRODUCTS}
          onArrowPress={() => navigation.navigate('CategoriesTab')}
        />

        {/* 6. "Dairy & Eggs" Product Carousel */}
        <ProductCarousel
          title="Dairy & Eggs"
          products={dairyProducts}
          showSeeAll={true}
          onSeeAllPress={() => navigation.navigate('CategoriesTab')}
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

      {/* Bottom Pinned Strips */}
      <View style={styles.bottomStripsContainer}>
        <FreeDeliveryStrip />

        {totalItemsCount > 0 && (
          <CartStickyBar
            totalItems={totalItemsCount}
            totalPaise={totalPaise}
            onPressViewCart={() => navigation.navigate('Cart')}
          />
        )}
      </View>
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
  bottomStripsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

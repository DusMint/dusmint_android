import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { useCartStore } from '../../state/useCartStore';
import { CartStickyBar } from '../../ui/components/CartStickyBar';
import { FreeDeliveryStrip } from '../home/widgets/FreeDeliveryStrip';
import { InstamartColors } from '../../ui/theme/instamartTheme';

// Categories Widgets & Data
import { CategoriesAppBar } from './widgets/CategoriesAppBar';
import { StoreArchRow } from './widgets/StoreArchRow';
import { StoreCategoryCard } from './widgets/StoreCategoryCard';
import { ZomatoShopCard } from '../home/widgets/ZomatoShopCard';
import {
  STORE_CATEGORIES,
  StoreCategoryItem,
  StoreArchItem,
} from './data/categoriesData';
import { LOCAL_SHOPS } from '../home/data/homeData';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, any>,
  NativeStackScreenProps<RootStackParamList>
>;

export const CategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('groceries');

  // Cart Store State
  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsScrolled(offsetY > 8);
  };

  const handleStorePress = (store: StoreArchItem) => {
    const foundShop = LOCAL_SHOPS.find(
      (s) =>
        s.id === store.id ||
        s.shopName.toLowerCase().includes(store.name.toLowerCase())
    );
    navigation.navigate('VendorShop', {
      vendorId: foundShop?.id || store.id,
      shop: foundShop,
    });
  };

  const handleCategoryPress = (category: StoreCategoryItem) => {
    setSelectedCategorySlug(category.slug);
  };

  // Multi-Category Store Filtering
  const matchingShops = useMemo(() => {
    return LOCAL_SHOPS.filter(
      (s) =>
        s.category === selectedCategorySlug ||
        (s.categories && s.categories.includes(selectedCategorySlug))
    );
  }, [selectedCategorySlug]);

  const activeCategory = useMemo(() => {
    return STORE_CATEGORIES.find((c) => c.slug === selectedCategorySlug) || STORE_CATEGORIES[0];
  }, [selectedCategorySlug]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* 1. Pinned Categories App Bar */}
      <CategoriesAppBar
        isScrolled={isScrolled}
        onSearchPress={() => navigation.navigate('Search')}
      />

      {/* 2. Scrollable Categories Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Shop by Store Row */}
        <StoreArchRow onStorePress={handleStorePress} />

        {/* Section Title: Browse by Store Category */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSubtitle}>STORE DIRECTORY</Text>
          <Text style={styles.sectionTitle}>Explore by Shop Category</Text>
        </View>

        {/* Category Cards with live store counts */}
        {STORE_CATEGORIES.map((cat) => {
          const count = LOCAL_SHOPS.filter(
            (s) => s.category === cat.slug || (s.categories && s.categories.includes(cat.slug))
          ).length;

          return (
            <StoreCategoryCard
              key={cat.id}
              category={cat}
              storeCount={count}
              isSelected={selectedCategorySlug === cat.slug}
              onPress={handleCategoryPress}
            />
          );
        })}

        {/* Active Category Stores Feed */}
        <View style={styles.storesFeedSection}>
          <View style={styles.feedHeader}>
            <Text style={styles.feedSubtitle}>
              {matchingShops.length} {matchingShops.length === 1 ? 'STORE' : 'STORES'} NEARBY
            </Text>
            <Text style={styles.feedTitle}>
              {activeCategory.title}
            </Text>
          </View>

          {matchingShops.map((shop) => (
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
        </View>

        {/* Bottom padding to clear strips & bottom nav */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* 3. Bottom Floating Cart Pill or Free Delivery Strip */}
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: InstamartColors.ink,
    letterSpacing: -0.3,
  },
  storesFeedSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  feedHeader: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  feedSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  bottomStripsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

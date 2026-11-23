import React, { useState } from 'react';
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
import { AppTypography } from '../../ui/theme/appTypography';

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
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>('vegetables');

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
    // Toggle: if already open, collapse it; if closed, open right below this category
    setSelectedCategorySlug((prev) => (prev === category.slug ? null : category.slug));
  };

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

        {/* Category Cards with INLINE Expanded Stores right underneath */}
        {STORE_CATEGORIES.map((cat) => {
          const matchingForCat = LOCAL_SHOPS.filter(
            (s) => s.category === cat.slug || (s.categories && s.categories.includes(cat.slug))
          );
          const isSelected = selectedCategorySlug === cat.slug;

          return (
            <View key={cat.id} style={styles.categoryBlock}>
              <StoreCategoryCard
                category={cat}
                storeCount={matchingForCat.length}
                isSelected={isSelected}
                onPress={handleCategoryPress}
              />

              {/* Inline Accordion: Stores expand right below the selected card */}
              {isSelected && (
                <View style={styles.inlineStoresContainer}>
                  <View style={styles.inlineStoresHeader}>
                    <View style={styles.inlineHeaderLeft}>
                      <View style={styles.inlineDot} />
                      <Text style={styles.inlineSubtitle}>
                        {matchingForCat.length} {matchingForCat.length === 1 ? 'STORE' : 'STORES'} IN {cat.title.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.inlineHelpText}>Delivering to you</Text>
                  </View>

                  {matchingForCat.map((shop) => (
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

                  {matchingForCat.length === 0 && (
                    <View style={styles.emptyStoresContainer}>
                      <Text style={styles.emptyStoresText}>
                        No stores found in this category currently.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}

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
    paddingBottom: 110,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionSubtitle: {
    ...AppTypography.sectionLabel,
    marginBottom: 2,
  },
  sectionTitle: {
    ...AppTypography.screenTitle,
    fontSize: 18,
  },
  categoryBlock: {
    marginBottom: 4,
  },
  inlineStoresContainer: {
    marginTop: -4,
    marginBottom: 16,
    paddingTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inlineStoresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
    paddingTop: 4,
  },
  inlineHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  inlineSubtitle: {
    ...AppTypography.sectionLabel,
    letterSpacing: 0.8,
  },
  inlineHelpText: {
    ...AppTypography.cardMeta,
    fontSize: 10,
  },
  emptyStoresContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStoresText: {
    ...AppTypography.cardMeta,
    fontSize: 12,
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

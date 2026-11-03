import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useCartStore } from '../../state/useCartStore';
import { dusmintApi } from '@dusmint/api-client';
import { CartStickyBar } from '../../ui/components/CartStickyBar';
import { FreeDeliveryStrip } from '../home/widgets/FreeDeliveryStrip';

// Listing Data & Widgets
import {
  SUBCATEGORIES_DATA,
  LISTING_PRODUCTS,
  ListingProduct,
} from './data/listingData';
import { ListingAppBar } from './widgets/ListingAppBar';
import { SubcategorySidebar } from './widgets/SubcategorySidebar';
import { FilterChipsRow } from './widgets/FilterChipsRow';
import { ListingProductGrid } from './widgets/ListingProductGrid';
import { SortBottomSheet, SortOption } from './widgets/SortBottomSheet';
import { FilterBottomSheet, FilterState } from './widgets/FilterBottomSheet';

type Props = NativeStackScreenProps<RootStackParamList, 'ItemList'>;

export const ItemListScreen: React.FC<Props> = ({ route, navigation }) => {
  const { title, categoryId, vendorId } = route.params;

  // Live products & fallback state
  const [productsList, setProductsList] = useState<ListingProduct[]>(LISTING_PRODUCTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Selected Subcategory State
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('sub-all');

  // Filter & Sort States
  const [activeSort, setActiveSort] = useState<SortOption>('Relevance');
  const [filters, setFilters] = useState<FilterState>({
    onlyInStock: false,
    onlyPriceDrop: false,
    onlyVeg: false,
    maxPrice: undefined,
  });

  // Modal Visibility States
  const [isSortSheetVisible, setIsSortSheetVisible] = useState(false);
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);

  // Fetch live products from backend API / Supabase
  useEffect(() => {
    let active = true;
    const fetchCatalog = async () => {
      try {
        setIsLoading(true);
        const liveItems = await dusmintApi.getAllItems(categoryId);
        if (liveItems && liveItems.length > 0 && active) {
          let mapped: ListingProduct[] = liveItems.map((item: any) => ({
            id: item.id,
            name: item.nameEn || item.name || 'Fresh Item',
            isVeg: true,
            deliveryMins: '9 MINS',
            imageUrl: item.photoUrl || item.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
            subcategoryId: 'sub-all',
            inStock: item.isInStock !== undefined ? item.isInStock : true,
            variants: [
              {
                id: item.id,
                label: item.unit || '1 pc',
                price: Math.round((item.pricePaise || (item.price ? Number(item.price) * 100 : 3500)) / 100),
                mrp: item.mrpPaise ? Math.round(item.mrpPaise / 100) : Math.round(((item.pricePaise || 3500) / 100) * 1.25),
                unitPriceText: `₹${Math.round((item.pricePaise || 3500) / 100)} / ${item.unit || '1 pc'}`,
              },
            ],
          }));

          // If navigating from Brand Favourites (e.g. "Amul Store", "Aashirvaad Store")
          const cleanBrand = (title || '').replace(/store|deals|special/gi, '').trim().toLowerCase();
          if (cleanBrand.length >= 3) {
            const brandFiltered = mapped.filter((p) =>
              (p.name || '').toLowerCase().includes(cleanBrand)
            );
            if (brandFiltered.length > 0) {
              mapped = brandFiltered;
            }
          }

          setProductsList(mapped);
        }
      } catch (err) {
        console.warn('Live catalog fetch notice:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchCatalog();
    return () => {
      active = false;
    };
  }, [categoryId]);

  // Cart Store State
  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());

  // Screen Width calculation for 2-column grid in right pane
  const screenWidth = Dimensions.get('window').width;
  const rightWidth = screenWidth - 78; // 78px fixed sidebar
  const cardWidth = Math.floor((rightWidth - 16 - 8) / 2); // 16px horizontal padding, 8px col gap

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      // Subcategory Filter
      if (selectedSubcategory !== 'sub-all' && product.subcategoryId !== selectedSubcategory) {
        return false;
      }
      // Veg Only Filter
      if (filters.onlyVeg && !product.isVeg) {
        return false;
      }
      // Price Drop Filter
      if (filters.onlyPriceDrop && !product.hasPriceDrop) {
        return false;
      }
      // In Stock Filter
      if (filters.onlyInStock && !product.inStock) {
        return false;
      }
      // Max Price Filter
      if (filters.maxPrice) {
        const minPrice = Math.min(...product.variants.map((v) => v.price));
        if (minPrice > filters.maxPrice) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const aPrice = a.variants[0]?.price || 0;
      const bPrice = b.variants[0]?.price || 0;

      if (activeSort === 'Price: Low to High') {
        return aPrice - bPrice;
      }
      if (activeSort === 'Price: High to Low') {
        return bPrice - aPrice;
      }
      if (activeSort === 'Discount') {
        const aDisc = (a.variants[0]?.mrp || 0) - aPrice;
        const bDisc = (b.variants[0]?.mrp || 0) - bPrice;
        return bDisc - aDisc;
      }
      if (activeSort === 'Delivery Time') {
        const aMins = parseInt(a.deliveryMins, 10) || 10;
        const bMins = parseInt(b.deliveryMins, 10) || 10;
        return aMins - bMins;
      }
      return 0; // Relevance / Default
    });
  }, [productsList, selectedSubcategory, filters, activeSort]);

  const handleClearFilters = () => {
    setSelectedSubcategory('sub-all');
    setActiveSort('Relevance');
    setFilters({
      onlyInStock: false,
      onlyPriceDrop: false,
      onlyVeg: false,
      maxPrice: undefined,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* 1. Pinned App Bar */}
      <ListingAppBar
        title={title || 'Fresh Vegetables'}
        onBackPress={() => navigation.goBack()}
        onSearchPress={() => navigation.navigate('Search')}
      />

      {/* 2. Body: Left Subcategory Sidebar + Right Filter Chips & Product Grid */}
      <View style={styles.body}>
        {/* Left: Independently scrollable Subcategory Sidebar */}
        <SubcategorySidebar
          subcategories={SUBCATEGORIES_DATA}
          selectedId={selectedSubcategory}
          onSelect={(id) => setSelectedSubcategory(id)}
        />

        {/* Right: Fixed Filter Chips + Independently scrollable Product Grid */}
        <View style={styles.rightPane}>
          <FilterChipsRow
            activeSort={activeSort}
            isPriceDropActive={filters.onlyPriceDrop}
            isVegOnlyActive={filters.onlyVeg}
            onFilterPress={() => setIsFilterSheetVisible(true)}
            onSortPress={() => setIsSortSheetVisible(true)}
            onPriceDropToggle={() =>
              setFilters((prev) => ({ ...prev, onlyPriceDrop: !prev.onlyPriceDrop }))
            }
            onVegOnlyToggle={() =>
              setFilters((prev) => ({ ...prev, onlyVeg: !prev.onlyVeg }))
            }
          />

          <View style={styles.gridContainer}>
            <ListingProductGrid
              products={filteredProducts}
              cardWidth={cardWidth}
              onClearFilters={handleClearFilters}
              onProductPress={(p) =>
                navigation.navigate('ProductDetail', { productId: p.id })
              }
            />
          </View>
        </View>
      </View>

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

      {/* 4. Bottom Sheets */}
      <SortBottomSheet
        visible={isSortSheetVisible}
        activeSort={activeSort}
        onSelect={(opt) => setActiveSort(opt)}
        onClose={() => setIsSortSheetVisible(false)}
      />

      <FilterBottomSheet
        visible={isFilterSheetVisible}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        onClose={() => setIsFilterSheetVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  rightPane: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gridContainer: {
    flex: 1,
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
    backgroundColor: 'transparent',
  },
});

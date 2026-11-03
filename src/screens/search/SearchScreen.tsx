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
import { DUMMY_PRODUCTS, ProductItem } from '../home/data/homeData';
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
  'Atta',
  'Desi Ghee',
];

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [liveProducts, setLiveProducts] = useState<ProductItem[]>(DUMMY_PRODUCTS);

  useEffect(() => {
    let active = true;
    dusmintApi.getAllItems().then((items) => {
      if (items && items.length > 0 && active) {
        const mapped: ProductItem[] = items.map((i) => ({
          id: i.id,
          name: i.nameEn,
          quantityLabel: i.unit,
          price: Math.round(i.pricePaise / 100),
          mrp: i.mrpPaise ? Math.round(i.mrpPaise / 100) : Math.round((i.pricePaise / 100) * 1.25),
          tag: i.nameEn.toLowerCase().includes('tomato') ? 'BESTSELLER' : undefined,
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
        setLiveProducts(mapped);
      }
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0
  );

  const filteredProducts = query.trim().length > 0
    ? liveProducts.filter((p) =>
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
          <Ionicons name="search" size={18} color={InstamartColors.inkMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="Search groceries, sabzi, dairy..."
            placeholderTextColor={InstamartColors.inkMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus={true}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={InstamartColors.inkMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Body */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {query.trim().length === 0 ? (
          <View style={styles.trendingContainer}>
            <Text style={styles.sectionTitle}>Trending Searches</Text>
            <View style={styles.pillsRow}>
              {POPULAR_SEARCHES.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.pill}
                  onPress={() => setQuery(tag)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trending-up" size={14} color={InstamartColors.accentBlue} style={{ marginRight: 6 }} />
                  <Text style={styles.pillText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>
              {filteredProducts.length} Results for &quot;{query}&quot;
            </Text>

            {filteredProducts.length === 0 ? (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={48} color={InstamartColors.inkMuted} />
                <Text style={styles.noResultsText}>No items found matching your search</Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {filteredProducts.map((p) => (
                  <View key={p.id} style={{ marginBottom: 14 }}>
                    <ProductCard product={p} />
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
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  inputWrapper: {
    flex: 1,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: InstamartColors.ink,
  },
  scrollContent: {
    padding: 16,
  },
  trendingContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: InstamartColors.ink,
    marginBottom: 12,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: InstamartColors.tileBlue,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: InstamartColors.ink,
  },
  resultsContainer: {
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  noResults: {
    alignItems: 'center',
    marginTop: 60,
  },
  noResultsText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: InstamartColors.inkSoft,
    marginTop: 10,
  },
  cartBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});


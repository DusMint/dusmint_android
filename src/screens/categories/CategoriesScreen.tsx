import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius, CartStickyBar } from '@dusmint/ui';
import { useCartStore } from '../../state/useCartStore';
import { useAuthStore } from '../../state/useAuthStore';
import { catalogRepository, Product } from '../../data/catalogRepository';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'BrowseTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const CategoriesScreen: React.FC<Props> = ({ route, navigation }) => {
  const initialCategory = route.params?.categoryId || 'veg';
  const isVegOnly = useAuthStore((s) => s.isVegOnly);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    initialCategory === 'meat' && isVegOnly ? 'veg' : initialCategory
  );
  const [searchQuery, setSearchQuery] = useState('');

  const categories = catalogRepository.getCategories(isVegOnly);
  const rawProducts = searchQuery.trim().length > 0
    ? catalogRepository.search(searchQuery, isVegOnly)
    : catalogRepository.getProducts(activeCategoryId, isVegOnly);

  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());
  const addItem = useCartStore((s) => s.addItem);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const getItemQuantity = useCartStore((s) => s.getItemQuantity);

  const handleAdd = (product: Product) => {
    addItem(catalogRepository.toCatalogueItem(product));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Fresh</Text>
        <Text style={styles.headerSubtitle}>
          Directly from neighbourhood mandi shops
        </Text>

        {/* Search input */}
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search vegetables, meat, milk..."
            placeholderTextColor={Colors.gray500}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills (3 only: Vegetables, Meat, Milk) */}
      <View style={styles.pillsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
        >
          {categories.map((cat) => {
            const isSelected = activeCategoryId === cat.id && !searchQuery;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.8}
                onPress={() => {
                  setSearchQuery('');
                  setActiveCategoryId(cat.id);
                }}
                style={[
                  styles.pill,
                  isSelected ? styles.pillActive : styles.pillInactive,
                ]}
              >
                <Text style={styles.pillIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.pillText,
                    isSelected ? styles.pillTextActive : styles.pillTextInactive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <ScrollView
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        {rawProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🥦</Text>
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySub}>Try searching for another vegetable or dairy item.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {rawProducts.map((p) => {
              const qty = getItemQuantity(p.id);
              return (
                <View key={p.id} style={styles.card}>
                  {/* Category Tint Header for Product */}
                  <View
                    style={[
                      styles.cardImageHolder,
                      {
                        backgroundColor:
                          p.categoryId === 'veg'
                            ? Colors.mint100
                            : p.categoryId === 'meat'
                            ? Colors.errorBg
                            : Colors.yellow100,
                      },
                    ]}
                  >
                    <Text style={styles.placeholderEmoji}>
                      {p.categoryId === 'veg' ? '🥦' : p.categoryId === 'meat' ? '🍗' : '🥛'}
                    </Text>
                    {p.discountPercent ? (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{p.discountPercent}% OFF</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.cardInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {p.name}
                    </Text>
                    <Text style={styles.productUnit}>{p.unit}</Text>

                    <View style={styles.priceRow}>
                      <View>
                        <Text style={styles.productPrice}>₹{p.price}</Text>
                        {p.mrp > p.price ? (
                          <Text style={styles.mrpText}>₹{p.mrp}</Text>
                        ) : null}
                      </View>

                      {qty === 0 ? (
                        <TouchableOpacity
                          style={styles.addBtn}
                          activeOpacity={0.8}
                          onPress={() => handleAdd(p)}
                        >
                          <Text style={styles.addBtnText}>ADD</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.stepper}>
                          <TouchableOpacity
                            style={styles.stepBtn}
                            onPress={() => decrementItem(p.id)}
                          >
                            <Text style={styles.stepBtnText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.stepQty}>{qty}</Text>
                          <TouchableOpacity
                            style={styles.stepBtn}
                            onPress={() => incrementItem(p.id)}
                          >
                            <Text style={styles.stepBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Sticky Cart Bar */}
      <CartStickyBar
        totalItems={totalItemsCount}
        totalPaise={totalPaise}
        onPressViewCart={() => navigation.navigate('Cart')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray300,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: 22,
    color: Colors.ink900,
  },
  headerSubtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 12,
    color: Colors.gray600,
    marginTop: 2,
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mint50,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.ink900,
    fontFamily: Typography.fontFamily.body,
  },
  clearSearch: {
    fontSize: 14,
    color: Colors.gray600,
    padding: 4,
  },
  pillsContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray300,
  },
  pillsScroll: {
    paddingHorizontal: Spacing.base,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 36,
    borderRadius: BorderRadius.pill,
  },
  pillActive: {
    backgroundColor: Colors.green700,
  },
  pillInactive: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  pillIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  pillText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.heading,
  },
  pillTextActive: {
    color: Colors.white,
  },
  pillTextInactive: {
    color: Colors.ink900,
  },
  gridContainer: {
    padding: Spacing.base,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray300,
    overflow: 'hidden',
  },
  cardImageHolder: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.yellow500,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
    color: Colors.ink900,
  },
  cardInfo: {
    padding: 10,
  },
  productName: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 13,
    color: Colors.ink900,
    lineHeight: 18,
    minHeight: 36,
  },
  productUnit: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: Colors.gray600,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: 15,
    color: Colors.green700,
  },
  mrpText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: Colors.gray600,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    backgroundColor: Colors.green700,
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: 12,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.green700,
    borderRadius: 10,
    height: 32,
    paddingHorizontal: 4,
  },
  stepBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stepBtnText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: 14,
  },
  stepQty: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: 12,
    paddingHorizontal: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: 16,
    color: Colors.ink900,
  },
  emptySub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 12,
    color: Colors.gray600,
    marginTop: 4,
  },
});

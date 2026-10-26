import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  SlotBadge,
  TrustBadge,
  CartStickyBar,
  ItemCard,
} from '@dusmint/ui';
import { useCartStore } from '../../state/useCartStore';
import { useLocationStore } from '../../state/useLocationStore';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Sample mock data for instant interaction
const mockCategories = [
  { id: 'cat-veg', title: 'Vegetables', titleHi: 'ताजा सब्जियां', icon: '🥦', color: '#DCFCE7' },
  { id: 'cat-fruit', title: 'Fruits', titleHi: 'ताजे फल', icon: '🍎', color: '#FEE2E2' },
  { id: 'cat-dairy', title: 'Milk & Dairy', titleHi: 'दूध व दही', icon: '🥛', color: '#E0F2FE' },
  { id: 'cat-meat', title: 'Meat & Eggs', titleHi: 'मांस व अंडे', icon: '🍗', color: '#FFEDD5' },
  { id: 'cat-staple', title: 'Atta & Dal', titleHi: 'दाल व आटा', icon: '🌾', color: '#FEF3C7' },
];

const mockPopularItems = [
  {
    id: 'item-1',
    vendorId: 'vendor-1',
    categoryId: 'cat-veg',
    nameEn: 'Fresh Desi Tomato (Hybrid)',
    nameHi: 'ताजा टमाटर (हाइब्रिड)',
    unit: '1 kg',
    stepQuantity: 1,
    pricePaise: 3200,
    mandiBandMinPaise: 2500,
    mandiBandMaxPaise: 3800,
    isInStock: true,
  },
  {
    id: 'item-2',
    vendorId: 'vendor-1',
    categoryId: 'cat-veg',
    nameEn: 'Nashik Red Onion (Pyaaz)',
    nameHi: 'नासिक लाल प्याज',
    unit: '1 kg',
    stepQuantity: 1,
    pricePaise: 3500,
    mandiBandMinPaise: 3000,
    mandiBandMaxPaise: 4200,
    isInStock: true,
  },
  {
    id: 'item-3',
    vendorId: 'vendor-2',
    categoryId: 'cat-fruit',
    nameEn: 'Robusta Banana (Kela)',
    nameHi: 'पका केला',
    unit: '1 dozen',
    stepQuantity: 1,
    pricePaise: 4500,
    mandiBandMinPaise: 3800,
    mandiBandMaxPaise: 5500,
    isInStock: true,
  },
  {
    id: 'item-4',
    vendorId: 'vendor-3',
    categoryId: 'cat-dairy',
    nameEn: 'Fresh Malai Paneer',
    nameHi: 'मलाई पनीर',
    unit: '200 g',
    stepQuantity: 1,
    pricePaise: 8500,
    mandiBandMinPaise: 7500,
    mandiBandMaxPaise: 9500,
    isInStock: true,
  },
];

const mockVendors = [
  {
    id: 'vendor-1',
    name: 'Patidar Fresh Sabzi Mandi',
    category: 'Vegetables',
    rating: 4.9,
    distance: '0.8 km',
    score: '98% Weight Accuracy',
  },
  {
    id: 'vendor-2',
    name: 'Apna Fruit Bhandar',
    category: 'Fruits',
    rating: 4.8,
    distance: '1.1 km',
    score: '99% On-time Pack',
  },
];

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());
  const addItem = useCartStore((s) => s.addItem);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const getItemQuantity = useCartStore((s) => s.getItemQuantity);
  
  const currentAddress = useLocationStore((s) => s.currentAddress);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Location Bar */}
      <View style={styles.topBar}>
        <View style={styles.locationSection}>
          <Text style={styles.locationPin}>📍</Text>
          <View>
            <View style={styles.locationRow}>
              <Text style={styles.deliveringLabel}>DELIVERING TO</Text>
              <Text style={styles.changeLink}>Change</Text>
            </View>
            <Text style={styles.addressText} numberOfLines={1}>
              {currentAddress ? `${currentAddress.houseNo}, ${currentAddress.streetArea}` : 'Vijay Nagar, Scheme 54, Indore'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
          style={styles.cartIconBtn}
        >
          <Text style={styles.cartEmoji}>🛒</Text>
          {totalItemsCount > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeCount}>{totalItemsCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Search')}
          style={styles.searchBar}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>
            Search vegetables, fruits, dairy, mandi rates...
          </Text>
        </TouchableOpacity>

        {/* Slot Guarantee Banner */}
        <View style={styles.slotBanner}>
          <View style={styles.slotBannerHeader}>
            <Text style={styles.slotTitle}>Today's Delivery Windows</Text>
            <TrustBadge type="weight_verified" />
          </View>

          <View style={styles.slotsRow}>
            <SlotBadge
              slotType="morning"
              timeWindow="7:00 AM - 10:00 AM"
              isSelected={true}
              style={{ flex: 1, marginRight: 6 }}
            />
            <SlotBadge
              slotType="evening"
              timeWindow="5:00 PM - 8:00 PM"
              style={{ flex: 1, marginLeft: 6 }}
            />
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CategoriesTab')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          {mockCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('ItemList', {
                  categoryId: cat.id,
                  title: cat.title,
                })
              }
              style={styles.categoryCard}
            >
              <View style={[styles.catIconCircle, { backgroundColor: cat.color }]}>
                <Text style={styles.catEmoji}>{cat.icon}</Text>
              </View>
              <Text style={styles.catTitle}>{cat.title}</Text>
              <Text style={styles.catVernacular}>{cat.titleHi}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Mandi Rate Assurance Banner */}
        <View style={styles.mandiBanner}>
          <View style={styles.mandiLeft}>
            <Text style={styles.mandiEmoji}>📊</Text>
            <View>
              <Text style={styles.mandiHeading}>Direct Mandi Price Assurance</Text>
              <Text style={styles.mandiSub}>
                Prices checked daily against government mandi rates. No hidden markups.
              </Text>
            </View>
          </View>
        </View>

        {/* Popular Essentials List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Kitchen Essentials</Text>
          <Text style={styles.sectionSub}>Full weight guaranteed on electronic scale</Text>
        </View>

        <View style={styles.itemGrid}>
          {mockPopularItems.map((item) => (
            <View key={item.id} style={styles.gridItemWrapper}>
              <ItemCard
                id={item.id}
                nameEn={item.nameEn}
                nameHi={item.nameHi}
                unit={item.unit}
                pricePaise={item.pricePaise}
                mandiBandMinPaise={item.mandiBandMinPaise}
                mandiBandMaxPaise={item.mandiBandMaxPaise}
                quantityInCart={getItemQuantity(item.id)}
                onAdd={() => addItem(item)}
                onIncrement={() => incrementItem(item.id)}
                onDecrement={() => decrementItem(item.id)}
              />
            </View>
          ))}
        </View>

        {/* Anchor Vendors Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Anchor Vendors in your 2km Cluster</Text>
          <Text style={styles.sectionSub}>Fulfilled directly from local verified shops</Text>
        </View>

        {mockVendors.map((vendor) => (
          <TouchableOpacity
            key={vendor.id}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('VendorShop', { vendorId: vendor.id })}
            style={styles.vendorCard}
          >
            <View style={styles.vendorHeader}>
              <View>
                <Text style={styles.vendorName}>{vendor.name}</Text>
                <Text style={styles.vendorCategory}>
                  {vendor.category} • {vendor.distance} away
                </Text>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>★ {vendor.rating}</Text>
              </View>
            </View>
            <View style={styles.vendorFooter}>
              <TrustBadge type="anchor_vendor" customText={vendor.score} />
            </View>
          </TouchableOpacity>
        ))}

        {/* Bottom space for sticky cart bar */}
        <View style={{ height: 90 }} />
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
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationPin: {
    fontSize: 22,
    marginRight: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveringLabel: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  changeLink: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
    color: Colors.primary,
    marginLeft: 8,
  },
  addressText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.textPrimary,
  },
  cartIconBtn: {
    padding: 8,
    position: 'relative',
  },
  cartEmoji: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.orange,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeCount: {
    color: Colors.textWhite,
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLightGrey,
    borderRadius: BorderRadius.roundButton,
    paddingHorizontal: Spacing.base,
    height: 48,
    marginBottom: Spacing.base,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchPlaceholder: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    color: Colors.placeholder,
    flex: 1,
  },
  slotBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.base,
  },
  slotBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  slotTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.sm,
    color: Colors.primaryDark,
  },
  slotsRow: {
    flexDirection: 'row',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  sectionSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.secondary,
  },
  viewAllText: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
  },
  categoriesList: {
    paddingVertical: 6,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 14,
    width: 72,
  },
  catIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  catEmoji: {
    fontSize: 28,
  },
  catTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: 11,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  catVernacular: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 10,
    color: Colors.secondary,
    textAlign: 'center',
  },
  mandiBanner: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.base,
  },
  mandiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mandiEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  mandiHeading: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.sm,
    color: '#6B21A8',
  },
  mandiSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: '#7E22CE',
    marginTop: 2,
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  gridItemWrapper: {
    width: '50%',
  },
  vendorCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginVertical: 6,
    ...Shadows.light,
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vendorName: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  vendorCategory: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.secondary,
    marginTop: 2,
  },
  ratingBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  ratingText: {
    color: Colors.textWhite,
    fontSize: 11,
    fontFamily: Typography.fontFamily.heading,
  },
  vendorFooter: {
    marginTop: Spacing.sm,
  },
});

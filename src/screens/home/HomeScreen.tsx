import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius, CartStickyBar } from '@dusmint/ui';
import { useCartStore } from '../../state/useCartStore';
import { useAuthStore } from '../../state/useAuthStore';
import { catalogRepository, Product, Shop, Slot } from '../../data/catalogRepository';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const isVegOnly = useAuthStore((s) => s.isVegOnly);
  const toggleVegOnly = useAuthStore((s) => s.toggleVegOnly);

  // Cart Store
  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());
  const addItem = useCartStore((s) => s.addItem);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const getItemQuantity = useCartStore((s) => s.getItemQuantity);

  // Rotating Banners
  const banners = catalogRepository.getBanners(isVegOnly);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Rotating Search Placeholder
  const searchPlaceholders = ['palak', 'chicken', 'paneer', 'desi tamatar', 'fresh dahi'];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Delivery Slots State & Modal
  const slots = catalogRepository.getSlots();
  const [selectedSlot, setSelectedSlot] = useState<Slot>(slots[0]);
  const [slotModalVisible, setSlotModalVisible] = useState(false);

  // Promise Modal State
  const [promiseModalVisible, setPromiseModalVisible] = useState(false);

  // Fresh Today Product Row Category Filter
  const categories = catalogRepository.getCategories(isVegOnly);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'veg' | 'meat' | 'milk'>('veg');

  // Make sure if activeCategoryTab was meat and vegOnly turned on, switch to veg
  useEffect(() => {
    if (isVegOnly && activeCategoryTab === 'meat') {
      setActiveCategoryTab('veg');
    }
  }, [isVegOnly, activeCategoryTab]);

  const freshProducts = catalogRepository.getProducts(activeCategoryTab, isVegOnly);
  const shops = catalogRepository.getShops(isVegOnly);

  const handleAddProduct = (product: Product) => {
    addItem(catalogRepository.toCatalogueItem(product));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================= */}
        {/* SECTION 1: HERO WITH HEADER (~220dp height)               */}
        {/* ========================================================= */}
        <View style={styles.heroContainer}>
          {/* Native SVG Linear Gradient Background: green900 to green700 */}
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
            <Defs>
              <SvgGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={Colors.green900} stopOpacity="1" />
                <Stop offset="1" stopColor={Colors.green700} stopOpacity="1" />
              </SvgGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#heroGradient)" />
          </Svg>

          {/* Top Header Row */}
          <View style={styles.headerRow}>
            {/* Left: Delivering To + Location */}
            <TouchableOpacity style={styles.locationBlock} activeOpacity={0.8}>
              <Text style={styles.deliveringToLabel}>Delivering to</Text>
              <View style={styles.locationValueRow}>
                <Text style={styles.locationValueText}>Hazratganj, Lucknow</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.white} />
              </View>
            </TouchableOpacity>

            {/* Right: Veg Only Switch + Cart Icon */}
            <View style={styles.headerRightActions}>
              {/* Veg Only Toggle Button */}
              <TouchableOpacity
                style={[styles.vegSwitch, isVegOnly && styles.vegSwitchActive]}
                onPress={toggleVegOnly}
                activeOpacity={0.8}
              >
                <View style={styles.vegSquare}>
                  <View style={[styles.vegDot, isVegOnly && styles.vegDotActive]} />
                </View>
                <Text style={[styles.vegLabel, isVegOnly && styles.vegLabelActive]}>
                  VEG
                </Text>
              </TouchableOpacity>

              {/* Cart Icon with Count Badge */}
              <TouchableOpacity
                style={styles.cartIconButton}
                onPress={() => navigation.navigate('Cart')}
                activeOpacity={0.8}
              >
                <Ionicons name="cart-outline" size={24} color={Colors.white} />
                {totalItemsCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{totalItemsCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Banner Content (Auto-Rotating) */}
          {banners[activeBannerIdx] && (
            <View style={styles.bannerContent}>
              {banners[activeBannerIdx].offerChip && (
                <View style={styles.offerPill}>
                  <Text style={styles.offerPillText}>
                    {banners[activeBannerIdx].offerChip}
                  </Text>
                </View>
              )}
              <Text style={styles.bannerHeadline} numberOfLines={2}>
                {banners[activeBannerIdx].headline}
              </Text>
              <Text style={styles.bannerSubline} numberOfLines={1}>
                {banners[activeBannerIdx].subline}
              </Text>

              {/* Dot Indicators */}
              <View style={styles.dotsRow}>
                {banners.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setActiveBannerIdx(idx)}
                    style={[
                      styles.dot,
                      activeBannerIdx === idx ? styles.activeDot : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ========================================================= */}
        {/* SECTION 2: SEARCH BAR (Overlaps hero bottom by 26dp)      */}
        {/* ========================================================= */}
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.gray600} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search "${searchPlaceholders[placeholderIdx]}"...`}
              placeholderTextColor={Colors.gray500}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.trim().length > 0) {
                  navigation.navigate('MainTabs', {
                    screen: 'BrowseTab',
                    params: { categoryId: activeCategoryTab },
                  });
                }
              }}
              onFocus={() => {
                navigation.navigate('MainTabs', {
                  screen: 'BrowseTab',
                  params: { categoryId: activeCategoryTab },
                });
              }}
            />
          </View>
        </View>

        {/* ========================================================= */}
        {/* SECTION 3: DELIVERY SLOT STRIP                             */}
        {/* ========================================================= */}
        <TouchableOpacity
          style={styles.slotStrip}
          activeOpacity={0.85}
          onPress={() => setSlotModalVisible(true)}
        >
          <View style={styles.slotClockBox}>
            <Ionicons name="time-outline" size={24} color={Colors.green700} />
          </View>
          <View style={styles.slotTextCol}>
            <Text style={styles.slotTitle}>Next slot: {selectedSlot.display}</Text>
            <Text style={styles.slotSub}>{selectedSlot.cutoffDisplay}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.green700} />
        </TouchableOpacity>

        {/* ========================================================= */}
        {/* SECTION 4: SHOP BY CATEGORY (3 Cards Only: Veg, Meat, Milk) */}
        {/* ========================================================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by category</Text>
        </View>

        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryCard, { backgroundColor: cat.tint }]}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('MainTabs', {
                  screen: 'BrowseTab',
                  params: { categoryId: cat.id },
                })
              }
            >
              <Text style={styles.categoryIconLarge}>{cat.icon}</Text>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ========================================================= */}
        {/* SECTION 5: PROMISE STRIP                                 */}
        {/* ========================================================= */}
        <TouchableOpacity
          style={styles.promiseStrip}
          activeOpacity={0.9}
          onPress={() => setPromiseModalVisible(true)}
        >
          <View style={styles.promiseItemsRow}>
            <View style={styles.promiseCol}>
              <Text style={styles.promiseEmoji}>⚖️</Text>
              <Text style={styles.promiseLabel}>Full weight</Text>
            </View>
            <View style={styles.promiseColDivider} />
            <View style={styles.promiseCol}>
              <Text style={styles.promiseEmoji}>🏷️</Text>
              <Text style={styles.promiseLabel}>Fair price</Text>
            </View>
            <View style={styles.promiseColDivider} />
            <View style={styles.promiseCol}>
              <Text style={styles.promiseEmoji}>⏱️</Text>
              <Text style={styles.promiseLabel}>On-time slot</Text>
            </View>
          </View>
          <Text style={styles.promiseTagline}>"Poora tola, poora bharosa"</Text>
        </TouchableOpacity>

        {/* ========================================================= */}
        {/* SECTION 6: FRESH TODAY (Horizontal Product Row)           */}
        {/* ========================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Fresh today</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MainTabs', {
                screen: 'BrowseTab',
                params: { categoryId: activeCategoryTab },
              })
            }
          >
            <Text style={styles.seeAllText}>See all ›</Text>
          </TouchableOpacity>
        </View>

        {/* Category Segmented Chips */}
        <View style={styles.chipsRow}>
          {(['veg', 'meat', 'milk'] as const)
            .filter((cat) => (isVegOnly ? cat !== 'meat' : true))
            .map((catKey) => {
              const isSelected = activeCategoryTab === catKey;
              const label =
                catKey === 'veg' ? 'Vegetables' : catKey === 'meat' ? 'Meat' : 'Milk';
              return (
                <TouchableOpacity
                  key={catKey}
                  onPress={() => setActiveCategoryTab(catKey)}
                  style={[
                    styles.chip,
                    isSelected ? styles.chipSelected : styles.chipUnselected,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </View>

        {/* Product Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productRowScroll}
        >
          {freshProducts.map((p) => {
            const qty = getItemQuantity(p.id);
            return (
              <View key={p.id} style={styles.productCard}>
                <View
                  style={[
                    styles.productImageContainer,
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
                  <Text style={styles.productImagePlaceholder}>
                    {p.categoryId === 'veg' ? '🥦' : p.categoryId === 'meat' ? '🍗' : '🥛'}
                  </Text>
                  {p.discountPercent ? (
                    <View style={styles.productDiscountBadge}>
                      <Text style={styles.productDiscountText}>{p.discountPercent}% OFF</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.productCardBody}>
                  <Text style={styles.productCardName} numberOfLines={2}>
                    {p.name}
                  </Text>
                  <Text style={styles.productCardUnit}>{p.unit}</Text>

                  <View style={styles.productCardFooter}>
                    <View>
                      <Text style={styles.productCardPrice}>₹{p.price}</Text>
                      {p.mrp > p.price ? (
                        <Text style={styles.productCardMrp}>₹{p.mrp}</Text>
                      ) : null}
                    </View>

                    {qty === 0 ? (
                      <TouchableOpacity
                        style={styles.productAddBtn}
                        onPress={() => handleAddProduct(p)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.productAddBtnText}>Add</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.productStepper}>
                        <TouchableOpacity
                          style={styles.productStepBtn}
                          onPress={() => decrementItem(p.id)}
                        >
                          <Text style={styles.productStepBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.productStepQty}>{qty}</Text>
                        <TouchableOpacity
                          style={styles.productStepBtn}
                          onPress={() => incrementItem(p.id)}
                        >
                          <Text style={styles.productStepBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* ========================================================= */}
        {/* SECTION 7: TRUSTED SHOPS NEAR YOU                        */}
        {/* ========================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Trusted shops near you</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'BrowseTab' })}>
            <Text style={styles.seeAllText}>See all ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.shopsList}>
          {shops.map((shop) => (
            <TouchableOpacity
              key={shop.id}
              style={styles.shopCard}
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate('MainTabs', {
                  screen: 'BrowseTab',
                  params: { categoryId: shop.category },
                })
              }
            >
              {/* Photo Area with Verified Badge */}
              <View
                style={[
                  styles.shopPhotoBanner,
                  {
                    backgroundColor:
                      shop.category === 'veg'
                        ? Colors.mint100
                        : shop.category === 'meat'
                        ? Colors.errorBg
                        : Colors.yellow100,
                  },
                ]}
              >
                <Text style={styles.shopEmoji}>
                  {shop.category === 'veg' ? '🏪' : shop.category === 'meat' ? '🥩' : '🥛'}
                </Text>
                {shop.weightVerified && (
                  <View style={styles.weightVerifiedBadge}>
                    <Text style={styles.weightVerifiedIcon}>⚖️</Text>
                    <Text style={styles.weightVerifiedText}>Weight verified</Text>
                  </View>
                )}
              </View>

              {/* Shop Info */}
              <View style={styles.shopDetails}>
                <View style={styles.shopNameRow}>
                  <Text style={styles.shopNameText}>{shop.name}</Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={11} color={Colors.green700} />
                    <Text style={styles.ratingText}>{shop.rating}</Text>
                  </View>
                </View>

                <Text style={styles.shopMetaRow}>
                  {shop.categoryLabel} · {shop.distanceKm} km ·{' '}
                  <Text style={styles.shopOpenStatus}>Open till {shop.openTill}</Text>
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom breathing space */}
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* ========================================================= */}
      {/* SECTION 9: STICKY CART BAR (When cart not empty)         */}
      {/* ========================================================= */}
      <CartStickyBar
        totalItems={totalItemsCount}
        totalPaise={totalPaise}
        onPressViewCart={() => navigation.navigate('Cart')}
      />

      {/* ========================================================= */}
      {/* DELIVERY SLOT SELECTION MODAL                             */}
      {/* ========================================================= */}
      <Modal
        visible={slotModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSlotModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSlotModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choose Delivery Slot</Text>
            <Text style={styles.modalSub}>
              Orders are batched to guarantee full-weight checks and on-time drop.
            </Text>

            {slots.map((slot) => {
              const isSelected = selectedSlot.id === slot.id;
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slotModalChoice,
                    isSelected && styles.slotModalChoiceSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedSlot(slot);
                    setSlotModalVisible(false);
                  }}
                >
                  <Ionicons
                    name="time"
                    size={22}
                    color={isSelected ? Colors.green700 : Colors.gray600}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.slotChoiceTitle}>{slot.display}</Text>
                    <Text style={styles.slotChoiceSub}>{slot.cutoffDisplay}</Text>
                  </View>
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={isSelected ? Colors.green700 : Colors.gray300}
                  />
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setSlotModalVisible(false)}
            >
              <Text style={styles.modalDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ========================================================= */}
      {/* PROMISE EXPLANATION MODAL                                 */}
      {/* ========================================================= */}
      <Modal
        visible={promiseModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPromiseModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPromiseModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>"Poora tola, poora bharosa"</Text>
            <Text style={styles.modalSub}>Our 3-point customer trust guarantee</Text>

            <View style={styles.promiseModalItem}>
              <Text style={styles.promiseModalIcon}>⚖️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.promiseModalItemTitle}>Full Weight Guaranteed</Text>
                <Text style={styles.promiseModalItemDesc}>
                  Every vegetable, cut meat, and dairy item is logged on certified digital scales before tamper-evident QR sealing.
                </Text>
              </View>
            </View>

            <View style={styles.promiseModalItem}>
              <Text style={styles.promiseModalIcon}>🏷️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.promiseModalItemTitle}>Fair Mandi Prices</Text>
                <Text style={styles.promiseModalItemDesc}>
                  Transparent rates linked to daily government mandi price benchmarks. No surprise surges.
                </Text>
              </View>
            </View>

            <View style={styles.promiseModalItem}>
              <Text style={styles.promiseModalIcon}>⏱️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.promiseModalItemTitle}>Guaranteed Slot Drop</Text>
                <Text style={styles.promiseModalItemDesc}>
                  Pre-ordered items are batched and delivered reliably in your morning or evening slot.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setPromiseModalVisible(false)}
            >
              <Text style={styles.modalDoneBtnText}>Understood</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.green900,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  /* Section 1: Hero & Header */
  heroContainer: {
    height: 220,
    paddingTop: 10,
    paddingHorizontal: Spacing.base,
    justifyContent: 'space-between',
    paddingBottom: 36, // space before search bar overlap
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationBlock: {
    justifyContent: 'center',
  },
  deliveringToLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'NotoSans-Medium',
  },
  locationValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationValueText: {
    color: Colors.white,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Typography.fontFamily.heading,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vegSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  vegSwitchActive: {
    backgroundColor: Colors.white,
  },
  vegSquare: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  vegDotActive: {
    backgroundColor: Colors.green700,
  },
  vegLabel: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.headingBold,
    color: Colors.white,
  },
  vegLabelActive: {
    color: Colors.green900,
  },
  cartIconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 6,
    right: 4,
    backgroundColor: Colors.yellow500,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: Colors.ink900,
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
  },
  bannerContent: {
    paddingBottom: 4,
  },
  offerPill: {
    backgroundColor: Colors.yellow500,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  offerPillText: {
    color: Colors.ink900,
    fontSize: 11,
    fontFamily: Typography.fontFamily.headingBold,
  },
  bannerHeadline: {
    color: Colors.white,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: Typography.fontFamily.headingBold,
  },
  bannerSubline: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Typography.fontFamily.body,
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 18,
    backgroundColor: Colors.yellow500,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },

  /* Section 2: Search Bar */
  searchBarWrapper: {
    paddingHorizontal: Spacing.base,
    marginTop: -26, // Overlaps hero bottom by 26
    zIndex: 10,
  },
  searchBar: {
    height: 52,
    backgroundColor: Colors.white,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.gray300,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Typography.fontFamily.body,
    color: Colors.ink900,
  },

  /* Section 3: Delivery Slot Strip */
  slotStrip: {
    marginHorizontal: Spacing.base,
    marginTop: 16,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.mint100,
    borderWidth: 1,
    borderColor: 'rgba(17, 102, 58, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  slotClockBox: {
    marginRight: 12,
  },
  slotTextCol: {
    flex: 1,
  },
  slotTitle: {
    color: Colors.ink900,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Typography.fontFamily.heading,
  },
  slotSub: {
    color: Colors.gray600,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Typography.fontFamily.body,
    marginTop: 2,
  },

  /* Section 4: Shop by Category */
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: Spacing.base,
  },
  sectionTitle: {
    color: Colors.ink900,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: Typography.fontFamily.headingBold,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    height: 120,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  categoryIconLarge: {
    fontSize: 42,
    marginBottom: 6,
  },
  categoryName: {
    color: Colors.ink900,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Typography.fontFamily.heading,
  },

  /* Section 5: Promise Strip */
  promiseStrip: {
    marginHorizontal: Spacing.base,
    marginTop: 24,
    height: 72,
    borderRadius: 12,
    backgroundColor: Colors.mint50,
    borderWidth: 1,
    borderColor: 'rgba(26, 138, 79, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  promiseItemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  promiseCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promiseEmoji: {
    fontSize: 16,
  },
  promiseLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Typography.fontFamily.heading,
    color: Colors.green700,
  },
  promiseColDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.gray300,
  },
  promiseTagline: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Typography.fontFamily.body,
    color: Colors.gray600,
    marginTop: 4,
    fontStyle: 'italic',
  },

  /* Section 6: Fresh Today */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: Spacing.base,
  },
  seeAllText: {
    color: Colors.green700,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Typography.fontFamily.heading,
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: BorderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.green700,
  },
  chipUnselected: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  chipText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.heading,
  },
  chipTextSelected: {
    color: Colors.white,
  },
  chipTextUnselected: {
    color: Colors.ink900,
  },
  productRowScroll: {
    paddingHorizontal: Spacing.base,
    gap: 12,
  },
  productCard: {
    width: 148,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray300,
    overflow: 'hidden',
  },
  productImageContainer: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productImagePlaceholder: {
    fontSize: 48,
  },
  productDiscountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.yellow500,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  productDiscountText: {
    color: Colors.ink900,
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
  },
  productCardBody: {
    padding: 10,
  },
  productCardName: {
    color: Colors.ink900,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Typography.fontFamily.heading,
    minHeight: 36,
  },
  productCardUnit: {
    color: Colors.gray600,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: Typography.fontFamily.body,
    marginTop: 2,
  },
  productCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productCardPrice: {
    color: Colors.green700,
    fontSize: 15,
    fontFamily: Typography.fontFamily.headingBold,
  },
  productCardMrp: {
    color: Colors.gray600,
    fontSize: 11,
    fontFamily: Typography.fontFamily.body,
    textDecorationLine: 'line-through',
  },
  productAddBtn: {
    backgroundColor: Colors.green700,
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productAddBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: Typography.fontFamily.headingBold,
  },
  productStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.green700,
    borderRadius: 10,
    height: 32,
    paddingHorizontal: 4,
  },
  productStepBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  productStepBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Typography.fontFamily.headingBold,
  },
  productStepQty: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: Typography.fontFamily.headingBold,
    paddingHorizontal: 4,
  },

  /* Section 7: Trusted Shops */
  shopsList: {
    paddingHorizontal: Spacing.base,
    gap: 12,
  },
  shopCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray300,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  shopPhotoBanner: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shopEmoji: {
    fontSize: 48,
  },
  weightVerifiedBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
    elevation: 2,
  },
  weightVerifiedIcon: {
    fontSize: 12,
  },
  weightVerifiedText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.headingBold,
    color: Colors.green700,
  },
  shopDetails: {
    padding: 12,
  },
  shopNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopNameText: {
    fontSize: 15,
    color: Colors.ink900,
    fontFamily: Typography.fontFamily.heading,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mint100,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.headingBold,
    color: Colors.green700,
  },
  shopMetaRow: {
    fontSize: 12,
    color: Colors.gray600,
    fontFamily: Typography.fontFamily.body,
    marginTop: 4,
  },
  shopOpenStatus: {
    color: Colors.green700,
    fontFamily: Typography.fontFamily.heading,
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    color: Colors.ink900,
    fontFamily: Typography.fontFamily.headingBold,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.gray600,
    fontFamily: Typography.fontFamily.body,
    marginTop: 4,
    marginBottom: 16,
  },
  slotModalChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    marginBottom: 10,
    backgroundColor: Colors.white,
  },
  slotModalChoiceSelected: {
    borderColor: Colors.green700,
    backgroundColor: Colors.mint50,
  },
  slotChoiceTitle: {
    fontSize: 14,
    color: Colors.ink900,
    fontFamily: Typography.fontFamily.heading,
  },
  slotChoiceSub: {
    fontSize: 11,
    color: Colors.gray600,
    fontFamily: Typography.fontFamily.body,
    marginTop: 2,
  },
  modalDoneBtn: {
    backgroundColor: Colors.green700,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  modalDoneBtnText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: 15,
  },
  promiseModalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  promiseModalIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  promiseModalItemTitle: {
    fontSize: 14,
    color: Colors.ink900,
    fontFamily: Typography.fontFamily.heading,
  },
  promiseModalItemDesc: {
    fontSize: 12,
    color: Colors.gray600,
    fontFamily: Typography.fontFamily.body,
    marginTop: 2,
    lineHeight: 18,
  },
});

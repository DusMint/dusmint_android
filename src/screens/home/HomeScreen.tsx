import React, { useState, useEffect } from 'react';
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
  AppState,
} from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius, CartStickyBar, ItemCard } from '@dusmint/ui';
import { useCartStore } from '../../state/useCartStore';
import { useAuthStore } from '../../state/useAuthStore';
import { useLocationStore } from '../../state/useLocationStore';
import { catalogRepository, Product, Shop, Slot } from '../../data/catalogRepository';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

const { width } = Dimensions.get('window');

// Category icons list below banner (like the reference screenshot)
interface CategoryIconItem {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
  catFilter: 'veg' | 'meat' | 'milk' | 'all';
}

const CATEGORY_ICONS: CategoryIconItem[] = [
  { id: 'all', name: 'All', emoji: '🧺', bgColor: '#E8F5EC', catFilter: 'all' },
  { id: 'veg', name: 'Vegetables', emoji: '🥦', bgColor: '#DCFCE7', catFilter: 'veg' },
  { id: 'milk', name: 'Milk & Dahi', emoji: '🥛', bgColor: '#FFF3C4', catFilter: 'milk' },
  { id: 'paneer', name: 'Paneer & Ghee', emoji: '🧈', bgColor: '#FEF3C7', catFilter: 'milk' },
  { id: 'meat', name: 'Fresh Meat', emoji: '🍗', bgColor: '#FDECEA', catFilter: 'meat' },
  { id: 'eggs', name: 'Farm Eggs', emoji: '🥚', bgColor: '#FFEDD5', catFilter: 'meat' },
  { id: 'herbs', name: 'Mandi Herbs', emoji: '🌿', bgColor: '#E0F2FE', catFilter: 'veg' },
];

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const isVegOnly = useAuthStore((s) => s.isVegOnly);
  const toggleVegOnly = useAuthStore((s) => s.toggleVegOnly);

  // Live Location & Reverse Geocoding
  const userAddress = useLocationStore((s) => s.userAddress);
  const shortAddress = useLocationStore((s) => s.shortAddress);
  const isLocating = useLocationStore((s) => s.isLocating);
  const hasPermission = useLocationStore((s) => s.hasPermission);
  const fetchUserLocation = useLocationStore((s) => s.fetchUserLocation);
  const handleEnableLocation = useLocationStore((s) => s.handleEnableLocation);

  const [loadingDots, setLoadingDots] = useState('.');

  useEffect(() => {
    fetchUserLocation();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        fetchUserLocation();
      }
    });

    return () => {
      sub.remove();
    };
  }, [fetchUserLocation]);

  useEffect(() => {
    if (isLocating || !userAddress) {
      const interval = setInterval(() => {
        setLoadingDots((prev) => (prev.length >= 4 ? '.' : prev + '.'));
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isLocating, userAddress]);

  // Cart Store
  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());
  const addItem = useCartStore((s) => s.addItem);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const getItemQuantity = useCartStore((s) => s.getItemQuantity);

  // Rotating Search Placeholder
  const searchPlaceholders = ['desi tamatar', 'palak', 'fresh paneer', 'chicken curry cut', 'cow milk'];
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [searchPlaceholders.length]);

  // Delivery Slots State & Modal
  const slots = catalogRepository.getSlots();
  const [selectedSlot, setSelectedSlot] = useState<Slot>(slots[0]);
  const [slotModalVisible, setSlotModalVisible] = useState(false);

  // Promise Modal State
  const [promiseModalVisible, setPromiseModalVisible] = useState(false);

  // Selected Category Icon Filter
  const [selectedIconId, setSelectedIconId] = useState<string>('all');

  // Filtered Category Icons (remove meat when veg-only is on)
  const visibleCategoryIcons = CATEGORY_ICONS.filter(
    (item) => !(isVegOnly && (item.id === 'meat' || item.id === 'eggs'))
  );

  // Determine current active products
  const currentCatFilter =
    visibleCategoryIcons.find((c) => c.id === selectedIconId)?.catFilter || 'all';

  const freshProducts =
    currentCatFilter === 'all'
      ? catalogRepository.getProducts(undefined, isVegOnly).slice(0, 10)
      : catalogRepository.getProducts(currentCatFilter, isVegOnly);

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
        {/* 1. HERO BANNER CANVAS (Address, Search, Hamper Showcases) */}
        {/* ========================================================= */}
        <View style={styles.heroCanvas}>
          {/* Deep Forest Gradient Background */}
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
            <Defs>
              <SvgGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#072A1A" stopOpacity="1" />
                <Stop offset="0.5" stopColor="#0B3E25" stopOpacity="1" />
                <Stop offset="1" stopColor="#11663A" stopOpacity="1" />
              </SvgGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#heroGradient)" />
          </Svg>

          {/* TOP HEADER: Address on left, Badges & Profile on right */}
          <View style={styles.topHeaderBar}>
            {/* Left: Home ▾ and detailed street address */}
            <TouchableOpacity style={styles.addressContainer} activeOpacity={0.85}>
              <View style={styles.addressTitleRow}>
                <Ionicons name="home" size={17} color={Colors.white} />
                <Text style={styles.addressTitleText}>Home</Text>
                <Ionicons name="chevron-down" size={15} color={Colors.white} />
              </View>
              <Text style={styles.addressSubtitleText} numberOfLines={1}>
                Flat 402, Royal Palms, Hazratganj, Lucknow
              </Text>
            </TouchableOpacity>

            {/* Right: Gold Trust Badge + Coins + Avatar */}
            <View style={styles.topRightIcons}>
              {/* Gold TOLA / TRUST Badge */}
              <View style={styles.goldBadgePill}>
                <Text style={styles.goldBadgeIcon}>👑</Text>
                <Text style={styles.goldBadgeText}>TOLA</Text>
              </View>

              {/* Coin / Rupee Circle */}
              <TouchableOpacity style={styles.circleIconButton} activeOpacity={0.8}>
                <Text style={styles.circleIconText}>₹</Text>
              </TouchableOpacity>

              {/* Profile Avatar with Initial 'S' */}
              <TouchableOpacity
                style={styles.profileAvatarButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('MainTabs', { screen: 'AccountTab' })}
              >
                <Text style={styles.profileAvatarInitial}>S</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SEARCH BAR ROW WITH MIC & VEG SWITCH */}
          <View style={styles.searchRowContainer}>
            {/* White Rounded Search Input */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={19} color="#E11D48" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search '${searchPlaceholders[placeholderIdx]}'`}
                placeholderTextColor={Colors.gray500}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (text.trim().length > 0) {
                    navigation.navigate('MainTabs', {
                      screen: 'BrowseTab',
                      params: { categoryId: 'veg' },
                    });
                  }
                }}
                onFocus={() => {
                  navigation.navigate('MainTabs', {
                    screen: 'BrowseTab',
                    params: { categoryId: 'veg' },
                  });
                }}
              />
            </View>

            {/* Circular Voice / Mic Button */}
            <TouchableOpacity
              style={styles.micCircleButton}
              activeOpacity={0.85}
              onPress={() => {
                navigation.navigate('MainTabs', {
                  screen: 'BrowseTab',
                  params: { categoryId: 'veg' },
                });
              }}
            >
              <Ionicons name="mic" size={20} color="#E11D48" />
            </TouchableOpacity>

            {/* VEG Only Label + Compact Toggle Switch */}
            <View style={styles.vegToggleWrapper}>
              <Text style={styles.vegToggleText}>VEG</Text>
              <TouchableOpacity
                style={[
                  styles.compactSwitchTrack,
                  isVegOnly ? styles.compactSwitchActive : styles.compactSwitchInactive,
                ]}
                activeOpacity={0.9}
                onPress={toggleVegOnly}
              >
                <View
                  style={[
                    styles.compactSwitchThumb,
                    isVegOnly ? styles.thumbRight : styles.thumbLeft,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* BANNER SHOWCASE TITLE (Diwali Gifting style) */}
          <View style={styles.showcaseHeader}>
            <Text style={styles.showcaseScriptTitle}>🌿 Shuddh Mandi 🌿</Text>
            <Text style={styles.showcaseSubtitle}>POORA TOLA · POORA BHAROSA</Text>
          </View>

          {/* 3 FLOATING SHOWCASE CARDS (Vegetables, Milk, Meat) */}
          <View style={styles.hampersRow}>
            {/* Hamper 1: Mandi Basket (Vegetables) */}
            <TouchableOpacity
              style={styles.hamperCard}
              activeOpacity={0.88}
              onPress={() =>
                navigation.navigate('MainTabs', {
                  screen: 'BrowseTab',
                  params: { categoryId: 'veg' },
                })
              }
            >
              <View style={styles.hamperImagePedestal}>
                <Text style={styles.hamperEmoji}>🥦</Text>
              </View>
              <View style={[styles.hamperPill, { backgroundColor: 'rgba(232, 245, 236, 0.95)' }]}>
                <Text style={[styles.hamperTitle, { color: Colors.green900 }]}>
                  Mandi Basket
                </Text>
                <Text style={styles.hamperSub}>Fresh Veggies</Text>
              </View>
            </TouchableOpacity>

            {/* Hamper 2: Dairy & Ghee (Milk) */}
            <TouchableOpacity
              style={styles.hamperCard}
              activeOpacity={0.88}
              onPress={() =>
                navigation.navigate('MainTabs', {
                  screen: 'BrowseTab',
                  params: { categoryId: 'milk' },
                })
              }
            >
              <View style={styles.hamperImagePedestal}>
                <Text style={styles.hamperEmoji}>🥛</Text>
              </View>
              <View style={[styles.hamperPill, { backgroundColor: 'rgba(255, 243, 196, 0.95)' }]}>
                <Text style={[styles.hamperTitle, { color: '#7A5A00' }]}>
                  Pure Dairy
                </Text>
                <Text style={styles.hamperSub}>Milk & Paneer</Text>
              </View>
            </TouchableOpacity>

            {/* Hamper 3: Hygienic Meat (Hidden when Veg-only) */}
            {!isVegOnly && (
              <TouchableOpacity
                style={styles.hamperCard}
                activeOpacity={0.88}
                onPress={() =>
                  navigation.navigate('MainTabs', {
                    screen: 'BrowseTab',
                    params: { categoryId: 'meat' },
                  })
                }
              >
                <View style={styles.hamperImagePedestal}>
                  <Text style={styles.hamperEmoji}>🍗</Text>
                </View>
                <View style={[styles.hamperPill, { backgroundColor: 'rgba(253, 236, 234, 0.95)' }]}>
                  <Text style={[styles.hamperTitle, { color: '#991B1B' }]}>
                    Fresh Cuts
                  </Text>
                  <Text style={styles.hamperSub}>Hygienic Meat</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ========================================================= */}
        {/* 2. CATEGORY ICON LIST BELOW HERO (Like reference image)   */}
        {/* ========================================================= */}
        <View style={styles.categoryIconListContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryIconScroll}
          >
            {visibleCategoryIcons.map((item) => {
              const isSelected = selectedIconId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.categoryIconColumn}
                  activeOpacity={0.8}
                  onPress={() => setSelectedIconId(item.id)}
                >
                  {/* Circular Avatar Badge */}
                  <View style={[styles.categoryCircleAvatar, { backgroundColor: item.bgColor }]}>
                    <Text style={styles.categoryCircleEmoji}>{item.emoji}</Text>
                  </View>

                  {/* Name Label */}
                  <Text
                    style={[
                      styles.categoryCircleLabel,
                      isSelected && styles.categoryCircleLabelActive,
                    ]}
                  >
                    {item.name}
                  </Text>

                  {/* Active Indicator Underline Bar */}
                  {isSelected && <View style={styles.activeUnderlineBar} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ========================================================= */}
        {/* 3. DELIVERY SLOT STRIP                                    */}
        {/* ========================================================= */}
        <TouchableOpacity
          style={styles.slotStrip}
          activeOpacity={0.85}
          onPress={() => setSlotModalVisible(true)}
        >
          <View style={styles.slotClockBox}>
            <Ionicons name="time-outline" size={22} color={Colors.green700} />
          </View>
          <View style={styles.slotTextCol}>
            <Text style={styles.slotTitle}>Next slot: {selectedSlot.display}</Text>
            <Text style={styles.slotSub}>{selectedSlot.cutoffDisplay}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.green700} />
        </TouchableOpacity>

        {/* ========================================================= */}
        {/* 4. PROMISE STRIP ("Poora tola, poora bharosa")            */}
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
        {/* 5. FRESH TODAY (Horizontal Product Row with Stepper)     */}
        {/* ========================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Fresh today</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MainTabs', {
                screen: 'BrowseTab',
                params: { categoryId: 'veg' },
              })
            }
          >
            <Text style={styles.seeAllText}>See all ›</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productRowScroll}
        >
          {freshProducts.map((p) => {
            const qty = getItemQuantity(p.id);
            return (
              <ItemCard
                key={p.id}
                id={p.id}
                nameEn={p.name}
                unit={p.unit}
                pricePaise={p.price * 100}
                mrpPaise={p.mrp * 100}
                discountPercent={p.discountPercent}
                imagePlaceholder={
                  p.categoryId === 'veg' ? '🥦' : p.categoryId === 'meat' ? '🍗' : '🥛'
                }
                quantityInCart={qty}
                onAdd={() => handleAddProduct(p)}
                onIncrement={() => incrementItem(p.id)}
                onDecrement={() => decrementItem(p.id)}
              />
            );
          })}
        </ScrollView>

        {/* ========================================================= */}
        {/* 6. TRUSTED SHOPS NEAR YOU                                */}
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
      {/* 7. STICKY CART BAR (When cart not empty)                  */}
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
    backgroundColor: '#072A1A',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  /* ========================================================= */
  /* 1. HERO CANVAS                                            */
  /* ========================================================= */
  heroCanvas: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
    backgroundColor: '#0B3E25',
  },
  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  addressContainer: {
    flex: 1,
    paddingRight: 10,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressTitleText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Typography.fontFamily.headingBold,
  },
  addressSubtitleText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontFamily: Typography.fontFamily.body,
    marginTop: 2,
  },
  topRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goldBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3C4',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 3,
  },
  goldBadgeIcon: {
    fontSize: 11,
  },
  goldBadgeText: {
    color: '#7A5A00',
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
    letterSpacing: 0.5,
  },
  circleIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleIconText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Typography.fontFamily.headingBold,
  },
  profileAvatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#93C5FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  profileAvatarInitial: {
    color: '#1E3A8A',
    fontSize: 13,
    fontFamily: Typography.fontFamily.headingBold,
  },

  /* Search & VEG Row */
  searchRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    height: 46,
    backgroundColor: Colors.white,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.ink900,
    fontFamily: Typography.fontFamily.body,
  },
  micCircleButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  vegToggleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  vegToggleText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
    marginBottom: 3,
  },
  compactSwitchTrack: {
    width: 36,
    height: 20,
    borderRadius: 10,
    padding: 2,
    justifyContent: 'center',
  },
  compactSwitchActive: {
    backgroundColor: '#10B981',
  },
  compactSwitchInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  compactSwitchThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  thumbLeft: {
    alignSelf: 'flex-start',
  },
  thumbRight: {
    alignSelf: 'flex-end',
  },

  /* Showcase Header */
  showcaseHeader: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  showcaseScriptTitle: {
    fontSize: 24,
    color: '#FFF3C4',
    fontFamily: Typography.fontFamily.headingBold,
    letterSpacing: 0.8,
  },
  showcaseSubtitle: {
    fontSize: 10,
    color: '#E8F5EC',
    fontFamily: Typography.fontFamily.heading,
    letterSpacing: 2,
    marginTop: 2,
  },

  /* 3 Floating Hampers Row */
  hampersRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  hamperCard: {
    flex: 1,
    alignItems: 'center',
  },
  hamperImagePedestal: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -16,
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  hamperEmoji: {
    fontSize: 34,
  },
  hamperPill: {
    width: '100%',
    paddingTop: 20,
    paddingBottom: 8,
    paddingHorizontal: 4,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
  },
  hamperTitle: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.headingBold,
    textAlign: 'center',
  },
  hamperSub: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.body,
    color: Colors.gray600,
    marginTop: 1,
    textAlign: 'center',
  },

  /* ========================================================= */
  /* 2. CATEGORY ICON LIST BELOW HERO                          */
  /* ========================================================= */
  categoryIconListContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray300,
    elevation: 1,
  },
  categoryIconScroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  categoryIconColumn: {
    alignItems: 'center',
    width: 68,
  },
  categoryCircleAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  categoryCircleEmoji: {
    fontSize: 26,
  },
  categoryCircleLabel: {
    fontSize: 11,
    color: Colors.ink900,
    fontFamily: Typography.fontFamily.body,
    marginTop: 6,
    textAlign: 'center',
  },
  categoryCircleLabelActive: {
    fontFamily: Typography.fontFamily.headingBold,
    color: Colors.green700,
  },
  activeUnderlineBar: {
    marginTop: 4,
    width: 24,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#E11D48',
  },

  /* ========================================================= */
  /* 3. DELIVERY SLOT STRIP                                    */
  /* ========================================================= */
  slotStrip: {
    marginHorizontal: Spacing.base,
    marginTop: 14,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.mint100,
    borderWidth: 1,
    borderColor: 'rgba(17, 102, 58, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  slotClockBox: {
    marginRight: 10,
  },
  slotTextCol: {
    flex: 1,
  },
  slotTitle: {
    color: Colors.ink900,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Typography.fontFamily.heading,
  },
  slotSub: {
    color: Colors.gray600,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: Typography.fontFamily.body,
    marginTop: 1,
  },

  /* ========================================================= */
  /* 4. PROMISE STRIP                                          */
  /* ========================================================= */
  promiseStrip: {
    marginHorizontal: Spacing.base,
    marginTop: 14,
    height: 68,
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
    fontSize: 15,
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
    marginTop: 3,
    fontStyle: 'italic',
  },

  /* ========================================================= */
  /* 5. FRESH TODAY PRODUCT ROW                                */
  /* ========================================================= */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: Spacing.base,
  },
  sectionTitle: {
    color: Colors.ink900,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Typography.fontFamily.headingBold,
  },
  seeAllText: {
    color: Colors.green700,
    fontSize: 13,
    fontFamily: Typography.fontFamily.heading,
  },
  productRowScroll: {
    paddingHorizontal: Spacing.base,
    gap: 12,
  },
  productCard: {
    width: 144,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gray300,
    overflow: 'hidden',
  },
  productImageContainer: {
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productImagePlaceholder: {
    fontSize: 44,
  },
  productDiscountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: Colors.yellow500,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  productDiscountText: {
    color: Colors.ink900,
    fontSize: 9,
    fontFamily: Typography.fontFamily.headingBold,
  },
  productCardBody: {
    padding: 9,
  },
  productCardName: {
    color: Colors.ink900,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Typography.fontFamily.heading,
    minHeight: 32,
  },
  productCardUnit: {
    color: Colors.gray600,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: Typography.fontFamily.body,
    marginTop: 2,
  },
  productCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  productCardPrice: {
    color: Colors.green700,
    fontSize: 14,
    fontFamily: Typography.fontFamily.headingBold,
  },
  productCardMrp: {
    color: Colors.gray600,
    fontSize: 10,
    fontFamily: Typography.fontFamily.body,
    textDecorationLine: 'line-through',
  },
  productAddBtn: {
    backgroundColor: Colors.green700,
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productAddBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: Typography.fontFamily.headingBold,
  },
  productStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.green700,
    borderRadius: 8,
    height: 30,
    paddingHorizontal: 3,
  },
  productStepBtn: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  productStepBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: Typography.fontFamily.headingBold,
  },
  productStepQty: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: Typography.fontFamily.headingBold,
    paddingHorizontal: 3,
  },

  /* ========================================================= */
  /* 6. TRUSTED SHOPS                                          */
  /* ========================================================= */
  shopsList: {
    paddingHorizontal: Spacing.base,
    gap: 12,
  },
  shopCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gray300,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  shopPhotoBanner: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shopEmoji: {
    fontSize: 44,
  },
  weightVerifiedBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 4,
    elevation: 2,
  },
  weightVerifiedIcon: {
    fontSize: 11,
  },
  weightVerifiedText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
    color: Colors.green700,
  },
  shopDetails: {
    padding: 10,
  },
  shopNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopNameText: {
    fontSize: 14,
    color: Colors.ink900,
    fontFamily: Typography.fontFamily.heading,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.mint100,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 3,
  },
  ratingText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
    color: Colors.green700,
  },
  shopMetaRow: {
    fontSize: 11,
    color: Colors.gray600,
    fontFamily: Typography.fontFamily.body,
    marginTop: 3,
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

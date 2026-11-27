import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, Animated } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppTypography } from '../../../ui/theme/appTypography';
import { useWishlistStore } from '../../../state/useWishlistStore';
import { useCartStore } from '../../../state/useCartStore';

interface Props {
  isGuest?: boolean;
  hasLocationPermission?: boolean;
  locationLabel?: string;
  deliveryMins?: string;
  addressText?: string;
  scrollY?: Animated.Value;
  isAbsolute?: boolean;
  onAddressPress?: () => void;
  onProfilePress?: () => void;
  onBookmarkPress?: () => void;
  onCartPress?: () => void;
  onSearchPress?: () => void;
  onVoicePress?: () => void;
}

const SEARCH_TERMS = [
  'Fresh Paneer',
  'Milk & Dahi',
  'Atta & Dal',
  'Sugar Free Sweets',
  'Desi Tomato',
  'Farm Fresh Eggs',
  'Snacks & Cold Drinks',
  'Fresh Fruits',
];

export const HomeHeader: React.FC<Props> = ({
  isGuest = false,
  hasLocationPermission = false,
  locationLabel = 'Home',
  deliveryMins = '9 mins',
  addressText = 'Vijay Nagar, Indore',
  scrollY,
  isAbsolute = true,
  onAddressPress,
  onProfilePress,
  onBookmarkPress,
  onCartPress,
  onSearchPress,
}) => {
  const insets = useSafeAreaInsets();
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());

  // Up-down animated ticker state
  const [hintIndex, setHintIndex] = useState(0);
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Slide up and fade out current term
      Animated.parallel([
        Animated.timing(translateYAnim, {
          toValue: -14,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 2. Advance index and position next term at bottom (+14)
        setHintIndex((prev) => (prev + 1) % SEARCH_TERMS.length);
        translateYAnim.setValue(14);
        // 3. Slide up to center (0) and fade in
        Animated.parallel([
          Animated.timing(translateYAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 2800);

    return () => clearInterval(timer);
  }, [translateYAnim, opacityAnim]);

  // Calculate safe status bar padding for Android & iOS
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
  );

  // Scroll animations for collapsing top section
  const topRowHeight = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [54, 0],
        extrapolate: 'clamp',
      })
    : 54;

  const topRowOpacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 38],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      })
    : 1;

  const topRowMarginBottom = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [12, 0],
        extrapolate: 'clamp',
      })
    : 12;

  const topRowTranslateY = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [0, -15],
        extrapolate: 'clamp',
      })
    : 0;

  return (
    <View
      style={[
        styles.container,
        isAbsolute && styles.absoluteContainer,
        { paddingTop: topInset + 8 },
      ]}
    >
      {/* Background Gradient - Rich mint green at top blending seamlessly into white at bottom without any dividing line */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Defs>
            <SvgGradient id="headerGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#A8E8D5" />
              <Stop offset="38%" stopColor="#C8F1E4" />
              <Stop offset="72%" stopColor="#EDF9F5" />
              <Stop offset="100%" stopColor="#FFFFFF" />
            </SvgGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#headerGrad)" />
        </Svg>
      </View>

      {/* Row 1: Address & Profile Button (No green pin, properly aligned chevron) */}
      <Animated.View
        style={[
          styles.topRow,
          {
            height: topRowHeight,
            opacity: topRowOpacity,
            marginBottom: topRowMarginBottom,
            transform: [{ translateY: topRowTranslateY }],
            overflow: 'hidden',
          },
        ]}
      >
        <TouchableOpacity style={styles.addressContainer} onPress={onAddressPress} activeOpacity={0.7}>
          <View style={styles.locationTitleRow}>
            <Text style={styles.locationTitleText} numberOfLines={1}>
              {!isGuest && hasLocationPermission ? locationLabel : 'Current Location'}
            </Text>
            <Ionicons name="chevron-down" size={15} color="#0F172A" style={styles.chevronIcon} />
          </View>
          <Text style={styles.addressSubText} numberOfLines={1}>
            {!isGuest && hasLocationPermission ? addressText : 'Tap to add address'}
          </Text>
        </TouchableOpacity>

        {/* Profile Button */}
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={onProfilePress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Check your profile"
        >
          <View style={styles.profileTextWrapper}>
            <Text style={styles.profilePromptText} numberOfLines={2}>
              Check your{'\n'}profile
            </Text>
          </View>
          <View style={styles.avatarButton}>
            <Ionicons name="person" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Row 2: Search Box + Heart Wishlist Button + Cart Button */}
      <View style={styles.searchRow}>
        <TouchableOpacity
          style={styles.searchBox}
          onPress={onSearchPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Search products"
        >
          <View style={styles.searchPlaceholderRow}>
            <Text style={styles.searchPlaceholderText}>Search for </Text>
            <View style={styles.animatedTickerWrap}>
              <Animated.View
                style={{
                  transform: [{ translateY: translateYAnim }],
                  opacity: opacityAnim,
                }}
              >
                <Text style={styles.searchPlaceholderText} numberOfLines={1}>
                  '{SEARCH_TERMS[hintIndex]}'
                </Text>
              </Animated.View>
            </View>
          </View>

          <View style={styles.searchRightIcons}>
            <Ionicons name="search" size={18} color="#64748B" />
          </View>
        </TouchableOpacity>

        {/* Wishlist Heart Button */}
        <TouchableOpacity
          style={styles.actionSquareBtn}
          onPress={onBookmarkPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          accessibilityRole="button"
          accessibilityLabel="Saved Wishlist"
        >
          <Ionicons
            name={wishlistCount > 0 ? 'heart' : 'heart-outline'}
            size={20}
            color={wishlistCount > 0 ? '#E11D48' : '#64748B'}
          />
          {wishlistCount > 0 && (
            <View style={styles.actionBadge}>
              <Text style={styles.actionBadgeText}>
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Cart Button */}
        <TouchableOpacity
          style={styles.actionSquareBtn}
          onPress={onCartPress}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          accessibilityRole="button"
          accessibilityLabel="View Cart"
        >
          <Ionicons
            name="cart-outline"
            size={21}
            color={totalItemsCount > 0 ? '#047A36' : '#64748B'}
          />
          {totalItemsCount > 0 && (
            <View style={[styles.actionBadge, { backgroundColor: '#047A36' }]}>
              <Text style={styles.actionBadgeText}>
                {totalItemsCount > 9 ? '9+' : totalItemsCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    // No borderBottomWidth / borderBottomColor so gradient mixes seamlessly into white page background
  },
  absoluteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressContainer: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTitleText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  chevronIcon: {
    marginLeft: 4,
    marginTop: 2,
  },
  addressSubText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12.5,
    color: '#475569',
    marginTop: 2,
    maxWidth: 240,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  profileTextWrapper: {
    marginRight: 8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  profilePromptText: {
    ...AppTypography.badgeText,
    color: '#0C4E43',
    textAlign: 'right',
    lineHeight: 14,
  },
  avatarButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C7EBE3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
    elevation: 3,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchPlaceholderRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    height: 22,
    marginRight: 4,
  },
  searchPlaceholderText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 20,
  },
  animatedTickerWrap: {
    flex: 1,
    height: 22,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  searchRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionSquareBtn: {
    width: 44,
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E11D48',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  actionBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Bold',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, Animated } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors, InstamartTypography, InstamartRadii } from '../../../ui/theme/instamartTheme';
import { AppTypography, AppTextColors } from '../../../ui/theme/appTypography';
import { useWishlistStore } from '../../../state/useWishlistStore';

interface Props {
  isGuest?: boolean;
  deliveryMins?: string;
  addressText?: string;
  scrollY?: Animated.Value;
  isAbsolute?: boolean;
  onAddressPress?: () => void;
  onProfilePress?: () => void;
  onBookmarkPress?: () => void;
  onSearchPress?: () => void;
  onVoicePress?: () => void;
}

const SEARCH_HINTS = [
  "Search for 'Fresh Sabzi'",
  "Search for 'Milk & Dahi'",
  "Search for 'Atta & Dal'",
  "Search for 'Fresh Paneer'",
  "Search for 'Snacks & Drinks'",
];

export const HomeHeader: React.FC<Props> = ({
  isGuest = false,
  deliveryMins = '9 mins',
  addressText = 'To Home: Vijay Nagar, Indore',
  scrollY,
  isAbsolute = true,
  onAddressPress,
  onProfilePress,
  onBookmarkPress,
  onSearchPress,
  onVoicePress,
}) => {
  const insets = useSafeAreaInsets();
  const [hintIndex, setHintIndex] = useState(0);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  // Calculate safe status bar padding for Android & iOS
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0
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

  useEffect(() => {
    const timer = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % SEARCH_HINTS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <View
      style={[
        styles.container,
        isAbsolute && styles.absoluteContainer,
        { paddingTop: topInset + 8 },
      ]}
    >
      {/* Background Gradient */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Defs>
            <SvgGradient id="headerGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={InstamartColors.headerLavenderTop} />
              <Stop offset="75%" stopColor={InstamartColors.headerLavenderMid} />
              <Stop offset="100%" stopColor={InstamartColors.background} />
            </SvgGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#headerGrad)" />
        </Svg>
      </View>

      {/* Row 1: Delivery Mins + Address & Profile Button (Collapses smoothly on scroll) */}
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
          {isGuest ? (
            <>
              <View style={styles.addLocationBadge}>
                <Ionicons name="location-sharp" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.addLocationBadgeText}>Add Location</Text>
              </View>
              <View style={styles.addressLine}>
                <Text style={styles.addLocationSubtext} numberOfLines={1}>
                  Click to add location
                </Text>
                <Ionicons name="chevron-forward" size={14} color="#0F5145" style={{ marginLeft: 2 }} />
              </View>
            </>
          ) : (
            <>
              <Text style={InstamartTypography.mins}>{deliveryMins}</Text>
              <View style={styles.addressLine}>
                <Text style={styles.addressText} numberOfLines={1}>
                  {addressText}
                </Text>
                <Ionicons name="chevron-down" size={15} color="#0F5145" style={{ marginLeft: 3 }} />
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Check your profile text on left, bigger profile avatar icon on right */}
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

      {/* Row 2: Search bar with rotating hint & Bookmark square button (Sticky pinned) */}
      <View style={styles.searchRow}>
        <TouchableOpacity
          style={styles.searchBox}
          onPress={onSearchPress}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Search products"
        >
          <Text style={styles.searchInput} numberOfLines={1}>
            {SEARCH_HINTS[hintIndex]}
          </Text>
          <View style={styles.searchRightIcons}>
            <Ionicons name="search" size={18} color="#64748B" />
            <View style={styles.searchInnerDivider} />
            <TouchableOpacity
              onPress={onVoicePress || onSearchPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Voice search"
            >
              <Ionicons name="mic" size={19} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={onBookmarkPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Saved Wishlist"
        >
          <Ionicons
            name={wishlistCount > 0 ? "bookmark" : "bookmark-outline"}
            size={22}
            color="#0D9488"
          />
          {wishlistCount > 0 && (
            <View style={styles.bookmarkBadge}>
              <Text style={styles.bookmarkBadgeText}>
                {wishlistCount > 9 ? '9+' : wishlistCount}
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
    paddingBottom: 12,
    backgroundColor: InstamartColors.headerLavenderTop,
    borderBottomWidth: 1,
    borderBottomColor: '#C7EBE3',
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
  addressLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  addressText: {
    ...InstamartTypography.address,
    maxWidth: 180,
  },
  addLocationBadge: {
    backgroundColor: '#22C55E',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  addLocationBadgeText: {
    ...AppTypography.badgeText,
    color: '#FFFFFF',
  },
  addLocationSubtext: {
    ...AppTypography.cardMetaStrong,
    color: '#0F5145',
    maxWidth: 180,
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
    gap: 10,
  },
  searchBox: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#C7EBE3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    ...AppTypography.searchHint,
    fontSize: 14,
  },
  searchRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchInnerDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  bookmarkButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#A7DDD2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  bookmarkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E11D48',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bookmarkBadgeText: {
    ...AppTypography.badgeText,
    color: '#FFFFFF',
    fontSize: 9,
    lineHeight: 12,
  },
});

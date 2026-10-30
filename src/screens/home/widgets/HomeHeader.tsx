import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, StatusBar } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors, InstamartTypography, InstamartRadii } from '../../../ui/theme/instamartTheme';

interface Props {
  deliveryMins?: string;
  addressText?: string;
  onAddressPress?: () => void;
  onProfilePress?: () => void;
  onBookmarkPress?: () => void;
}

const SEARCH_HINTS = [
  "Search 'Sugar Free Sweets'",
  "Search 'Dry Fruits'",
  "Search 'Fresh Paneer'",
  "Search 'Desi Tomato'",
  "Search 'Aashirvaad Atta'",
];

export const HomeHeader: React.FC<Props> = ({
  deliveryMins = '9 mins',
  addressText = 'To Home: Vijay Nagar, Indore',
  onAddressPress,
  onProfilePress,
  onBookmarkPress,
}) => {
  const insets = useSafeAreaInsets();
  const [hintIndex, setHintIndex] = useState(0);

  // Calculate safe status bar padding for Android & iOS
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % SEARCH_HINTS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: topInset + 8 }]}>
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

      {/* Row 1: Delivery Mins + Address & Lifetime Free + Profile */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.addressContainer} onPress={onAddressPress} activeOpacity={0.7}>
          <Text style={InstamartTypography.mins}>{deliveryMins}</Text>
          <View style={styles.addressLine}>
            <Text style={styles.addressText} numberOfLines={1}>
              {addressText}
            </Text>
            <Ionicons name="chevron-down" size={14} color={InstamartColors.ink} style={{ marginLeft: 2 }} />
          </View>
        </TouchableOpacity>

        <View style={styles.rightActions}>
          <View style={styles.membershipPill}>
            <Text style={styles.pillTextBold}>Lifetime</Text>
            <Text style={styles.pillText}>FREE</Text>
          </View>

          <TouchableOpacity style={styles.avatarButton} onPress={onProfilePress} activeOpacity={0.8}>
            <Ionicons name="person" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Row 2: Search bar with rotating hint & Bookmark square button */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={InstamartColors.inkMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={SEARCH_HINTS[hintIndex]}
            placeholderTextColor={InstamartColors.inkMuted}
            editable={false}
          />
        </View>

        <TouchableOpacity style={styles.bookmarkButton} onPress={onBookmarkPress} activeOpacity={0.7}>
          <Ionicons name="bookmark-outline" size={20} color="#2B2B4A" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressContainer: {
    flex: 1,
    marginRight: 12,
  },
  addressLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  addressText: {
    ...InstamartTypography.address,
    maxWidth: 200,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  membershipPill: {
    backgroundColor: InstamartColors.membershipPillBg,
    borderRadius: InstamartRadii.pill,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillTextBold: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    fontWeight: '700',
    color: InstamartColors.membershipPillText,
    lineHeight: 11,
  },
  pillText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 10,
    fontWeight: '800',
    color: InstamartColors.membershipPillText,
    lineHeight: 12,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2F4FD8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: InstamartRadii.search,
    borderWidth: 1,
    borderColor: InstamartColors.searchBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: InstamartColors.ink,
  },
  bookmarkButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2B2B4A',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

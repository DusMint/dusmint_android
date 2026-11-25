import { TextStyle } from 'react-native';

/**
 * Zomato-Style Unified Typography System
 * Font Family: Plus Jakarta Sans (Google Fonts)
 * Colors: Primary #1C1C1C, Secondary #696969, Tertiary/Hints #9C9C9C
 */

export const AppFontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const AppTextColors = {
  primary: '#1C1C1C',
  secondary: '#696969',
  tertiary: '#9C9C9C',
  white: '#FFFFFF',
  offerBlue: '#1D4ED8',
  brandGreen: '#15803D',
  priceRed: '#DC2626',
} as const;

export const AppTypography = {
  // 1. Screen Title: 20sp, SemiBold, clean tracking (e.g. "All Stores")
  screenTitle: {
    fontFamily: AppFontFamily.semiBold,
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.3,
    color: AppTextColors.primary,
  } as TextStyle,

  // 2. Section Label: 11.5sp, Medium, UPPERCASE, letterSpacing 1.4, grey 600
  sectionLabel: {
    fontFamily: AppFontFamily.medium,
    fontSize: 11.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: AppTextColors.secondary,
  } as TextStyle,

  // 3. Card Title: 16.5sp, SemiBold, clean hierarchy (store / restaurant name)
  cardTitle: {
    fontFamily: AppFontFamily.semiBold,
    fontSize: 16.5,
    lineHeight: 22,
    letterSpacing: -0.2,
    color: AppTextColors.primary,
  } as TextStyle,

  // 4. Card Meta: 12.5sp, Regular, color grey 600 (distance, time, "12 mins", "Main Market")
  cardMeta: {
    fontFamily: AppFontFamily.regular,
    fontSize: 12.5,
    lineHeight: 17,
    color: AppTextColors.secondary,
  } as TextStyle,

  // 5. Card Meta Strong: 13sp, Medium, color grey 900 (distance value like "0.40 km")
  cardMetaStrong: {
    fontFamily: AppFontFamily.medium,
    fontSize: 13,
    color: AppTextColors.primary,
  } as TextStyle,

  // 6. Rating Text: 13sp, SemiBold, white on green pill (e.g. "4.8")
  ratingText: {
    fontFamily: AppFontFamily.semiBold,
    fontSize: 13,
    color: AppTextColors.white,
    fontVariant: ['tabular-nums'],
  } as TextStyle,

  // 7. Offer Text: 12.5sp, Medium, color brand/offer blue (e.g. "20% OFF up to ₹50")
  offerText: {
    fontFamily: AppFontFamily.medium,
    fontSize: 12.5,
    color: AppTextColors.offerBlue,
  } as TextStyle,

  // 8. Badge Text: 11sp, Medium, letterSpacing 0.2 (e.g. "Lowest Price" tag)
  badgeText: {
    fontFamily: AppFontFamily.medium,
    fontSize: 11,
    letterSpacing: 0.2,
    color: AppTextColors.brandGreen,
  } as TextStyle,

  // 9. Chip Text: 13sp, Medium (filter chips: Sort by, Under 15 Mins, Rating 4.8+)
  chipText: {
    fontFamily: AppFontFamily.medium,
    fontSize: 13,
    color: AppTextColors.secondary,
  } as TextStyle,

  // Active Chip Text
  chipTextActive: {
    fontFamily: AppFontFamily.semiBold,
    fontSize: 13,
    color: AppTextColors.brandGreen,
  } as TextStyle,

  // 10. Search Hint: 14sp, Regular, color grey 500 (search bar placeholder)
  searchHint: {
    fontFamily: AppFontFamily.regular,
    fontSize: 15,
    color: AppTextColors.tertiary,
  } as TextStyle,

  // 11. Category Label: 13sp, w500, selected state w700 with active underline
  categoryLabel: {
    fontFamily: AppFontFamily.medium,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: AppTextColors.secondary,
    textAlign: 'center',
  } as TextStyle,

  categoryLabelActive: {
    fontFamily: AppFontFamily.bold,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: AppTextColors.brandGreen,
    textAlign: 'center',
  } as TextStyle,

  // 12. Body Text: 14sp, w400, height 1.4
  bodyText: {
    fontFamily: AppFontFamily.regular,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 19.6,
    color: AppTextColors.primary,
  } as TextStyle,

  bodyTextMedium: {
    fontFamily: AppFontFamily.medium,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    lineHeight: 19.6,
    color: AppTextColors.secondary,
  } as TextStyle,

  // 13. Button Text: 15sp, w700, letterSpacing 0.2
  buttonText: {
    fontFamily: AppFontFamily.bold,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    letterSpacing: 0.2,
    color: AppTextColors.white,
  } as TextStyle,

  // 14. Bottom Nav Label: 11sp, w500, selected w700
  bottomNavLabel: {
    fontFamily: AppFontFamily.medium,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: AppTextColors.secondary,
  } as TextStyle,

  bottomNavLabelActive: {
    fontFamily: AppFontFamily.bold,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: AppTextColors.brandGreen,
  } as TextStyle,

  // 15. Price and Numbers (Tabular figures for perfect ₹ alignment)
  priceText: {
    fontFamily: AppFontFamily.bold,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    color: AppTextColors.primary,
    fontVariant: ['tabular-nums'],
  } as TextStyle,

  mrpText: {
    fontFamily: AppFontFamily.regular,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: AppTextColors.tertiary,
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums'],
  } as TextStyle,
} as const;

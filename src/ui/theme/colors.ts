/**
 * Dusmint Design System - Official Color Palette
 * Replicated exactly from docs/homepage.md Section 3
 */
export const Colors = {
  // Dusmint Brand Tokens (Section 3)
  green900: '#0A3622', // Hero gradient start, dark brand areas
  green700: '#11663A', // Primary buttons, prices, active nav, links
  green600: '#1A8A4F', // Icons and large decorative shapes only
  mint100: '#E8F5EC',  // Chips, selected states, slot strip background, Veg tint
  mint50: '#F4FBF6',   // Soft section backgrounds, promise strip
  yellow500: '#FFC82E',// Offer badges, highlights, search focus accent
  yellow100: '#FFF3C4',// Offer strips, Milk tint
  yellow800: '#7A5A00',// Text on yellow100
  cream: '#FFFCF2',    // Screen background
  white: '#FFFFFF',    // Cards, search bar
  ink900: '#14211B',   // Main text
  gray600: '#56655D',  // Secondary text
  gray500: '#6B7A72',  // Placeholder text
  gray300: '#D3DBD6',  // Dividers and borders
  error: '#C62828',    // Errors, out of stock
  errorBg: '#FDECEA',  // Meat category tint, error banners

  // Category Tints
  tintVeg: '#E8F5EC',
  tintMeat: '#FDECEA',
  tintMilk: '#FFF3C4',

  // Semantic & Backwards Compatibility Aliases
  primary: '#11663A',
  primaryDark: '#0A3622',
  primaryLight: '#1A8A4F',
  orange: '#11663A',
  orangeLight: '#1A8A4F',
  accentMint: '#E8F5EC',

  // Text Colors
  primaryText: '#14211B',
  secondaryText: '#56655D',
  textPrimary: '#14211B',
  textSecondary: '#56655D',
  secondary: '#56655D',
  textWhite: '#FFFFFF',

  // Surfaces & Inputs
  background: '#FFFCF2',
  cardBackground: '#FFFFFF',
  textfield: '#F4FBF6',
  placeholder: '#6B7A72',
  surfaceLightGrey: '#F4FBF6',
  surfaceCream: '#FFFCF2',
  divider: '#D3DBD6',
  border: '#D3DBD6',

  // Social
  facebook: '#367FC0',
  google: '#DD4B39',

  // Status
  success: '#11663A',
  warning: '#FFC82E',
  info: '#3B82F6',

  // Badge Specifics
  trustBadgeBg: '#E8F5EC',
  trustBadgeText: '#11663A',
  slotBadgeMorningBg: '#E8F5EC',
  slotBadgeMorningText: '#0A3622',
  slotBadgeEveningBg: '#FFF3C4',
  slotBadgeEveningText: '#7A5A00',
} as const;

export type ColorType = typeof Colors;

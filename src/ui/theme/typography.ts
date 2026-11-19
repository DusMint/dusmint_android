/**
 * Dusmint Design System - Typography
 * Zomato-Style Plus Jakarta Sans Typography System
 */
export const Typography = {
  fontFamily: {
    regular: 'PlusJakartaSans_400Regular',
    medium: 'PlusJakartaSans_500Medium',
    semiBold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
    extraBold: 'PlusJakartaSans_800ExtraBold',
    heading: 'PlusJakartaSans_600SemiBold',
    headingBold: 'PlusJakartaSans_700Bold',
    body: 'PlusJakartaSans_400Regular',
    bodyMedium: 'PlusJakartaSans_500Medium',
    bodyBold: 'PlusJakartaSans_700Bold',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 28,
    display: 34,
  },
  lineHeight: {
    xs: 15,
    sm: 18,
    base: 22,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    display: 42,
  },
} as const;

export type TypographyType = typeof Typography;

/**
 * Dusmint Design System - Typography
 * Zomato Official Typography (Okra / Metropolis)
 */
export const Typography = {
  fontFamily: {
    regular: 'Metropolis-Regular',
    medium: 'Metropolis-Medium',
    semiBold: 'Metropolis-SemiBold',
    bold: 'Metropolis-Bold',
    extraBold: 'Metropolis-ExtraBold',
    heading: 'Metropolis-SemiBold',
    headingBold: 'Metropolis-Bold',
    body: 'Metropolis-Regular',
    bodyMedium: 'Metropolis-Medium',
    bodyBold: 'Metropolis-Bold',
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

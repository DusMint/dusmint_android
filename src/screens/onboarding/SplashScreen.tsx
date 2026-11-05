import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Image,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient as SvgRadialGradient,
  Stop,
  Rect,
  Circle as SvgCircle,
} from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../state/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  // Animation values
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const loaderProgress = useRef(new Animated.Value(0)).current;

  // Staggered rings & elements
  useEffect(() => {
    // 1. Master entrance animation (900ms)
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // 2. Continuous gentle floating animation for accent dots
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: -1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Loader bar fills over 1400ms minimum splash duration
    Animated.timing(loaderProgress, {
      toValue: 1,
      duration: 1400,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [entranceAnim, floatAnim, loaderProgress]);

  // Auth routing check once animation & hydration ready (min 1400ms)
  useEffect(() => {
    if (!isHydrated && !useAuthStore.persist?.hasHydrated()) {
      return;
    }

    const timer = setTimeout(() => {
      const state = useAuthStore.getState();
      if (state.isAuthenticated && state.token) {
        navigation.replace('MainTabs', { screen: 'HomeTab' });
      } else {
        navigation.replace('Login');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isHydrated, navigation]);

  // Interpolated animation values
  // Glow & Rings: 0 - 500ms
  const glowOpacity = entranceAnim.interpolate({
    inputRange: [0, 0.55],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const ring1Scale = entranceAnim.interpolate({
    inputRange: [0, 0.6],
    outputRange: [0.9, 1.0],
    extrapolate: 'clamp',
  });
  const ring2Scale = entranceAnim.interpolate({
    inputRange: [0.08, 0.68],
    outputRange: [0.9, 1.0],
    extrapolate: 'clamp',
  });
  const ring3Scale = entranceAnim.interpolate({
    inputRange: [0.16, 0.76],
    outputRange: [0.9, 1.0],
    extrapolate: 'clamp',
  });

  // Logo: 100 - 600ms
  const logoOpacity = entranceAnim.interpolate({
    inputRange: [0.1, 0.65],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const logoScale = entranceAnim.interpolate({
    inputRange: [0.1, 0.65],
    outputRange: [0.92, 1.0],
    extrapolate: 'clamp',
  });

  // Taglines: 300 - 800ms with 8px upward slide
  const textOpacity = entranceAnim.interpolate({
    inputRange: [0.33, 0.88],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const textTranslateY = entranceAnim.interpolate({
    inputRange: [0.33, 0.88],
    outputRange: [8, 0],
    extrapolate: 'clamp',
  });

  // Leaves & Dots: fade in over 600ms
  const decorOpacity = entranceAnim.interpolate({
    inputRange: [0, 0.66],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Floating dots translations with different phases
  const dot1TranslateY = floatAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-3, 3],
  });
  const dot2TranslateY = floatAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [3, -3],
  });
  const dot3TranslateY = floatAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-2.5, 2.5],
  });
  const dot4TranslateY = floatAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [2.5, -2.5],
  });

  // Loader bar width (84px total width)
  const loaderWidth = loaderProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 84],
  });

  // Logo sizing: clamp 230 to 284 by screen width
  const logoWidth = useMemo(() => {
    return Math.min(284, Math.max(230, SCREEN_WIDTH * 0.65));
  }, []);

  // 7 cols x 5 rows dot grids generator
  const renderDotGrid = (
    baseX: number,
    baseY: number,
    color: string,
    opacity: number
  ) => {
    const dots = [];
    const cols = 7;
    const rows = 5;
    const spacing = 12;
    const radius = 1.5;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push(
          <SvgCircle
            key={`dot-${baseX}-${r}-${c}`}
            cx={baseX + c * spacing}
            cy={baseY + r * spacing}
            r={radius}
            fill={color}
            opacity={opacity}
          />
        );
      }
    }
    return dots;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* 1. Background & SVG Atmosphere Layer (IgnorePointer / Non-interactive) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            {/* Top->Bottom LinearGradient [#FFFFFF, #FFFAEA] */}
            <SvgLinearGradient id="bgGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="100%" stopColor="#FFFAEA" />
            </SvgLinearGradient>

            {/* Center Glow RadialGradient */}
            <SvgRadialGradient
              id="centerGlow"
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <Stop offset="0%" stopColor="#FDB50E" stopOpacity={0.2} />
              <Stop offset="45%" stopColor="#FDB50E" stopOpacity={0.07} />
              <Stop offset="70%" stopColor="#FDB50E" stopOpacity={0} />
            </SvgRadialGradient>
          </Defs>

          {/* Full Screen Background */}
          <Rect width="100%" height="100%" fill="url(#bgGradient)" />

          {/* Center Glow 460x460 at (screenWidth/2, 50% height) */}
          <SvgCircle
            cx={SCREEN_WIDTH / 2}
            cy={SCREEN_HEIGHT * 0.5}
            r={230}
            fill="url(#centerGlow)"
          />

          {/* 5. Dot Grids (CustomPaint SVG) */}
          {/* Top-Left dot grid at (22, 64) */}
          {renderDotGrid(22, 64, '#05402A', 0.18)}

          {/* Bottom-Right dot grid at right: 26, bottom: 176 */}
          {renderDotGrid(
            SCREEN_WIDTH - 26 - 6 * 12,
            SCREEN_HEIGHT - 176 - 4 * 12,
            '#FDB50E',
            0.55
          )}
        </Svg>
      </View>

      {/* 4. Corner Circles (Non-interactive) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Top-Right: 340x340 solid #E3F0E8 at right -120, top -100 */}
        <View style={[styles.cornerCircle, styles.topRightSolid]} />
        {/* Top-Right: ring 240x240 1.5px #C9DFD0 at right -70, top -50 */}
        <View style={[styles.cornerCircle, styles.topRightRing]} />

        {/* Bottom-Left: 340x340 solid #FFEFC0 at left -130, bottom -110 */}
        <View style={[styles.cornerCircle, styles.bottomLeftSolid]} />
        {/* Bottom-Left: ring 230x230 1.5px #F9D982 at left -70, bottom -50 */}
        <View style={[styles.cornerCircle, styles.bottomLeftRing]} />
      </View>

      {/* 3. Concentric Rings (Centered at screenWidth/2, 50% height) */}
      <Animated.View
        style={[
          styles.centerAnchor,
          { opacity: glowOpacity },
        ]}
        pointerEvents="none"
      >
        {/* Ring 1: Diameter 300, 1px border #05402A at 9% */}
        <Animated.View
          style={[
            styles.concentricRing,
            {
              width: 300,
              height: 300,
              borderRadius: 150,
              borderColor: 'rgba(5, 64, 42, 0.09)',
              transform: [{ scale: ring1Scale }],
            },
          ]}
        />
        {/* Ring 2: Diameter 420, 1px border #05402A at 6% */}
        <Animated.View
          style={[
            styles.concentricRing,
            {
              width: 420,
              height: 420,
              borderRadius: 210,
              borderColor: 'rgba(5, 64, 42, 0.06)',
              transform: [{ scale: ring2Scale }],
            },
          ]}
        />
        {/* Ring 3: Diameter 560, 1px border #05402A at 4% */}
        <Animated.View
          style={[
            styles.concentricRing,
            {
              width: 560,
              height: 560,
              borderRadius: 280,
              borderColor: 'rgba(5, 64, 42, 0.04)',
              transform: [{ scale: ring3Scale }],
            },
          ]}
        />
      </Animated.View>

      {/* 6. Leaf Shapes (topRight & bottomLeft rounded, rotated) */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: decorOpacity }]}
        pointerEvents="none"
      >
        {/* Leaf 1: left 30, top 150, 46x46, #05402A 10%, -12 deg */}
        <View
          style={[
            styles.leaf,
            {
              left: Math.round(SCREEN_WIDTH * 0.08),
              top: Math.round(SCREEN_HEIGHT * 0.17),
              width: 46,
              height: 46,
              borderTopRightRadius: 46,
              borderBottomLeftRadius: 46,
              backgroundColor: 'rgba(5, 64, 42, 0.10)',
              transform: [{ rotate: '-12deg' }],
            },
          ]}
        />

        {/* Leaf 2: left 62, top 186, 28x28, #1F7A4D 14%, 20 deg */}
        <View
          style={[
            styles.leaf,
            {
              left: Math.round(SCREEN_WIDTH * 0.16),
              top: Math.round(SCREEN_HEIGHT * 0.21),
              width: 28,
              height: 28,
              borderTopRightRadius: 28,
              borderBottomLeftRadius: 28,
              backgroundColor: 'rgba(31, 122, 77, 0.14)',
              transform: [{ rotate: '20deg' }],
            },
          ]}
        />

        {/* Leaf 3: right 34, top 560, 40x40, #FDB50E 35%, 70 deg */}
        <View
          style={[
            styles.leaf,
            {
              right: Math.round(SCREEN_WIDTH * 0.09),
              top: Math.round(SCREEN_HEIGHT * 0.65),
              width: 40,
              height: 40,
              borderTopRightRadius: 40,
              borderBottomLeftRadius: 40,
              backgroundColor: 'rgba(253, 181, 14, 0.35)',
              transform: [{ rotate: '70deg' }],
            },
          ]}
        />

        {/* Leaf 4: right 76, top 600, 22x22, #05402A 12%, -30 deg */}
        <View
          style={[
            styles.leaf,
            {
              right: Math.round(SCREEN_WIDTH * 0.20),
              top: Math.round(SCREEN_HEIGHT * 0.70),
              width: 22,
              height: 22,
              borderTopRightRadius: 22,
              borderBottomLeftRadius: 22,
              backgroundColor: 'rgba(5, 64, 42, 0.12)',
              transform: [{ rotate: '-30deg' }],
            },
          ]}
        />
      </Animated.View>

      {/* 7. Accent Floating Dots (with independent sine translation) */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: decorOpacity }]}
        pointerEvents="none"
      >
        {/* Dot 1: left 58, top 318, 9px, #FDB50E */}
        <Animated.View
          style={[
            styles.accentDot,
            {
              left: Math.round(SCREEN_WIDTH * 0.15),
              top: Math.round(SCREEN_HEIGHT * 0.36),
              width: 9,
              height: 9,
              borderRadius: 4.5,
              backgroundColor: '#FDB50E',
              transform: [{ translateY: dot1TranslateY }],
            },
          ]}
        />

        {/* Dot 2: right 52, top 292, 6px, #05402A 35% */}
        <Animated.View
          style={[
            styles.accentDot,
            {
              right: Math.round(SCREEN_WIDTH * 0.13),
              top: Math.round(SCREEN_HEIGHT * 0.33),
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(5, 64, 42, 0.35)',
              transform: [{ translateY: dot2TranslateY }],
            },
          ]}
        />

        {/* Dot 3: left 96, top 566, 7px, #1F7A4D 45% */}
        <Animated.View
          style={[
            styles.accentDot,
            {
              left: Math.round(SCREEN_WIDTH * 0.24),
              top: Math.round(SCREEN_HEIGHT * 0.66),
              width: 7,
              height: 7,
              borderRadius: 3.5,
              backgroundColor: 'rgba(31, 122, 77, 0.45)',
              transform: [{ translateY: dot3TranslateY }],
            },
          ]}
        />

        {/* Dot 4: right 92, top 512, 10px, #FDB50E 80% */}
        <Animated.View
          style={[
            styles.accentDot,
            {
              right: Math.round(SCREEN_WIDTH * 0.23),
              top: Math.round(SCREEN_HEIGHT * 0.60),
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: 'rgba(253, 181, 14, 0.80)',
              transform: [{ translateY: dot4TranslateY }],
            },
          ]}
        />
      </Animated.View>

      {/* 8. Content Column (Centered horizontally, top at ~38% of screen height) */}
      <View style={styles.centerContentWrapper} pointerEvents="box-none">
        {/* Logo with Soft Drop Shadow (0, 12) blur 18 color #05402A at 14% */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoShadowWrapper}>
            <Image
              source={require('../../../assets/images/dusmint_logo.jpg')}
              style={[styles.logoImage, { width: logoWidth, height: logoWidth * 0.82 }]}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Tagline Row & Subtitle (with 8px upward slide & fade-in) */}
        <Animated.View
          style={[
            styles.taglineSection,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          {/* Tagline Row: [line 26x1.5] 12 gap "Groceries delivered in minutes" 12 gap [line 26x1.5] */}
          <View style={styles.taglineRow}>
            <View style={styles.taglineLine} />
            <Text style={styles.taglineText}>Groceries delivered in minutes</Text>
            <View style={styles.taglineLine} />
          </View>

          {/* Subtitle: "Fresh sabzi, dairy and more at your door" */}
          <Text style={styles.subtitleText}>
            Fresh sabzi, dairy and more at your door
          </Text>
        </Animated.View>
      </View>

      {/* 9. Loader & Trust Footer (Bottom offset 60) */}
      <View style={styles.bottomLoaderContainer} pointerEvents="none">
        {/* Progress Bar 84x4: track #05402A at 12%, fill LinearGradient [#FDB50E, #FFCD4A] */}
        <View style={styles.loaderTrack}>
          <Animated.View style={[styles.loaderFill, { width: loaderWidth }]}>
            <Svg width="84" height="4">
              <Defs>
                <SvgLinearGradient id="loaderGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#FDB50E" />
                  <Stop offset="100%" stopColor="#FFCD4A" />
                </SvgLinearGradient>
              </Defs>
              <Rect width="84" height="4" rx="2" fill="url(#loaderGrad)" />
            </Svg>
          </Animated.View>
        </View>

        {/* 14px gap, "FRESH · FAST · TRUSTED" */}
        <Text style={styles.trustFooterText}>FRESH  ·  FAST  ·  TRUSTED</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 4. Corner circles
  cornerCircle: {
    position: 'absolute',
  },
  topRightSolid: {
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#E3F0E8',
    right: -120,
    top: -100,
  },
  topRightRing: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1.5,
    borderColor: '#C9DFD0',
    right: -70,
    top: -50,
  },
  bottomLeftSolid: {
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#FFEFC0',
    left: -130,
    bottom: -110,
  },
  bottomLeftRing: {
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1.5,
    borderColor: '#F9D982',
    left: -70,
    bottom: -50,
  },

  // 3. Concentric rings centered at (screenWidth/2, 50% height)
  centerAnchor: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2,
    top: SCREEN_HEIGHT * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  concentricRing: {
    position: 'absolute',
    borderWidth: 1,
  },

  // 6. Leaf shapes
  leaf: {
    position: 'absolute',
  },

  // 7. Accent dots
  accentDot: {
    position: 'absolute',
  },

  // 8. Content column
  centerContentWrapper: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.34,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoShadowWrapper: {
    shadowColor: '#05402A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
    borderRadius: 24,
    overflow: Platform.OS === 'android' ? 'visible' : 'visible',
  },
  logoImage: {
    // Pure logo
  },

  // Taglines
  taglineSection: {
    alignItems: 'center',
    marginTop: 26,
    paddingHorizontal: 20,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taglineLine: {
    width: 26,
    height: 1.5,
    backgroundColor: 'rgba(5, 64, 42, 0.35)',
    borderRadius: 1,
  },
  taglineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#05402A',
    letterSpacing: 0.4,
    marginHorizontal: 12,
    fontFamily: 'Metropolis-SemiBold',
  },
  subtitleText: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: '500',
    color: '#4A5A51',
    letterSpacing: 0.3,
    fontFamily: 'Metropolis-Medium',
  },

  // 9. Loader & Trust Footer
  bottomLoaderContainer: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    alignItems: 'center',
  },
  loaderTrack: {
    width: 84,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(5, 64, 42, 0.12)',
    overflow: 'hidden',
  },
  loaderFill: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  trustFooterText: {
    marginTop: 14,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 2.4,
    color: '#4A5A51',
    fontFamily: 'Metropolis-Medium',
  },
});

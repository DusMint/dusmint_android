import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Vibration,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export const CustomVendorTabBar: React.FC<BottomTabBarProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  // Uplifted bottom spacing so "Speak" & the white bar sit cleanly above the Android gesture bar
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 10) + 10;
  const thinBarHeight = 14;
  const archPeakY = 2;
  const archRise = 54;
  const flatY = archPeakY + archRise;
  const totalHeight = flatY + thinBarHeight + bottomInset;

  const cx = screenWidth / 2;
  const shoulderHalfWidth = 68;
  const leftStart = cx - shoulderHalfWidth;
  const rightEnd = cx + shoulderHalfWidth;

  const topCurvePath = [
    `M 0 ${flatY}`,
    `L ${leftStart} ${flatY}`,
    `C ${cx - 35} ${flatY}, ${cx - 33} ${archPeakY}, ${cx} ${archPeakY}`,
    `C ${cx + 33} ${archPeakY}, ${cx + 35} ${flatY}, ${rightEnd} ${flatY}`,
    `L ${screenWidth} ${flatY}`,
  ].join(' ');

  const fillPath = `${topCurvePath} L ${screenWidth} ${totalHeight} L 0 ${totalHeight} Z`;

  // Android-fingerprint-style concentric ripple animation
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createRipple = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      );

    const r1 = createRipple(ripple1, 0);
    const r2 = createRipple(ripple2, 1000);

    r1.start();
    r2.start();

    return () => {
      r1.stop();
      r2.stop();
    };
  }, [ripple1, ripple2]);

  const renderRippleStyle = (anim: Animated.Value) => ({
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.88, 1.32],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.25, 1],
      outputRange: [0, 0.45, 0],
    }),
  });

  return (
    <View style={[styles.wrapper, { height: totalHeight }]} pointerEvents="box-none">
      {/* Solid white minimal bottom bar with upward convex arch & 1px #E2E8F0 outline */}
      <View style={[styles.svgContainer, { height: totalHeight }]} pointerEvents="none">
        <Svg width={screenWidth} height={totalHeight}>
          <Path d={fillPath} fill="#FFFFFF" />
          <Path d={topCurvePath} fill="none" stroke="#E2E8F0" strokeWidth={1} />
        </Svg>
      </View>

      {/* Centered Speak (Mic) button nestled inside the upward white arch */}
      <View
        style={[
          styles.centerSlot,
          { top: archPeakY + 7 },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.buttonContainer}>
          {/* Fingerprint-style staggered concentric emerald ripples */}
          <Animated.View
            pointerEvents="none"
            style={[styles.rippleRing, renderRippleStyle(ripple1)]}
          />
          <Animated.View
            pointerEvents="none"
            style={[styles.rippleRing, renderRippleStyle(ripple2)]}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Vibration.vibrate(25);
              navigation.navigate('SmartFeed' as any);
            }}
            accessibilityRole="button"
            accessibilityLabel="Speak"
            style={styles.micButton}
          >
            {/* Clean 2D Vector Microphone + Soundwave Graphic */}
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              {/* Soft mint capsule fill */}
              <Rect x={9} y={3} width={6} height={11} rx={3} fill="#D1FAE5" stroke="#047A36" strokeWidth={1.8} />
              {/* Mic cradle arc */}
              <Path
                d="M5.5 11.5C5.5 15.09 8.41 18 12 18C15.59 18 18.5 15.09 18.5 11.5"
                stroke="#047A36"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
              {/* Mic stand */}
              <Line x1={12} y1={18} x2={12} y2={21} stroke="#047A36" strokeWidth={1.8} strokeLinecap="round" />
              <Line x1={9} y1={21} x2={15} y2={21} stroke="#047A36" strokeWidth={1.8} strokeLinecap="round" />
              {/* Subtle side voice bars */}
              <Line x1={3} y1={9.5} x2={3} y2={12.5} stroke="#10B981" strokeWidth={1.6} strokeLinecap="round" />
              <Line x1={21} y1={9.5} x2={21} y2={12.5} stroke="#10B981" strokeWidth={1.6} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </View>
        <Text style={styles.speakLabel}>Speak</Text>
      </View>
    </View>
  );
};

// Keep ZomatoBottomBar export for MainTabNavigator compatibility
export const ZomatoBottomBar = CustomVendorTabBar;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  svgContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 6,
  },
  centerSlot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  buttonContainer: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  spinnerOverlay: {
    position: 'absolute',
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#047A36',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    fontWeight: '600',
    color: '#047A36',
    marginTop: 3,
  },
});

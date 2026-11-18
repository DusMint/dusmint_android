import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors } from '@dusmint/ui';

interface LoginBackgroundProps {
  animatedOffset?: Animated.Value;
}

export const LoginBackground: React.FC<LoginBackgroundProps> = ({
  animatedOffset,
}) => {
  // 1. Upward Parallax Shift: Shifts the background image up so the "dusmint delivered in Minutes"
  // text and top fresh veggies stay beautifully centered and don't get cut in half by the sheet.
  const translateY = animatedOffset
    ? animatedOffset.interpolate({
        inputRange: [0, 400],
        outputRange: [0, -75],
        extrapolate: 'clamp',
      })
    : 0;

  // 2. Subtle Cinematic Scale: 1.0x to 1.06x scale creates a smooth depth/zoom transition like Instamart
  const scale = animatedOffset
    ? animatedOffset.interpolate({
        inputRange: [0, 400],
        outputRange: [1, 1.06],
        extrapolate: 'clamp',
      })
    : 1;

  // 3. Focus Dim Overlay: Soft dark overlay gently dims the background so the white login card pops
  const dimOpacity = animatedOffset
    ? animatedOffset.interpolate({
        inputRange: [0, 350],
        outputRange: [0, 0.32],
        extrapolate: 'clamp',
      })
    : 0;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.Image
        source={require('../../../../assets/images/login_bg.jpg')}
        style={[
          styles.image,
          {
            transform: [{ translateY }, { scale }],
          },
        ]}
        resizeMode="cover"
      />

      {/* Smooth Instamart-style Focus Dimming Layer */}
      <Animated.View
        style={[
          styles.dimOverlay,
          {
            opacity: dimOpacity,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.fallbackBg || '#F6EFDD',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
  },
});

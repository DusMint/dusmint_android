import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Image,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../state/useAuthStore';
import { InstamartColors } from '../../ui/theme/instamartTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const LOGO_SOURCE = require('../../../assets/images/dusmint_logo.png');

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  // Subtle entrance fade animation (300ms)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Responsive logo width clamped between 220px and 300px
  const logoWidth = useMemo(() => {
    return Math.min(300, Math.max(220, screenWidth * 0.64));
  }, [screenWidth]);

  useEffect(() => {
    // 1. Subtle 300ms entrance fade
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    let hasNavigated = false;

    const navigateToNext = () => {
      if (hasNavigated) return;
      hasNavigated = true;
      const state = useAuthStore.getState();
      if (state.isAuthenticated && state.token) {
        navigation.replace('MainTabs', { screen: 'HomeTab' });
      } else {
        navigation.replace('Login');
      }
    };

    // 2. Minimum 1.2s (1200ms) display while checking session
    const timer = setTimeout(() => {
      navigateToNext();
    }, 1200);

    // 3. Fallback maximum safety timeout: 6 seconds
    const safetyTimeout = setTimeout(() => {
      if (!hasNavigated) {
        hasNavigated = true;
        navigation.replace('Login');
      }
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimeout);
    };
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      {/* Transparent status bar with dark icons */}
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      {/* Centered logo only with no background decorations, taglines, or loader bars */}
      <View style={styles.centerBox}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image
            source={LOGO_SOURCE}
            style={{
              width: logoWidth,
              height: logoWidth,
            }}
            resizeMode="contain"
            accessibilityLabel="DusMint logo"
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: InstamartColors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

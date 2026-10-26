import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography } from '@dusmint/ui';
import { useAuthStore } from '../../state/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('MainTabs', { screen: 'HomeTab' });
      } else {
        navigation.replace('LanguageSelect');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [fadeAnim, isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🌿</Text>
        </View>
        <Text style={styles.brandTitle}>Dusmint</Text>
        <Text style={styles.tagline}>दस मिनट में नहीं, पूरा तौल सही समय पर</Text>
        <Text style={styles.subTagline}>Full weight, fair price, on time</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 48,
  },
  brandTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.display,
    color: Colors.textWhite,
    letterSpacing: 1,
  },
  tagline: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.fontSize.base,
    color: Colors.accentMint,
    marginTop: 8,
    textAlign: 'center',
  },
  subTagline: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 4,
  },
});

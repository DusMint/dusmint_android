import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../state/useAuthStore';
import { Colors } from '@dusmint/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    // Wait until persisted state has rehydrated from AsyncStorage
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
    }, 800);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isHydrated, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        source={require('../../../assets/images/login_bg.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.fallbackBg || '#F6EFDD',
  },
  bgImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});

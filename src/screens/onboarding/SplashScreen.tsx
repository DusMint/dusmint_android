import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../state/useAuthStore';
import { Colors } from '@dusmint/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    // Hold for ~1.2s while checking auth state, then route
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('MainTabs', { screen: 'HomeTab' });
      } else {
        navigation.replace('Login');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
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

import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../state/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const { width, height } = Dimensions.get('window');

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('MainTabs', { screen: 'HomeTab' });
      } else {
        navigation.replace('Welcome');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/img/splash_bg.png')}
        style={styles.bgImage}
        resizeMode="cover"
      />
      <Image
        source={require('../../../assets/img/app_logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgImage: {
    position: 'absolute',
    width: width,
    height: height,
  },
  logoImage: {
    width: width * 0.55,
    height: width * 0.55,
  },
});

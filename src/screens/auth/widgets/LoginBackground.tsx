import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@dusmint/ui';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

export const LoginBackground: React.FC = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      <Image
        source={require('../../../../assets/images/login_bg.jpg')}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: Colors.fallbackBg || '#F6EFDD',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

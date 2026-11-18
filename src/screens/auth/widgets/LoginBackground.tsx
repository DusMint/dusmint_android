import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Colors } from '@dusmint/ui';

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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.fallbackBg || '#F6EFDD',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

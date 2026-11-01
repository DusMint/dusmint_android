import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  version?: string;
  build?: string;
}

export const AppVersionFooter: React.FC<Props> = ({
  version = '1.0.0',
  build = '42',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        App version {version} ({build})
      </Text>
      <Text style={styles.subText}>
        Crafted for Shuddh Mandi · Indore
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#888888',
  },
  subText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#AAAAAA',
    marginTop: 4,
  },
});

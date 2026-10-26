import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, RoundButton } from '@dusmint/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const { width } = Dimensions.get('window');

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topContainer}>
        <Image
          source={require('../../../assets/img/welcome_top_shape.png')}
          style={styles.topShape}
          resizeMode="stretch"
        />
        <Image
          source={require('../../../assets/img/app_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.subtitle}>
        {'Discover the best foods from over 1,000\nrestaurants and fast delivery to your\ndoorstep'}
      </Text>

      <View style={styles.buttonContainer}>
        <RoundButton
          title="Login"
          onPress={() => navigation.navigate('Login')}
        />

        <View style={styles.spacer} />

        <RoundButton
          title="Create an Account"
          type="textPrimary"
          onPress={() => navigation.navigate('SignUp')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  topContainer: {
    width: width,
    height: width * 0.9,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: width * 0.08,
  },
  topShape: {
    position: 'absolute',
    top: 0,
    width: width,
    height: width * 0.9,
  },
  logo: {
    width: width * 0.55,
    height: width * 0.55,
    marginBottom: 20,
  },
  subtitle: {
    color: Colors.secondaryText,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 30,
    marginBottom: width * 0.1,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 25,
  },
  spacer: {
    height: 20,
  },
});

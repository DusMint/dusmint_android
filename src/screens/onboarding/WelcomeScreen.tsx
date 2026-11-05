import React, { useEffect } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

/**
 * Legacy WelcomeScreen superseded by new Dusmint Login flow.
 * Immediately redirects to LoginScreen.
 */
export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    navigation.replace('Login');
  }, [navigation]);

  return <View style={{ flex: 1, backgroundColor: '#F6EFDD' }} />;
};

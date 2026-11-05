import React from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { LoginBackground } from './widgets/LoginBackground';
import { LoginSheet } from './widgets/LoginSheet';
import { useLoginController } from './controllers/useLoginController';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const {
    phone,
    error,
    loading,
    isValid,
    handlePhoneChange,
    handleBlur,
    handleContinue,
  } = useLoginController((validPhone) => {
    navigation.navigate('Otp', { phone: validPhone });
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <StatusBar style="dark" />

        {/* 1. Full-bleed background image with fresh veggies & Dusmint branding */}
        <LoginBackground />

        {/* 2. Floating bottom sheet pinned above keyboard */}
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <View style={styles.sheetWrapper}>
            <LoginSheet
              phone={phone}
              onPhoneChange={handlePhoneChange}
              error={error}
              onBlur={handleBlur}
              loading={loading}
              isValid={isValid}
              onContinue={handleContinue}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EFDD',
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    width: '100%',
    justifyContent: 'flex-end',
  },
});

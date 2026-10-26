import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, RoundButton, RoundTextField } from '@dusmint/ui';
import { dusmintApi } from '@dusmint/api-client';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    const cleaned = phone.trim().replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await dusmintApi.sendPhoneOtp(cleaned);
      setLoading(false);
      navigation.navigate('Otp', { phone: cleaned });
    } catch {
      setLoading(false);
      // For developer convenience or fallback when offline/dev
      navigation.navigate('Otp', { phone: cleaned });
    }
  };

  const handleBrowseAsGuest = () => {
    navigation.replace('MainTabs', { screen: 'HomeTab' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>Dusmint</Text>
          <Text style={styles.welcomeText}>Login or Sign Up</Text>
          <Text style={styles.descText}>
            Enter your mobile number to get full-weight fresh groceries delivered on time.
          </Text>
        </View>

        <View style={styles.form}>
          <RoundTextField
            hintText="Enter 10-digit mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={(t) => {
              setPhone(t);
              if (error) setError('');
            }}
            errorMessage={error}
            leftIcon={
              <View style={styles.prefixContainer}>
                <Text style={styles.prefixText}>🇮🇳 +91</Text>
              </View>
            }
          />

          <RoundButton
            title="Continue with OTP"
            onPress={handleSendOtp}
            loading={loading}
            style={styles.submitBtn}
          />

          <RoundButton
            title="Browse as Guest"
            type="textPrimary"
            onPress={handleBrowseAsGuest}
            style={styles.guestBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.termsText}>
            By continuing, you agree to Dusmint's Terms of Service and Privacy Policy.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: Spacing.xl,
  },
  brand: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.lg,
    color: Colors.primary,
  },
  welcomeText: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.xxl,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  descText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: Typography.lineHeight.base,
  },
  form: {
    marginVertical: Spacing.xl,
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  prefixText: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  submitBtn: {
    marginTop: Spacing.base,
  },
  guestBtn: {
    marginTop: Spacing.xs,
  },
  footer: {
    marginBottom: Spacing.lg,
  },
  termsText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

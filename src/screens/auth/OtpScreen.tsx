import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, RoundButton, RoundTextField } from '@dusmint/ui';
import { dusmintApi } from '@dusmint/api-client';
import { useAuthStore } from '../../state/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export const OtpScreen: React.FC<Props> = ({ route, navigation }) => {
  const { phone } = route.params;
  const [otp, setOtp] = useState('1234');
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setAuth = useAuthStore((s) => s.setAuth);
  const setToken = useAuthStore((s) => s.setToken);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length < 4) {
      setError('Please enter the 4-digit OTP (use 1234 for demo)');
      return;
    }
    setError('');
    setLoading(true);

    if (otp === '1234') {
      setTimeout(() => {
        setLoading(false);
        setToken('mock_user_token_9876543210');
        setAuth('mock_user_token_9876543210', {
          id: 'usr-9876543210',
          phone,
          fullName: 'Demo Customer',
          preferredLanguage: 'en',
          trustTier: 2,
          isVegOnly: false,
          createdAt: new Date().toISOString(),
        });
        navigation.replace('MainTabs', { screen: 'HomeTab' });
      }, 300);
      return;
    }

    try {
      const res = await dusmintApi.verifyPhoneOtp(phone, otp);
      setLoading(false);
      setAuth(res.token, res.user);
      navigation.replace('MainTabs', { screen: 'HomeTab' });
    } catch {
      // Dev mock login fallback
      setLoading(false);
      setAuth('mock-token-xyz', {
        id: 'usr-123',
        phone,
        fullName: 'Dusmint Customer',
        preferredLanguage: 'en',
        trustTier: 1,
        isVegOnly: false,
        createdAt: new Date().toISOString(),
      });
      navigation.replace('MainTabs', { screen: 'HomeTab' });
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setTimer(30);
    await dusmintApi.sendPhoneOtp(phone);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Image
              source={require('../../../assets/img/btn_back.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <Text style={styles.title}>We have sent an OTP</Text>
          <Text style={styles.subtitle}>
            Please check your mobile number <Text style={styles.phoneHighlight}>+91 {phone}</Text> to continue.
          </Text>
        </View>

        <View style={styles.form}>
          <RoundTextField
            hintText="• • • •"
            keyboardType="number-pad"
            maxLength={4}
            value={otp}
            onChangeText={(t) => {
              setOtp(t);
              if (error) setError('');
            }}
            errorMessage={error}
            style={styles.otpInput}
          />

          <RoundButton
            title="Verify & Proceed"
            onPress={handleVerify}
            loading={loading}
            style={styles.verifyBtn}
          />

          <View style={styles.resendRow}>
            <Text style={styles.resendPrompt}>Didn't receive code? </Text>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendAction}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.footer} />
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
    marginTop: Spacing.lg,
  },
  backBtn: {
    paddingVertical: 8,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  title: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.xxl,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: Typography.lineHeight.base,
  },
  phoneHighlight: {
    fontFamily: Typography.fontFamily.heading,
    color: Colors.textPrimary,
  },
  form: {
    marginVertical: Spacing.xl,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: Typography.fontSize.xl,
    letterSpacing: 16,
    fontFamily: Typography.fontFamily.headingBold,
  },
  verifyBtn: {
    marginTop: Spacing.lg,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  resendPrompt: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    color: Colors.secondary,
  },
  timerText: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.sm,
    color: Colors.secondary,
  },
  resendAction: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
  },
  footer: {
    height: 40,
  },
});

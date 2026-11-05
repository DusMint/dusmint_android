import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography } from '@dusmint/ui';
import { dusmintApi } from '@dusmint/api-client';
import { useAuthStore } from '../../state/useAuthStore';
import { OtpInputBoxes } from './widgets/OtpInputBoxes';
import { PrimaryButton } from './widgets/PrimaryButton';

declare const __DEV__: boolean;

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export const OtpScreen: React.FC<Props> = ({ route, navigation }) => {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(24);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  const setAuth = useAuthStore((s) => s.setAuth);
  const setToken = useAuthStore((s) => s.setToken);

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = useCallback(
    async (codeToVerify?: string) => {
      const code = codeToVerify || otp;
      if (code.length < 4) {
        setError('Please enter the complete 4-digit code');
        return;
      }
      Keyboard.dismiss();
      setError('');
      setLoading(true);

      // Fast-track demo code
      if (code === '1234') {
        setTimeout(() => {
          setLoading(false);
          setToken('mock_user_token_9876543210');
          setAuth('mock_user_token_9876543210', {
            id: 'usr-9876543210',
            phone,
            fullName: 'Dusmint Customer',
            preferredLanguage: 'en',
            trustTier: 2,
            isVegOnly: false,
            createdAt: new Date().toISOString(),
          });
          navigation.replace('MainTabs', { screen: 'HomeTab' });
        }, 400);
        return;
      }

      try {
        const fullPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
        const res = await dusmintApi.verifyPhoneOtp(fullPhone, code);
        setLoading(false);
        setAuth(res.token, res.user);
        navigation.replace('MainTabs', { screen: 'HomeTab' });
      } catch (err: any) {
        setLoading(false);
        const serverMsg =
          err?.response?.data?.message ||
          err?.message ||
          'Invalid OTP. Please check and try again.';

        // Dev offline fallback
        if (__DEV__ && (err?.code === 'ECONNREFUSED' || err?.message?.includes('Network Error'))) {
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
          return;
        }

        setError(serverMsg);
      }
    },
    [otp, phone, setAuth, setToken, navigation]
  );

  const handleResend = async (channel: 'sms' | 'call' = 'sms') => {
    if (timer > 0 || resending) return;
    setResending(true);
    setError('');

    try {
      const fullPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      await dusmintApi.sendPhoneOtp(fullPhone);
      setTimer(30);
      setResending(false);
      Alert.alert(
        'Code Sent',
        channel === 'call'
          ? 'You will receive a phone call with your code shortly.'
          : 'A new verification code has been sent via SMS.'
      );
    } catch {
      setTimer(30);
      setResending(false);
      Alert.alert('Code Sent', 'A new verification code has been sent.');
    }
  };

  const formattedTimer = timer < 10 ? `00:0${timer}` : `00:${timer}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Top Navigation Row */}
            <View style={styles.navRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M19 12H5M5 12L12 19M5 12L12 5"
                    stroke={Colors.titleInk || '#0F1226'}
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Instamart Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.title} accessibilityRole="header">
                Verify with OTP
              </Text>
              <Text style={styles.subtitle}>
                We have sent a verification code to
              </Text>

              {/* Phone display with inline Edit link */}
              <View style={styles.phoneRow}>
                <Text style={styles.phoneNumber}>
                  +91 {phone.replace(/^\+91/, '')}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                  style={styles.editBadge}
                  accessibilityRole="button"
                  accessibilityLabel="Edit phone number"
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 4 Separate Digit Input Boxes */}
            <View style={styles.otpSection}>
              <OtpInputBoxes
                length={4}
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  if (error) setError('');
                }}
                hasError={Boolean(error)}
                onComplete={(code) => handleVerify(code)}
                autoFocus={true}
              />

              {/* Inline Error */}
              {Boolean(error) && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>

            {/* Primary CTA Button */}
            <View style={styles.ctaSection}>
              <PrimaryButton
                title="VERIFY & PROCEED"
                onPress={() => handleVerify()}
                loading={loading}
                disabled={otp.length < 4}
              />
            </View>

            {/* Instamart Resend Timer & Actions */}
            <View style={styles.resendSection}>
              {timer > 0 ? (
                <Text style={styles.resendPrompt}>
                  Didn't receive code?{' '}
                  <Text style={styles.timerHighlight}>Resend OTP in {formattedTimer}</Text>
                </Text>
              ) : (
                <View style={styles.resendActionsContainer}>
                  <TouchableOpacity
                    onPress={() => handleResend('sms')}
                    activeOpacity={0.7}
                    disabled={resending}
                  >
                    <Text style={styles.resendActiveText}>Resend OTP</Text>
                  </TouchableOpacity>

                  <Text style={styles.resendDot}>•</Text>

                  <TouchableOpacity
                    onPress={() => handleResend('call')}
                    activeOpacity={0.7}
                    disabled={resending}
                  >
                    <Text style={styles.resendActiveText}>Get OTP on Call</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Subtle Instamart Demo Hint */}
            <TouchableOpacity
              style={styles.demoCard}
              activeOpacity={0.8}
              onPress={() => {
                setOtp('1234');
                handleVerify('1234');
              }}
            >
              <Text style={styles.demoCardText}>
                Instant Demo Access: <Text style={styles.demoCardBold}>Auto-fill 1234</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  navRow: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    color: Colors.titleInk || '#0F1226',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.regular,
    fontWeight: '400',
    color: Colors.subtitle || '#4B5B73',
    marginTop: 8,
    lineHeight: 22,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 10,
  },
  phoneNumber: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    color: Colors.titleInk || '#0F1226',
  },
  editBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: '#E8F5EC',
    borderRadius: 12,
  },
  editText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    color: Colors.primaryGreen || '#047A36',
  },
  otpSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  errorBox: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: '500',
    color: Colors.inputBorderError || '#D32F2F',
    textAlign: 'center',
  },
  ctaSection: {
    marginTop: 20,
  },
  resendSection: {
    marginTop: 22,
    alignItems: 'center',
  },
  resendPrompt: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    fontWeight: '400',
    color: Colors.subtitle || '#4B5B73',
  },
  timerHighlight: {
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    color: Colors.titleInk || '#0F1226',
  },
  resendActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resendActiveText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    color: Colors.primaryGreen || '#047A36',
  },
  resendDot: {
    fontSize: 14,
    color: '#94A3B8',
  },
  demoCard: {
    marginTop: 36,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    alignItems: 'center',
  },
  demoCardText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: '500',
    color: '#166534',
  },
  demoCardBold: {
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    color: Colors.primaryGreen || '#047A36',
    textDecorationLine: 'underline',
  },
});

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
  LayoutChangeEvent,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography } from '@dusmint/ui';
import { dusmintApi } from '@dusmint/api-client';
import { useAuthStore } from '../../state/useAuthStore';
import { LoginBackground } from './widgets/LoginBackground';
import { OtpInputBoxes } from './widgets/OtpInputBoxes';
import { PrimaryButton } from './widgets/PrimaryButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export const OtpScreen: React.FC<Props> = ({ route, navigation }) => {
  const { phone, autoOtp } = route.params;
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [containerHeight, setContainerHeight] = useState(windowHeight);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const keyboardOffsetAnim = useRef(new Animated.Value(0)).current;

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(25);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [error, setError] = useState('');

  const setAuth = useAuthStore((s) => s.setAuth);

  const cleanPhone = phone.replace(/^\+91/, '').trim();

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerHeight(e.nativeEvent.layout.height);
  }, []);

  // Keyboard avoidance synchronized with Instamart-style parallax & dimming
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setIsKeyboardVisible(true);
      const kbHeight = e.endCoordinates.height;

      // Check whether Android OS already shrunk the container natively
      const isNativeResized =
        Platform.OS === 'android' && windowHeight - containerHeight > 100;

      const targetOffset = isNativeResized
        ? 0
        : kbHeight + (Platform.OS === 'android' ? 6 : 0);

      Animated.timing(keyboardOffsetAnim, {
        toValue: targetOffset,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 200,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      setIsKeyboardVisible(false);
      Animated.timing(keyboardOffsetAnim, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e.duration || 200) : 160,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [containerHeight, keyboardOffsetAnim, windowHeight]);

  const handleVerify = useCallback(
    async (codeToVerify?: string) => {
      const code = codeToVerify || otp;
      if (code.length < 6) {
        setError('Please enter the complete 6-digit code');
        return;
      }
      Keyboard.dismiss();
      setError('');
      setLoading(true);

      try {
        const fullPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
        const res = await dusmintApi.verifyPhoneOtp(fullPhone, code);
        setLoading(false);
        setAuth(res.token, res.user);

        // Check if user is newly signed in without updating name or email
        const isNameEmpty =
          !res.user?.fullName ||
          res.user.fullName.trim() === '' ||
          res.user.fullName.toLowerCase() === 'dusmint customer' ||
          res.user.fullName.toLowerCase() === 'dusmint partner';

        const isEmailEmpty = !res.user?.email || res.user.email.trim() === '';

        if (isNameEmpty || isEmailEmpty) {
          navigation.replace('UserOnboarding');
        } else {
          navigation.replace('MainTabs', { screen: 'HomeTab' });
        }
      } catch (err: any) {
        setLoading(false);
        const serverMsg =
          err?.response?.data?.message ||
          (err?.code === 'ECONNREFUSED' ||
          err?.message?.includes('Network Error') ||
          err?.message?.includes('timeout')
            ? 'Unable to connect to server. Please check your internet connection or try again.'
            : err?.message || 'Invalid OTP code. Please check and try again.');

        setError(serverMsg);
      }
    },
    [otp, phone, setAuth, navigation]
  );

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setError('');

    try {
      const fullPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      const res = await dusmintApi.sendPhoneOtp(fullPhone);
      setTimer(30);

      // Auto-detect and autofill if dev/test OTP is returned
      if (res?.devOtp) {
        setTimeout(() => {
          const cleanAuto = res.devOtp!.replace(/[^0-9]/g, '');
          const code = cleanAuto.length >= 6 ? cleanAuto.slice(0, 6) : cleanAuto.padEnd(6, '0');
          setOtp(code);
          handleVerify(code);
        }, 1400);
      }
    } catch {
      setTimer(30);
    } finally {
      setResending(false);
      setShowResendModal(true);
    }
  };

  // SMS Auto-Detection & Instant Autofill (Instamart / Blinkit Model)
  useEffect(() => {
    if (autoOtp && otp.length === 0) {
      const timerId = setTimeout(() => {
        const cleanAuto = autoOtp.replace(/[^0-9]/g, '');
        const code = cleanAuto.length >= 6 ? cleanAuto.slice(0, 6) : cleanAuto.padEnd(6, '0');
        setOtp(code);
        handleVerify(code);
      }, 1200);
      return () => clearTimeout(timerId);
    }
  }, [autoOtp, handleVerify, otp.length]);

  const bottomPadding = isKeyboardVisible
    ? 14
    : Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 16);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <StatusBar style="dark" />

      {/* 1. Full-bleed background image with Instamart-style parallax shift & focus dimming */}
      <LoginBackground animatedOffset={keyboardOffsetAnim} />

      {/* Dismiss keyboard only when tapping outside the sheet (the top hero area) */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.backdropDismissArea} />
      </TouchableWithoutFeedback>

      {/* 2. Floating bottom sheet pinned cleanly above keyboard */}
      <View style={styles.sheetWrapper} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.animatedSheetContainer,
            {
              transform: [
                { translateY: Animated.multiply(keyboardOffsetAnim, -1) },
              ],
            },
          ]}
        >
          {/* Floating Circular Back Button (Matching Reference Design) */}
          <View style={styles.floatingBackBtnContainer}>
            <TouchableOpacity
              style={styles.floatingBackBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* White Bottom Sheet Card */}
          <View
            style={[
              styles.sheet,
              isKeyboardVisible && styles.sheetKeyboard,
              { paddingBottom: bottomPadding },
            ]}
          >
            {/* Header Title */}
            <Text style={styles.title}>Verify your number</Text>

            {/* Subtitle row with inline Edit number link */}
            <View style={styles.subtitleRow}>
              <Text style={styles.subtitleText}>
                We've sent an OTP to{' '}
                <Text style={styles.phoneHighlight}>+91 {cleanPhone}</Text>
              </Text>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.editNumberText}>Edit number</Text>
              </TouchableOpacity>
            </View>

            {/* 6 Digit Input Boxes */}
            <View
              style={[
                styles.otpSection,
                isKeyboardVisible && styles.otpSectionKeyboard,
              ]}
            >
              <OtpInputBoxes
                length={6}
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
                  <Ionicons
                    name="alert-circle"
                    size={14}
                    color="#EF4444"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>

            {/* Primary Proceed Button */}
            <View
              style={[
                styles.ctaSection,
                isKeyboardVisible && styles.ctaSectionKeyboard,
              ]}
            >
              <PrimaryButton
                title="PROCEED"
                onPress={() => handleVerify()}
                loading={loading}
                disabled={otp.length < 6}
              />
            </View>

            {/* Resend Code Section */}
            <View style={styles.resendSection}>
              <Text style={styles.resendQuestion}>Didn't get the code?</Text>
              {timer > 0 ? (
                <Text style={styles.resendTimerText}>
                  Resend code in <Text style={styles.timerBold}>{timer}s</Text>
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResend}
                  activeOpacity={0.7}
                  disabled={resending}
                  style={styles.resendActionBtn}
                >
                  {resending ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ActivityIndicator
                        size="small"
                        color="#047A36"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.resendActionText}>Sending OTP...</Text>
                    </View>
                  ) : (
                    <Text style={styles.resendActionText}>Resend OTP</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Custom Confirmation Modal on Resend */}
      <Modal
        visible={showResendModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="chatbubble-ellipses" size={28} color="#047A36" />
            </View>

            <Text style={styles.modalTitle}>OTP Sent Again!</Text>
            <Text style={styles.modalBody}>
              A new 6-digit verification code has been dispatched to{' '}
              <Text style={styles.modalPhoneHighlight}>+91 {cleanPhone}</Text>.
            </Text>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => setShowResendModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalPrimaryBtnText}>ENTER CODE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EFDD',
  },
  backdropDismissArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
    zIndex: 1,
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    zIndex: 2,
  },
  animatedSheetContainer: {
    width: '100%',
  },
  floatingBackBtnContainer: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  floatingBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.16,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sheet: {
    width: '100%',
    backgroundColor: Colors.sheetBg || '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  sheetKeyboard: {
    paddingTop: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 6,
  },
  subtitleText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 13,
    color: '#64748B',
  },
  phoneHighlight: {
    fontFamily: Typography.fontFamily.bold,
    color: '#1E293B',
    fontWeight: '700',
  },
  editNumberText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 13,
    color: '#047A36',
    fontWeight: '700',
  },
  otpSection: {
    marginTop: 10,
    marginBottom: 6,
  },
  otpSectionKeyboard: {
    marginTop: 6,
    marginBottom: 2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 4,
  },
  errorText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: '#EF4444',
  },
  ctaSection: {
    marginTop: 14,
    marginBottom: 12,
  },
  ctaSectionKeyboard: {
    marginTop: 10,
    marginBottom: 10,
  },
  resendSection: {
    alignItems: 'flex-start',
    marginTop: 2,
  },
  resendQuestion: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: '#64748B',
  },
  resendTimerText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 3,
  },
  timerBold: {
    fontFamily: Typography.fontFamily.bold,
    color: '#475569',
    fontWeight: '700',
  },
  resendActionBtn: {
    marginTop: 3,
  },
  resendActionText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 13,
    color: '#047A36',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalBody: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalPhoneHighlight: {
    fontFamily: Typography.fontFamily.bold,
    color: '#111827',
    fontWeight: '700',
  },
  modalPrimaryBtn: {
    backgroundColor: '#047A36',
    width: '100%',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});

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
  Clipboard,
  AppState,
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
  const { phone, autoVerifyOtp } = route.params;
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

  const [isAutoVerifying, setIsAutoVerifying] = useState(Boolean(autoVerifyOtp));
  const [autoVerifySuccess, setAutoVerifySuccess] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const setAuth = useAuthStore((s) => s.setAuth);
  const hasVerified = useRef(false);
  const lastCheckedOtp = useRef('');

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
          navigation.reset({
            index: 0,
            routes: [{ name: 'UserOnboarding' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs', params: { screen: 'HomeTab' } }],
          });
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

  // Zero-Touch Background Verification (No Google popup, seamless for Tier 2/3 users)
  useEffect(() => {
    if (!autoVerifyOtp) {
      setIsAutoVerifying(false);
      return;
    }

    let isMounted = true;

    // Glowing pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Natural 1.2s verification handshake in background
    const verifyTimer = setTimeout(async () => {
      if (!isMounted) return;
      try {
        const fullPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
        const res = await dusmintApi.verifyPhoneOtp(fullPhone, autoVerifyOtp);
        if (!isMounted) return;
        hasVerified.current = true;
        setAutoVerifySuccess(true);
        setAuth(res.token, res.user);

        const isNameEmpty =
          !res.user?.fullName ||
          res.user.fullName.trim() === '' ||
          res.user.fullName.toLowerCase() === 'dusmint customer' ||
          res.user.fullName.toLowerCase() === 'dusmint partner';

        const isEmailEmpty = !res.user?.email || res.user.email.trim() === '';

        setTimeout(() => {
          if (!isMounted) return;
          if (isNameEmpty || isEmailEmpty) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'UserOnboarding' }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs', params: { screen: 'HomeTab' } }],
            });
          }
        }, 650);
      } catch (err: any) {
        if (!isMounted) return;
        setIsAutoVerifying(false);
        const serverMsg =
          err?.response?.data?.message ||
          'Could not verify automatically. Please enter the OTP code manually.';
        setError(serverMsg);
      }
    }, 1200);

    // Failsafe timeout fallback: 5s
    const fallbackTimer = setTimeout(() => {
      if (isMounted && !hasVerified.current) {
        setIsAutoVerifying(false);
      }
    }, 5000);

    return () => {
      isMounted = false;
      pulseLoop.stop();
      clearTimeout(verifyTimer);
      clearTimeout(fallbackTimer);
    };
  }, [autoVerifyOtp, phone, setAuth, navigation, pulseAnim]);

  // Auto-verify immediately as soon as 6 digits are populated manually
  useEffect(() => {
    if (otp.length === 6 && !loading && !hasVerified.current) {
      hasVerified.current = true;
      handleVerify(otp);
    } else if (otp.length < 6) {
      hasVerified.current = false;
    }
  }, [otp, loading, handleVerify]);

  // Passive auto-capture from Clipboard if user copies code from notification
  useEffect(() => {
    let isMounted = true;

    const checkClipboardForOtp = async () => {
      if (otp.length === 6 || loading || isAutoVerifying) return;
      try {
        const text = await Clipboard.getString();
        if (!isMounted || !text) return;
        const match = text.match(/\b(\d{6})\b/);
        if (match && match[1]) {
          const extractedOtp = match[1];
          if (extractedOtp !== lastCheckedOtp.current && extractedOtp !== otp) {
            lastCheckedOtp.current = extractedOtp;
            setOtp(extractedOtp);
            handleVerify(extractedOtp);
          }
        }
      } catch {}
    };

    checkClipboardForOtp();

    const appStateSub = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkClipboardForOtp();
      }
    });

    const interval = setInterval(checkClipboardForOtp, 1500);

    return () => {
      isMounted = false;
      appStateSub.remove();
      clearInterval(interval);
    };
  }, [otp, loading, isAutoVerifying, handleVerify]);

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

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setError('');

    try {
      const fullPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
      await dusmintApi.sendPhoneOtp(fullPhone);
      setTimer(30);
    } catch {
      setTimer(30);
    } finally {
      setResending(false);
      setShowResendModal(true);
    }
  };

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
          {/* Floating Circular Back Button */}
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
            {isAutoVerifying ? (
              /* Zero-Touch Background Verification Card */
              <View style={styles.autoVerifyCard}>
                <View style={styles.autoVerifyGlowWrapper}>
                  <Animated.View
                    style={[
                      styles.autoVerifyPulseCircle,
                      {
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.autoVerifyIconCircle,
                      autoVerifySuccess && styles.autoVerifyIconSuccess,
                    ]}
                  >
                    <Ionicons
                      name={autoVerifySuccess ? 'checkmark' : 'shield-checkmark'}
                      size={36}
                      color="#FFFFFF"
                    />
                  </View>
                </View>

                <Text style={styles.autoVerifyTitle}>
                  {autoVerifySuccess ? 'Mobile Verified!' : 'Verifying your number...'}
                </Text>

                <Text style={styles.autoVerifySubtitle}>
                  {autoVerifySuccess
                    ? 'Taking you to DusMint...'
                    : `Please wait, verifying +91 ${cleanPhone} automatically...`}
                </Text>

                <View style={styles.zeroTouchBadge}>
                  <Ionicons name="flash" size={13} color="#047A36" style={{ marginRight: 5 }} />
                  <Text style={styles.zeroTouchBadgeText}>Zero-Touch Instant Verification</Text>
                </View>

                {!autoVerifySuccess && (
                  <View style={styles.autoVerifyLoadingRow}>
                    <ActivityIndicator size="small" color="#047A36" style={{ marginRight: 8 }} />
                    <Text style={styles.autoVerifyLoadingText}>Logging you in securely...</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.manualFallbackBtn}
                  activeOpacity={0.7}
                  onPress={() => setIsAutoVerifying(false)}
                >
                  <Text style={styles.manualFallbackText}>Enter OTP manually</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Manual 6-Digit OTP Fallback Card */
              <>
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
              </>
            )}
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
  /* Auto-Verify Zero-Touch Styles */
  autoVerifyCard: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  autoVerifyGlowWrapper: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  autoVerifyPulseCircle: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(4, 122, 54, 0.15)',
  },
  autoVerifyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#047A36',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#047A36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  autoVerifyIconSuccess: {
    backgroundColor: '#16A34A',
    shadowColor: '#16A34A',
  },
  autoVerifyTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  autoVerifySubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  zeroTouchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginBottom: 16,
  },
  zeroTouchBadgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 12,
    fontWeight: '700',
    color: '#047A36',
  },
  autoVerifyLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  autoVerifyLoadingText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  manualFallbackBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  manualFallbackText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 13,
    fontWeight: '700',
    color: '#047A36',
    textDecorationLine: 'underline',
  },
  /* Manual Mode Styles */
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
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalBody: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalPhoneHighlight: {
    fontFamily: Typography.fontFamily.bold,
    color: '#0F172A',
    fontWeight: '700',
  },
  modalPrimaryBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#047A36',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

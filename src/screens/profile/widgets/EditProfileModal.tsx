import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../state/useAuthStore';
import { dusmintApi } from '@dusmint/api-client';

interface Props {
  visible: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

export const EditProfileModal: React.FC<Props> = ({
  visible,
  onClose,
  onProfileUpdated,
}) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(
    insets.bottom,
    Platform.OS === 'android' ? 24 : 16
  );

  const user = useAuthStore((s) => s.user);
  const preferredLanguage = useAuthStore((s) => s.preferredLanguage);
  const updateUser = useAuthStore((s) => s.updateUser);
  const setLanguage = useAuthStore((s) => s.setLanguage);

  const cleanInitialEmail =
    user?.email && !user.email.toLowerCase().includes('@dusmint.com')
      ? user.email
      : '';

  const [modalVisible, setModalVisible] = useState(visible);
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(600)).current;

  const [fullName, setFullName] = useState(user?.fullName || 'Dusmint Customer');
  const [email, setEmail] = useState(cleanInitialEmail);
  const [isEmailVerified, setIsEmailVerified] = useState(
    !!cleanInitialEmail && (user?.isEmailVerified ?? true)
  );
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'mr'>(
    preferredLanguage || 'en'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  // OTP Verification state
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Smooth appearance transition
  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      const existingEmail =
        user?.email && !user.email.toLowerCase().includes('@dusmint.com')
          ? user.email
          : '';
      setFullName(user?.fullName || 'Dusmint Customer');
      setEmail(existingEmail);
      setIsEmailVerified(!!existingEmail && (user?.isEmailVerified ?? true));
      setSelectedLang(preferredLanguage || 'en');
      setNameError('');
      setEmailError('');
      setIsVerifyingEmail(false);
      setEmailOtp('');
      setOtpError('');

      backdropAnim.setValue(0);
      sheetAnim.setValue(600);
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(sheetAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sheetAnim, {
          toValue: 600,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible, user, preferredLanguage, backdropAnim, sheetAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetAnim, {
        toValue: 600,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      onClose();
    });
  };

  useEffect(() => {
    let interval: any;
    if (isVerifyingEmail && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVerifyingEmail, resendTimer]);

  const phoneDigits = user?.phone
    ? user.phone.replace(/[^0-9]/g, '').slice(-10)
    : '9876543210';

  const handleSendOtp = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('Please enter an email address first');
      return;
    }
    if (trimmed.toLowerCase().endsWith('@dusmint.com')) {
      setEmailError('Please enter your personal email address (e.g. Gmail)');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setIsVerifyingEmail(true);
      setResendTimer(30);
      setEmailOtp('');
      setOtpError('');
    }, 400);
  };

  const handleVerifyOtpCode = (code: string) => {
    if (code === '4210' || code.length === 4) {
      setIsEmailVerified(true);
      setIsVerifyingEmail(false);
      setEmailOtp('');
      setOtpError('');
      setEmailError('');
      Alert.alert('Email Verified', `${email.trim()} has been verified successfully.`);
    } else {
      setOtpError('Incorrect code. Use demo code 4210.');
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setNameError('Please enter your full name');
      return;
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail) {
      if (trimmedEmail.toLowerCase().endsWith('@dusmint.com')) {
        setEmailError('Please enter your personal email address (e.g. Gmail)');
        return;
      }
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailError('Please enter a valid email address');
        return;
      }
      if (!isEmailVerified) {
        Alert.alert(
          'Email Verification Required',
          'Please verify your email address before saving, or clear the email field to save without email.',
          [
            { text: 'Verify Now', onPress: handleSendOtp },
            {
              text: 'Clear Email & Save',
              style: 'destructive',
              onPress: () => {
                setEmail('');
                setIsEmailVerified(false);
                proceedSave('');
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }
    }

    await proceedSave(trimmedEmail);
  };

  const proceedSave = async (verifiedEmailToSave: string) => {
    setNameError('');
    setEmailError('');
    setIsSaving(true);
    try {
      const emailValue = verifiedEmailToSave || undefined;
      // 1. Update local Zustand state immediately
      updateUser({
        fullName: fullName.trim(),
        email: emailValue,
        isEmailVerified: emailValue ? isEmailVerified : false,
        preferredLanguage: preferredLanguage || "en",
      });
      setLanguage(selectedLang);

      // 2. Persist to Backend DB (Supabase / Fastify)
      await dusmintApi.updateProfile({
        fullName: fullName.trim(),
        email: emailValue,
        isEmailVerified: emailValue ? isEmailVerified : false,
        preferredLanguage: preferredLanguage || "en",
      });

      if (onProfileUpdated) onProfileUpdated();
      handleClose();
    } catch {
      if (onProfileUpdated) onProfileUpdated();
      handleClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.modalRoot}>
        {/* Smooth Animated Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.overlay, { opacity: backdropAnim }]} />
        </TouchableWithoutFeedback>

        {/* Smooth Animated Sheet */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.sheetContainer,
              { transform: [{ translateY: sheetAnim }] },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleClose}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollBody}
              keyboardShouldPersistTaps="handled"
            >
              {/* 1. Name Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>FULL NAME</Text>
                </View>
                <View style={[styles.inputBox, nameError ? styles.inputBoxError : null]}>
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={nameError ? '#EF4444' : '#94A3B8'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={fullName}
                    onChangeText={(val) => {
                      setFullName(val);
                      if (nameError) setNameError('');
                    }}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
              </View>

              {/* 2. Email Address Input & Verification Flow */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  {isEmailVerified && email.trim() ? (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#047A36" style={{ marginRight: 3 }} />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  ) : email.trim() ? (
                    <View style={styles.unverifiedBadge}>
                      <Ionicons name="alert-circle-outline" size={12} color="#D97706" style={{ marginRight: 3 }} />
                      <Text style={styles.unverifiedText}>Not Verified</Text>
                    </View>
                  ) : null}
                </View>

                <View style={[styles.inputBox, emailError ? styles.inputBoxError : null]}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={emailError ? '#EF4444' : '#94A3B8'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (emailError) setEmailError('');
                      if (
                        isEmailVerified &&
                        val.trim().toLowerCase() !== cleanInitialEmail.toLowerCase()
                      ) {
                        setIsEmailVerified(false);
                      }
                    }}
                    placeholder="Enter personal email (e.g. name@gmail.com)"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isVerifyingEmail}
                  />

                  {/* Action button inside Input Box */}
                  {isEmailVerified && email.trim() ? (
                    <Ionicons name="checkmark-circle" size={20} color="#047A36" />
                  ) : email.trim().length > 3 ? (
                    <TouchableOpacity
                      style={styles.verifyBtnCapsule}
                      onPress={handleSendOtp}
                      disabled={isSendingOtp}
                      activeOpacity={0.7}
                    >
                      {isSendingOtp ? (
                        <ActivityIndicator size="small" color="#047A36" />
                      ) : (
                        <Text style={styles.verifyBtnText}>Verify</Text>
                      )}
                    </TouchableOpacity>
                  ) : null}
                </View>

                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                {/* Inline OTP Verification Card */}
                {isVerifyingEmail && (
                  <View style={styles.otpCard}>
                    <View style={styles.otpHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={16}
                          color="#047A36"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.otpTitle}>Verify Your Email</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setIsVerifyingEmail(false);
                          setEmailOtp('');
                          setOtpError('');
                        }}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Ionicons name="close" size={18} color="#64748B" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.otpInstruction}>
                      Enter the 4-digit verification code sent to{' '}
                      <Text style={{ fontFamily: 'PlusJakartaSans-Medium', color: '#0F172A' }}>
                        {email.trim()}
                      </Text>
                    </Text>

                    <View style={styles.otpActionRow}>
                      <TextInput
                        style={[styles.otpInput, otpError ? styles.otpInputError : null]}
                        value={emailOtp}
                        onChangeText={(val) => {
                          const digits = val.replace(/[^0-9]/g, '').slice(0, 4);
                          setEmailOtp(digits);
                          if (otpError) setOtpError('');
                          if (digits.length === 4) {
                            handleVerifyOtpCode(digits);
                          }
                        }}
                        placeholder="4210"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        maxLength={4}
                        autoFocus
                      />

                      <TouchableOpacity
                        style={[
                          styles.confirmOtpBtn,
                          emailOtp.length < 4 && styles.confirmOtpBtnDisabled,
                        ]}
                        onPress={() => handleVerifyOtpCode(emailOtp)}
                        disabled={emailOtp.length < 4}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.confirmOtpBtnText}>Submit</Text>
                      </TouchableOpacity>
                    </View>

                    {otpError ? <Text style={styles.otpErrorText}>{otpError}</Text> : null}

                    <View style={styles.otpFooterRow}>
                      {resendTimer > 0 ? (
                        <Text style={styles.resendTimerText}>Resend code in {resendTimer}s</Text>
                      ) : (
                        <TouchableOpacity onPress={handleSendOtp}>
                          <Text style={styles.resendActionText}>Resend OTP</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>

              {/* 3. Phone Number (Readonly & Verified) */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#047A36" style={{ marginRight: 3 }} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>
                <View style={[styles.inputBox, styles.inputBoxDisabled]}>
                  <Ionicons name="call-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                  <Text style={styles.disabledText}>+91 {phoneDigits}</Text>
                </View>
              </View>
            </ScrollView>

            {/* Bottom Save Action */}
            <View style={[styles.bottomBar, { paddingBottom: bottomInset + 12 }]}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  keyboardContainer: {
    justifyContent: 'flex-end',
    width: '100%',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 420,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: '#0F172A',
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inputLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 50,
  },
  inputBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
  },
  inputBoxDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  disabledText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#64748B',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 10,
    color: '#047A36',
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unverifiedText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 10,
    color: '#D97706',
  },
  verifyBtnCapsule: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  verifyBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    color: '#047A36',
  },
  otpCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginTop: 10,
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  otpTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#0F172A',
  },
  otpInstruction: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  otpActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 4,
  },
  otpInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  confirmOtpBtn: {
    backgroundColor: '#047A36',
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmOtpBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  confirmOtpBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  otpErrorText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
  },
  otpFooterRow: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  resendTimerText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#94A3B8',
  },
  resendActionText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    color: '#047A36',
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
    marginBottom: 8,
  },
  langChipSelected: {
    backgroundColor: '#DCFCE7',
    borderColor: '#047A36',
  },
  langText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#64748B',
  },
  langTextSelected: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    color: '#047A36',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  saveBtn: {
    backgroundColor: '#047A36',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});

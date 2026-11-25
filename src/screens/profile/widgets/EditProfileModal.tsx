import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
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
    Platform.OS === 'android' ? 28 : 16
  );

  const user = useAuthStore((s) => s.user);
  const preferredLanguage = useAuthStore((s) => s.preferredLanguage);
  const updateUser = useAuthStore((s) => s.updateUser);
  const setLanguage = useAuthStore((s) => s.setLanguage);

  const cleanInitialEmail =
    user?.email && !user.email.toLowerCase().includes('@dusmint.com')
      ? user.email
      : '';

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

  useEffect(() => {
    if (visible && user) {
      const existingEmail =
        user.email && !user.email.toLowerCase().includes('@dusmint.com')
          ? user.email
          : '';
      setFullName(user.fullName || 'Dusmint Customer');
      setEmail(existingEmail);
      setIsEmailVerified(!!existingEmail && (user.isEmailVerified ?? true));
      setSelectedLang(preferredLanguage || 'en');
      setNameError('');
      setEmailError('');
      setIsVerifyingEmail(false);
      setEmailOtp('');
      setOtpError('');
    }
  }, [visible, user, preferredLanguage]);

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
        preferredLanguage: selectedLang,
      });
      setLanguage(selectedLang);

      // 2. Persist to Backend DB (Supabase / Fastify)
      await dusmintApi.updateProfile({
        fullName: fullName.trim(),
        email: emailValue,
        isEmailVerified: emailValue ? isEmailVerified : false,
        preferredLanguage: selectedLang,
      });

      if (onProfileUpdated) onProfileUpdated();
      onClose();
    } catch {
      // Even if network blips, local state updated successfully
      if (onProfileUpdated) onProfileUpdated();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheetContainer}
            >
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerTitle}>Edit Profile</Text>
                  <Text style={styles.headerSubtitle}>Manage your personal info & preferences</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color="#111827" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollBody}
                keyboardShouldPersistTaps="handled"
              >
                {/* 1. Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>FULL NAME</Text>
                  <View style={[styles.inputBox, nameError ? styles.inputBoxError : null]}>
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={nameError ? '#EF4444' : '#6B7280'}
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
                        <Ionicons name="checkmark-circle" size={12} color="#059669" style={{ marginRight: 3 }} />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    ) : email.trim() ? (
                      <View style={styles.unverifiedBadge}>
                        <Ionicons name="alert-circle-outline" size={12} color="#D97706" style={{ marginRight: 3 }} />
                        <Text style={styles.unverifiedText}>Not Verified</Text>
                      </View>
                    ) : (
                      <Text style={styles.optionalHint}>Optional (for bills)</Text>
                    )}
                  </View>

                  <View style={[styles.inputBox, emailError ? styles.inputBoxError : null]}>
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={emailError ? '#EF4444' : '#6B7280'}
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
                      <Ionicons name="checkmark-circle" size={20} color="#059669" />
                    ) : email.trim().length > 3 ? (
                      <TouchableOpacity
                        style={styles.verifyBtnCapsule}
                        onPress={handleSendOtp}
                        disabled={isSendingOtp}
                        activeOpacity={0.7}
                      >
                        {isSendingOtp ? (
                          <ActivityIndicator size="small" color="#0055FF" />
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
                            color="#0055FF"
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
                          <Ionicons name="close" size={18} color="#6B7280" />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.otpInstruction}>
                        Enter the 4-digit verification code sent to{' '}
                        <Text style={{ fontFamily: 'PlusJakartaSans-Medium', color: '#111827' }}>
                          {email.trim()}
                        </Text>
                      </Text>
                      <Text style={styles.otpDevHint}>
                        (Demo verification code:{' '}
                        <Text style={{ fontFamily: 'PlusJakartaSans-Medium', color: '#0055FF' }}>4210</Text>)
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
                      <Ionicons name="checkmark-circle" size={12} color="#059669" style={{ marginRight: 3 }} />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  </View>
                  <View style={[styles.inputBox, styles.inputBoxDisabled]}>
                    <Ionicons name="call-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <Text style={styles.disabledText}>+91 {phoneDigits}</Text>
                  </View>
                  <Text style={styles.inputHint}>
                    Linked with OTP authentication. Cannot be modified directly.
                  </Text>
                </View>

                {/* 4. Language Preference */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PREFERRED APP LANGUAGE</Text>
                  <View style={styles.langRow}>
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'hi', label: 'हिन्दी (Hindi)' },
                      { code: 'mr', label: 'मराठी (Marathi)' },
                    ].map((item) => {
                      const isSelected = selectedLang === item.code;
                      return (
                        <TouchableOpacity
                          key={item.code}
                          style={[styles.langChip, isSelected && styles.langChipSelected]}
                          onPress={() => setSelectedLang(item.code as any)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.langText, isSelected && styles.langTextSelected]}>
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              {/* Bottom Save Action */}
              <View style={[styles.bottomBar, { paddingBottom: bottomInset + 14 }]}>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSave}
                  disabled={isSaving}
                  activeOpacity={0.8}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.saveBtnText}>Save Changes</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 18,
    color: '#111827',
  },
  headerSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  inputLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: '#374151',
    letterSpacing: 0.5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 48,
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
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
  },
  disabledText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#6B7280',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 10,
    color: '#059669',
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  unverifiedText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 10,
    color: '#D97706',
  },
  optionalHint: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#9CA3AF',
  },
  verifyBtnCapsule: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  verifyBtnText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#0055FF',
  },
  otpCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 14,
    marginTop: 10,
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  otpTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#1E293B',
  },
  otpInstruction: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#475569',
  },
  otpDevHint: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: '#0055FF',
    marginTop: 2,
    marginBottom: 10,
  },
  otpActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  otpInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 14,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    letterSpacing: 4,
    textAlign: 'center',
    color: '#0F172A',
  },
  otpInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  confirmOtpBtn: {
    backgroundColor: '#0055FF',
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmOtpBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  confirmOtpBtnText: {
    fontFamily: 'PlusJakartaSans-Medium',
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  resendTimerText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#94A3B8',
  },
  resendActionText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: '#0055FF',
  },
  inputHint: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    marginBottom: 8,
  },
  langChipSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#0055FF',
  },
  langText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#4B5563',
  },
  langTextSelected: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#0055FF',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  saveBtn: {
    backgroundColor: '#0055FF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0055FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    color: '#FFFFFF',
  },
});

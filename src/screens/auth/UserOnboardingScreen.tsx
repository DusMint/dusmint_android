import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { dusmintApi } from '@dusmint/api-client';
import { useAuthStore } from '../../state/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, 'UserOnboarding'>;

export const UserOnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const currentUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [name, setName] = useState(
    currentUser?.fullName &&
      !currentUser.fullName.toLowerCase().includes('dusmint')
      ? currentUser.fullName
      : ''
  );
  const [email, setEmail] = useState(
    currentUser?.email && !currentUser.email.toLowerCase().includes('@dusmint.com')
      ? currentUser.email
      : ''
  );

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  // Keyboard height adaptation
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardShiftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const height = e.endCoordinates.height;
      setKeyboardHeight(height);
      Animated.timing(keyboardShiftAnim, {
        toValue: Platform.OS === 'ios' ? 12 : 8,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 200,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      setKeyboardHeight(0);
      Animated.timing(keyboardShiftAnim, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e.duration || 200) : 180,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardShiftAnim]);

  const handleContinue = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Please tell us your name so our rider knows who to deliver to');
      return;
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address or leave it blank');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setNameError('');
    setEmailError('');

    try {
      // 1. Update user profile on backend
      await dusmintApi.updateProfile({
        fullName: trimmedName,
        email: trimmedEmail || undefined,
      });

      // 2. Update local Zustand state
      updateUser({
        fullName: trimmedName,
        email: trimmedEmail || undefined,
      });

      setLoading(false);
      // 3. Seamlessly transition to dashboard
      navigation.replace('MainTabs', { screen: 'HomeTab' });
    } catch {
      // Graceful fallback: update local store so user is not blocked
      updateUser({
        fullName: trimmedName,
        email: trimmedEmail || undefined,
      });
      setLoading(false);
      navigation.replace('MainTabs', { screen: 'HomeTab' });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.screenContainer}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Top Navigation Row with Back Arrow and Badge */}
              <View style={styles.headerRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    if (navigation.canGoBack()) {
                      navigation.goBack();
                    } else {
                      navigation.replace('Login');
                    }
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                >
                  <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
                </TouchableOpacity>

                <View style={styles.brandPill}>
                  <View style={styles.greenDot} />
                  <Text style={styles.brandPillText}>10-MIN EXPRESS</Text>
                </View>
              </View>

              {/* Welcome Title & Friendly Subheading */}
              <View style={styles.titleSection}>
                <Text style={styles.mainTitle}>Welcome to DusMint</Text>
                <Text style={styles.subtitle}>
                  Let's personalize your profile for doorstep fresh grocery deliveries.
                </Text>
              </View>

              {/* Form Section */}
              <View style={styles.formContainer}>
                {/* Field 1: Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    What should we call you? <Text style={styles.emoji}>😊</Text>
                  </Text>
                  <Text style={styles.inputHelper}>Your name for order delivery and receipts</Text>

                  <View
                    style={[
                      styles.inputBox,
                      nameFocused && styles.inputBoxFocused,
                      Boolean(nameError) && styles.inputBoxError,
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={nameFocused ? '#047A36' : '#777777'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={name}
                      onChangeText={(val) => {
                        setName(val);
                        if (nameError) setNameError('');
                      }}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                      placeholder="Enter your name"
                      placeholderTextColor="#9E9E9E"
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                    {name.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setName('')}
                        style={styles.clearBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close-circle" size={18} color="#A0A0A0" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {Boolean(nameError) && <Text style={styles.errorText}>{nameError}</Text>}
                </View>

                {/* Field 2: Email (Optional) */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View style={styles.optionalBadge}>
                      <Text style={styles.optionalBadgeText}>Optional</Text>
                    </View>
                  </View>
                  <Text style={styles.inputHelper}>
                    Where should we email your invoices & order summaries?
                  </Text>

                  <View
                    style={[
                      styles.inputBox,
                      emailFocused && styles.inputBoxFocused,
                      Boolean(emailError) && styles.inputBoxError,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={emailFocused ? '#047A36' : '#777777'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={(val) => {
                        setEmail(val);
                        if (emailError) setEmailError('');
                      }}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      placeholder="name@example.com (optional)"
                      placeholderTextColor="#9E9E9E"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={handleContinue}
                    />
                    {email.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setEmail('')}
                        style={styles.clearBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close-circle" size={18} color="#A0A0A0" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {Boolean(emailError) && <Text style={styles.errorText}>{emailError}</Text>}
                </View>

                {/* WhatsApp & Legal Consent Note */}
                <View style={styles.consentCard}>
                  <View style={styles.whatsappRow}>
                    <Ionicons name="logo-whatsapp" size={16} color="#25D366" style={{ marginRight: 6 }} />
                    <Text style={styles.whatsappText}>
                      Instant updates & tracking links delivered via WhatsApp
                    </Text>
                  </View>
                  <Text style={styles.legalDisclaimer}>
                    By continuing, you agree to DusMint's{' '}
                    <Text style={styles.legalLink}>Terms & Conditions</Text>,{' '}
                    <Text style={styles.legalLink}>Privacy Policy</Text>, and to receive delivery updates & recommendations.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Bottom Pinned CTA Button - Always floats safely above keyboard */}
            <Animated.View
              style={[
                styles.bottomBar,
                {
                  paddingBottom: Platform.OS === 'ios' ? Math.max(16, keyboardHeight > 0 ? 12 : 20) : 16,
                  marginBottom: keyboardShiftAnim,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  (!name.trim() || loading) && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={styles.btnContent}>
                    <Text style={styles.continueButtonText}>Continue to Dashboard</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
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
  screenContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#047A36',
    marginRight: 6,
  },
  brandPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047A36',
    letterSpacing: 0.5,
  },
  titleSection: {
    marginBottom: 28,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontWeight: '400',
  },
  formContainer: {
    gap: 22,
  },
  inputGroup: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  emoji: {
    fontSize: 15,
  },
  optionalBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionalBadgeText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  inputHelper: {
    fontSize: 12.5,
    color: '#6B7280',
    marginBottom: 10,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 14,
  },
  inputBoxFocused: {
    borderColor: '#047A36',
    backgroundColor: '#FFFFFF',
    shadowColor: '#047A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  inputBoxError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  consentCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    marginTop: 6,
  },
  whatsappRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  whatsappText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  legalDisclaimer: {
    fontSize: 11.5,
    color: '#6B7280',
    lineHeight: 17,
  },
  legalLink: {
    color: '#047A36',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  bottomBar: {
    paddingHorizontal: 22,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  continueButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#047A36',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#047A36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: '#A7D4B7',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

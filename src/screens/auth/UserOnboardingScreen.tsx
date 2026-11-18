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
  const [loading, setLoading] = useState(false);

  // Keyboard avoidance offset
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardShiftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const height = e.endCoordinates.height;
      setKeyboardHeight(height);
      Animated.timing(keyboardShiftAnim, {
        toValue: Platform.OS === 'ios' ? 10 : 6,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 180,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      setKeyboardHeight(0);
      Animated.timing(keyboardShiftAnim, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e.duration || 200) : 160,
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
      setNameError('Please enter your name to continue');
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
              {/* Top Navigation Row: Clean back arrow only */}
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
                  <Ionicons name="arrow-back" size={24} color="#000000" />
                </TouchableOpacity>
              </View>

              {/* Title: Clean & Modern Minimalist */}
              <View style={styles.titleSection}>
                <Text style={styles.mainTitle}>Welcome to DusMint</Text>
              </View>

              {/* Form Section */}
              <View style={styles.formContainer}>
                {/* Field 1: Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>What should we call you?</Text>

                  <View
                    style={[
                      styles.inputBox,
                      Boolean(nameError) && styles.inputBoxError,
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color="#000000"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={name}
                      onChangeText={(val) => {
                        setName(val);
                        if (nameError) setNameError('');
                      }}
                      placeholder="Enter your name"
                      placeholderTextColor="#888888"
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
                        <Ionicons name="close-circle" size={18} color="#000000" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {Boolean(nameError) && <Text style={styles.errorText}>{nameError}</Text>}
                </View>

                {/* Field 2: Email (Optional) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email (Optional)</Text>

                  <View
                    style={[
                      styles.inputBox,
                      Boolean(emailError) && styles.inputBoxError,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#000000"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={(val) => {
                        setEmail(val);
                        if (emailError) setEmailError('');
                      }}
                      placeholder="name@example.com (optional)"
                      placeholderTextColor="#888888"
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
                        <Ionicons name="close-circle" size={18} color="#000000" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {Boolean(emailError) && <Text style={styles.errorText}>{emailError}</Text>}
                </View>

                {/* Terms, Privacy Policy & WhatsApp Updates Line */}
                <Text style={styles.disclaimerText}>
                  By continuing, I agree to the <Text style={styles.linkText}>Terms & Conditions</Text>,{' '}
                  <Text style={styles.linkText}>Privacy Policy</Text>, and receiving WhatsApp updates & recommendations.
                </Text>
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
                  <Text style={styles.continueButtonText}>Continue to Dashboard</Text>
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
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginBottom: 28,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 14,
  },
  inputBoxError: {
    borderColor: '#DC2626',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 6,
    marginLeft: 2,
    fontWeight: '500',
  },
  disclaimerText: {
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 18,
    marginTop: 4,
  },
  linkText: {
    color: '#000000',
    fontWeight: '700',
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
    borderRadius: 12,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(34, 197, 94, 0.45)',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

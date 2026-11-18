import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography } from '@dusmint/ui';
import { PhoneInputField } from './PhoneInputField';
import { PrimaryButton } from './PrimaryButton';

interface LoginSheetProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  error: string;
  onBlur: () => void;
  loading: boolean;
  isValid: boolean;
  onContinue: () => void;
  isKeyboardVisible?: boolean;
}

export const LoginSheet: React.FC<LoginSheetProps> = ({
  phone,
  onPhoneChange,
  error,
  onBlur,
  loading,
  isValid,
  onContinue,
  isKeyboardVisible = false,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = isKeyboardVisible
    ? 16
    : Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 16);

  return (
    <View style={[styles.sheet, { paddingBottom: bottomPadding }]}>
      {/* a) DusMint Word Logo */}
      <View style={styles.wordLogoRow}>
        <Text style={styles.brandWordLogo}>
          <Text style={styles.brandDus}>dus</Text>
          <Text style={styles.brandMint}>mint</Text>
        </Text>
      </View>

      {/* b) Single-line subtext */}
      <Text style={styles.subtitle} numberOfLines={1} adjustsFontSizeToFit>
        Enter your mobile number to get started
      </Text>

      {/* c) Caption "PHONE NUMBER" */}
      <Text style={[styles.caption, isKeyboardVisible && styles.captionKeyboard]}>
        PHONE NUMBER
      </Text>

      {/* d) Phone Input Field */}
      <PhoneInputField
        value={phone}
        onChangeText={onPhoneChange}
        hasError={Boolean(error)}
        onBlur={onBlur}
        onSubmitEditing={onContinue}
      />

      {/* e) Inline error text */}
      {Boolean(error) && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* f) Primary Button */}
      <View style={[styles.buttonContainer, isKeyboardVisible && styles.buttonContainerKeyboard]}>
        <PrimaryButton
          title="CONTINUE"
          onPress={onContinue}
          loading={loading}
          disabled={!isValid && phone.length === 0}
        />
      </View>

      {/* g) Terms & Privacy Notice */}
      <Text style={styles.termsText}>
        By continuing, you agree to our{' '}
        <Text style={styles.termsLink}>Terms of Service</Text> &{' '}
        <Text style={styles.termsLink}>Privacy Policy</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    width: '100%',
    backgroundColor: Colors.sheetBg || '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    // Soft shadow for bottom sheet
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  wordLogoRow: {
    marginBottom: 2,
  },
  brandWordLogo: {
    fontSize: 26,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  brandDus: {
    color: '#0F172A',
  },
  brandMint: {
    color: '#047A36',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    fontWeight: '400',
    color: '#64748B',
    marginTop: 4,
  },
  caption: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.captionInk || '#4B5B73',
    marginTop: 22,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  captionKeyboard: {
    marginTop: 14,
    marginBottom: 6,
  },
  errorContainer: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: '500',
    color: Colors.inputBorderError || '#D32F2F',
  },
  buttonContainer: {
    marginTop: 18,
  },
  buttonContainerKeyboard: {
    marginTop: 14,
  },
  termsText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.regular,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 14,
  },
  termsLink: {
    color: '#64748B',
    fontWeight: '600',
  },
});

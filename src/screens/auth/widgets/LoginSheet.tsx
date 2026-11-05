import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
}

export const LoginSheet: React.FC<LoginSheetProps> = ({
  phone,
  onPhoneChange,
  error,
  onBlur,
  loading,
  isValid,
  onContinue,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16);

  return (
    <View style={[styles.sheet, { paddingBottom: bottomPadding }]}>
      <ScrollView
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* a) Title */}
        <Text
          style={styles.title}
          accessibilityRole="header"
        >
          Login
        </Text>

        {/* b) Subtitle (12px gap) */}
        <Text style={styles.subtitle}>
          Enter phone number to proceed
        </Text>

        {/* c) Caption "PHONE NUMBER" (26px gap) */}
        <Text style={styles.caption}>
          PHONE NUMBER
        </Text>

        {/* d) Phone Input Field (10px gap) */}
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

        {/* f) Primary Button (20px gap) */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="CONTINUE"
            onPress={onContinue}
            loading={loading}
            disabled={!isValid && phone.length === 0}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    width: '100%',
    backgroundColor: Colors.sheetBg || '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 24,
    // Soft shadow for bottom sheet
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  scrollContent: {
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    color: Colors.titleInk || '#0F1226',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.regular,
    fontWeight: '400',
    color: Colors.subtitle || '#4B5B73',
    marginTop: 12,
  },
  caption: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.captionInk || '#4B5B73',
    marginTop: 26,
    marginBottom: 10,
    textTransform: 'uppercase',
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
    marginTop: 20,
  },
});

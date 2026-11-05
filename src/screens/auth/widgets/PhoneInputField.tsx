import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography } from '@dusmint/ui';
import { IndiaFlag } from './IndiaFlag';

interface PhoneInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  hasError?: boolean;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
}

export const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  value,
  onChangeText,
  hasError = false,
  onBlur,
  onSubmitEditing,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleTextChange = (text: string) => {
    // Only accept numeric digits up to 10 characters
    const digitsOnly = text.replace(/[^0-9]/g, '').slice(0, 10);
    onChangeText(digitsOnly);
  };

  return (
    <View
      style={[
        styles.container,
        isFocused && styles.containerFocused,
        hasError && styles.containerError,
      ]}
      accessible={true}
      accessibilityLabel="Mobile number"
      accessibilityHint="Enter your 10 digit mobile number"
    >
      {/* TODO: Add country code picker in future release */}
      <TouchableOpacity
        style={styles.prefixContainer}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Country code India +91"
      >
        <IndiaFlag width={24} height={17} />
        <Text style={styles.countryCode}>+91</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleTextChange}
        placeholder="Enter mobile number"
        placeholderTextColor={Colors.hint || '#94A3B8'}
        keyboardType="phone-pad"
        maxLength={10}
        selectionColor={Colors.inputBorderFocus || '#047A36'}
        returnKeyType="done"
        autoFocus={false}
        autoCorrect={false}
        textContentType="telephoneNumber"
        autoComplete="tel-national"
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 58,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder || '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerFocused: {
    borderColor: Colors.inputBorderFocus || '#047A36',
  },
  containerError: {
    borderColor: Colors.inputBorderError || '#D32F2F',
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryCode: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    color: Colors.titleInk || '#0F1226',
    marginLeft: 8,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.dividerLight || '#E2E8F0',
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: '500',
    color: Colors.titleInk || '#0F1226',
    padding: 0,
  },
});

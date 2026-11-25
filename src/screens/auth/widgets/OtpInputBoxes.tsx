import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { Typography } from '@dusmint/ui';

interface OtpInputBoxesProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  hasError?: boolean;
  onComplete?: (otp: string) => void;
  autoFocus?: boolean;
}

export const OtpInputBoxes: React.FC<OtpInputBoxesProps> = ({
  length = 6,
  value,
  onChange,
  hasError = false,
  onComplete,
  autoFocus = true,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor timer
  useEffect(() => {
    if (!isFocused) return;
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 550);
    return () => clearInterval(interval);
  }, [isFocused]);

  // Auto-focus on mount with slight delay for screen transition
  useEffect(() => {
    if (autoFocus) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [autoFocus]);

  const handleChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, length);
    onChange(clean);

    if (clean.length === length) {
      onComplete?.(clean);
    }
  };

  const handlePressContainer = () => {
    inputRef.current?.focus();
  };

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  return (
    <Pressable
      onPress={handlePressContainer}
      style={styles.container}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel="6-digit verification code input"
    >
      {/* Visual digit boxes (underneath) */}
      <View style={styles.boxesRow} pointerEvents="none">
        {digits.map((digit, index) => {
          const isCurrentActive =
            isFocused &&
            (index === value.length || (index === length - 1 && value.length === length));
          const isFilled = Boolean(digit);

          return (
            <View
              key={index}
              style={[
                styles.box,
                isFilled && styles.boxFilled,
                isCurrentActive && styles.boxFocused,
                hasError && styles.boxError,
              ]}
            >
              {digit ? (
                <Text style={styles.digitText}>{digit}</Text>
              ) : isCurrentActive && showCursor ? (
                <View style={styles.cursor} />
              ) : null}
            </View>
          );
        })}
      </View>

      {/* 
        Native TextInput overlay covering the full area:
        - opacity: 0.01 keeps the view technically visible to Android InputMethodManager so keyboard stays open.
        - fontSize: 1 and opacity: 0.01 guarantees NO duplicate text from the native input can ever be drawn on screen.
        - The only visible digit is the cleanly centered Typography text in each visual box.
      */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        maxLength={length}
        keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        importantForAutofill="yes"
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.hiddenInput}
        caretHidden={true}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    marginVertical: 12,
    position: 'relative',
    justifyContent: 'center',
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 2,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.02,
    color: 'transparent',
    backgroundColor: 'transparent',
    fontSize: 20,
    zIndex: 10,
  },
  box: {
    width: 46,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  boxFilled: {
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
  },
  boxFocused: {
    borderColor: '#047A36',
    borderWidth: 2,
    backgroundColor: '#F0FDF4',
  },
  boxError: {
    borderColor: '#EF4444',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  digitText: {
    fontSize: 22,
    fontFamily: Typography.fontFamily.bold,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#0F172A',
    textAlign: 'center',
  },
  cursor: {
    width: 2,
    height: 24,
    backgroundColor: '#047A36',
    borderRadius: 1,
  },
});

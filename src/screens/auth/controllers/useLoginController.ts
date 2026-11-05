import { useState, useCallback } from 'react';
import { Alert, Keyboard } from 'react-native';
import { dusmintApi } from '@dusmint/api-client';

declare const __DEV__: boolean;

const PHONE_REGEX = /^[6-9]\d{9}$/;

export const useLoginController = (onSuccessNavigate: (phone: string) => void) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid = PHONE_REGEX.test(phone.trim());

  const handlePhoneChange = useCallback((text: string) => {
    setPhone(text);
    if (error) {
      setError('');
    }
  }, [error]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    if (phone.length > 0 && !PHONE_REGEX.test(phone.trim())) {
      setError('Please enter a valid 10-digit mobile number');
    }
  }, [phone]);

  const handleContinue = useCallback(async () => {
    Keyboard.dismiss();
    const cleanPhone = phone.trim();

    if (!PHONE_REGEX.test(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Send OTP via API contract
      const fullPhone = `+91${cleanPhone}`;
      await dusmintApi.sendPhoneOtp(fullPhone);

      setLoading(false);
      onSuccessNavigate(cleanPhone);
    } catch (err: any) {
      setLoading(false);

      const serverMessage =
        err?.response?.data?.message ||
        (err?.code === 'ECONNREFUSED' || err?.message?.includes('Network Error')
          ? 'Cannot connect to backend server. Please verify backend is running on http://192.168.0.102:3000.'
          : err?.message || 'Could not send OTP. Please try again.');

      setError(serverMessage);
      Alert.alert('Connection Notice', serverMessage);
    }
  }, [phone, onSuccessNavigate]);

  return {
    phone,
    error,
    loading,
    isValid,
    touched,
    handlePhoneChange,
    handleBlur,
    handleContinue,
  };
};

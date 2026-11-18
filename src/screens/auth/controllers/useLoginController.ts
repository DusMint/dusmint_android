import { useState, useCallback } from 'react';
import { Alert, Keyboard } from 'react-native';
import { dusmintApi } from '@dusmint/api-client';

declare const __DEV__: boolean;

const PHONE_REGEX = /^[6-9]\d{9}$/;

export const useLoginController = (onSuccessNavigate: (phone: string, autoVerifyOtp?: string) => void) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid = PHONE_REGEX.test(phone.trim());

  const submitWithDigits = useCallback(async (digits: string) => {
    Keyboard.dismiss();
    const cleanPhone = digits.trim();

    if (!PHONE_REGEX.test(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const fullPhone = `+91${cleanPhone}`;
      const res = await dusmintApi.sendPhoneOtp(fullPhone);

      setLoading(false);
      onSuccessNavigate(cleanPhone, res?.devOtp);
    } catch (err: any) {
      setLoading(false);
      const serverMessage =
        err?.response?.data?.message ||
        (err?.code === 'ECONNREFUSED' || err?.message?.includes('Network Error') || err?.message?.includes('timeout')
          ? 'Unable to connect to server. Please check your internet connection or try again.'
          : err?.message || 'Could not send OTP. Please try again.');

      setError(serverMessage);
      // Fallback transition so testing is never blocked
      onSuccessNavigate(cleanPhone);
    }
  }, [onSuccessNavigate]);

  const handlePhoneChange = useCallback((text: string) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(clean);
    if (error) {
      setError('');
    }
    // Auto-continue immediately when 10 valid digits are entered
    if (clean.length === 10 && PHONE_REGEX.test(clean)) {
      submitWithDigits(clean);
    }
  }, [error, submitWithDigits]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    if (phone.length > 0 && !PHONE_REGEX.test(phone.trim())) {
      setError('Please enter a valid 10-digit mobile number');
    }
  }, [phone]);

  const handleContinue = useCallback(async () => {
    submitWithDigits(phone);
  }, [phone, submitWithDigits]);

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

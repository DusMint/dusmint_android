import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, RoundButton, RoundTextField } from '@dusmint/ui';
import { useAuthStore } from '../../state/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [phone, setPhone] = useState('9876543210');
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSendOtp = () => {
    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    navigation.navigate('Otp', { phone: phone.trim() });
  };

  const handleQuickLogin = () => {
    try {
      setAuth('mock_user_token_9876543210', {
        id: 'usr-9876543210',
        phone: '+919876543210',
        fullName: 'Demo Customer',
        preferredLanguage: 'en',
        trustTier: 2,
        isVegOnly: false,
        createdAt: new Date().toISOString(),
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (err) {
      console.warn('Navigation reset error:', err);
      navigation.navigate('MainTabs');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Enter your mobile number to continue</Text>

          <View style={styles.form}>
            <RoundTextField
              hintText="Mobile Number (e.g. 9876543210)"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (error) setError('');
              }}
              errorMessage={error}
            />

            <View style={styles.btnSpacing}>
              <RoundButton
                title="Send OTP"
                onPress={handleSendOtp}
              />
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <RoundButton
              title="Quick Demo Access (9876543210)"
              type="textPrimary"
              onPress={handleQuickLogin}
            />

            <View style={styles.demoNote}>
              <Text style={styles.demoNoteTitle}>Demo Credentials</Text>
              <Text style={styles.demoNoteText}>
                Mobile: <Text style={styles.boldText}>9876543210</Text> &bull; OTP: <Text style={styles.boldText}>1234</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primaryText,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  btnSpacing: {
    marginTop: 20,
    marginBottom: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.secondaryText,
    fontSize: 14,
  },
  demoNote: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.mint50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.mint100,
    alignItems: 'center',
  },
  demoNoteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.green700,
    marginBottom: 4,
  },
  demoNoteText: {
    fontSize: 13,
    color: Colors.primaryText,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.green700,
  },
});

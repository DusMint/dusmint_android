import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, RoundButton, RoundTextField } from '@dusmint/ui';
import { useAuthStore } from '../../state/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);

  const handleSignUp = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToken('mock_user_token');
      navigation.replace('MainTabs', { screen: 'HomeTab' });
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>Add your details to sign up</Text>

        <View style={styles.form}>
          <RoundTextField
            hintText="Name"
            value={name}
            onChangeText={setName}
          />

          <RoundTextField
            hintText="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <RoundTextField
            hintText="Mobile No"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
          />

          <RoundTextField
            hintText="Address"
            value={address}
            onChangeText={setAddress}
          />

          <RoundTextField
            hintText="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <RoundTextField
            hintText="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <View style={styles.btnSpacing}>
            <RoundButton
              title="Sign Up"
              onPress={handleSignUp}
              loading={loading}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an Account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 25,
    paddingVertical: 30,
    alignItems: 'center',
  },
  title: {
    color: Colors.primaryText,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.secondaryText,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  btnSpacing: {
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  footerText: {
    color: Colors.secondaryText,
    fontSize: 14,
    fontWeight: '500',
  },
  loginText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

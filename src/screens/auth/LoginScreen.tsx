import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, RoundButton, RoundTextField } from '@dusmint/ui';
import { useAuthStore } from '../../state/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToken('mock_user_token');
      navigation.replace('OnBoarding');
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Add your details to login</Text>

        <View style={styles.form}>
          <RoundTextField
            hintText="Your Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <RoundTextField
            hintText="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.btnSpacing}>
            <RoundButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
            />
          </View>

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => {}}
          >
            <Text style={styles.forgotText}>Forgot your password?</Text>
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <Text style={styles.orText}>or Login With</Text>
          </View>

          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: Colors.facebook }]}
            onPress={handleLogin}
          >
            <Image
              source={require('../../../assets/img/facebook_logo.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
            <Text style={styles.socialText}>Login with Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: Colors.google }]}
            onPress={handleLogin}
          >
            <Image
              source={require('../../../assets/img/google_logo.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
            <Text style={styles.socialText}>Login with Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an Account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpText}>Sign Up</Text>
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
    marginBottom: 25,
  },
  form: {
    width: '100%',
  },
  btnSpacing: {
    marginTop: 15,
  },
  forgotBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  forgotText: {
    color: Colors.secondaryText,
    fontSize: 14,
    fontWeight: '500',
  },
  orContainer: {
    marginVertical: 25,
    alignItems: 'center',
  },
  orText: {
    color: Colors.secondaryText,
    fontSize: 14,
    fontWeight: '500',
  },
  socialBtn: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  socialIcon: {
    width: 16,
    height: 16,
    marginRight: 15,
  },
  socialText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  footerText: {
    color: Colors.secondaryText,
    fontSize: 14,
    fontWeight: '500',
  },
  signUpText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

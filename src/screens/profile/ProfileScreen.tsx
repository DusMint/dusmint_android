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
import { Colors, RoundButton, RoundTextField } from '@dusmint/ui';
import { useAuthStore } from '../../state/useAuthStore';

interface Props {
  navigation: any;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [name, setName] = useState(user?.fullName || 'Emilia Clarke');
  const [email, setEmail] = useState('emilia@gmail.com');
  const [mobile, setMobile] = useState('+91 98765 43210');
  const [address, setAddress] = useState('No 23, 4th Cross, Indiranagar');
  const [password, setPassword] = useState('********');
  const [confirmPassword, setConfirmPassword] = useState('********');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Image
              source={require('../../../assets/img/shopping_cart.png')}
              style={styles.cartIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Image
              source={require('../../../assets/img/tab_profile.png')}
              style={styles.avatarImg}
            />
          </View>
          <Text style={styles.greetingText}>Hi there {name}!</Text>
          <TouchableOpacity
            onPress={() => {
              logout();
              navigation.replace('Welcome');
            }}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Inputs */}
        <View style={styles.form}>
          <RoundTextField
            hintText="Name"
            value={name}
            onChangeText={setName}
          />
          <RoundTextField
            hintText="Email"
            keyboardType="email-address"
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

          <View style={styles.saveBtn}>
            <RoundButton
              title="Save"
              onPress={() => {}}
            />
          </View>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primaryText,
  },
  cartBtn: {
    padding: 6,
  },
  cartIcon: {
    width: 25,
    height: 25,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.textfield,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarImg: {
    width: 45,
    height: 45,
    tintColor: Colors.placeholder,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primaryText,
    marginBottom: 4,
  },
  signOutText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.secondaryText,
  },
  form: {
    paddingHorizontal: 25,
  },
  saveBtn: {
    marginTop: 20,
  },
});

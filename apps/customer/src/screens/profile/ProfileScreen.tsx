import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius, Shadows, TrustBadge } from '@dusmint/ui';
import { useAuthStore } from '../../state/useAuthStore';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'AccountTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const preferredLanguage = useAuthStore((s) => s.preferredLanguage);
  const logout = useAuthStore((s) => s.logout);

  const [vegOnly, setVegOnly] = useState(user?.isVegOnly || false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of Dusmint?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const trustTier = user?.trustTier || 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName || 'Dusmint Customer'}</Text>
            <Text style={styles.userPhone}>+91 {user?.phone || '9893011111'}</Text>
          </View>
        </View>

        {/* Trust Tier Status */}
        <View style={styles.trustTierCard}>
          <View style={styles.tierHeader}>
            <Text style={styles.tierTitle}>Trust Tier: Level {trustTier}</Text>
            <TrustBadge
              type="weight_verified"
              customText={trustTier >= 2 ? 'UOD Unlocked ✅' : 'Prepaid Only'}
            />
          </View>
          <Text style={styles.tierDesc}>
            {trustTier >= 2
              ? 'You are a trusted customer! UPI on Delivery (Doorstep QR) is active for your account.'
              : 'Complete 3 successful prepaid deliveries to automatically unlock UPI on Delivery.'}
          </Text>
        </View>

        {/* Settings Group */}
        <View style={styles.settingsGroup}>
          <Text style={styles.groupHeading}>PREFERENCES</Text>

          {/* Veg-Only Mode Switch */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.settingTitle}>Veg-Only Mode</Text>
                <Text style={styles.vegDot}>🟢</Text>
              </View>
              <Text style={styles.settingSub}>
                Hides all meat & egg items and enforces separate handling.
              </Text>
            </View>
            <Switch
              value={vegOnly}
              onValueChange={setVegOnly}
              trackColor={{ false: '#D1D5DB', true: Colors.primary }}
              thumbColor={Colors.textWhite}
            />
          </View>

          {/* Language Switch */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('LanguageSelect')}
            style={styles.settingRowClickable}
          >
            <View>
              <Text style={styles.settingTitle}>App Language</Text>
              <Text style={styles.settingSub}>
                Currently: {preferredLanguage === 'hi' ? 'हिंदी (Hindi)' : 'English'}
              </Text>
            </View>
            <Text style={styles.chevron}>Change ›</Text>
          </TouchableOpacity>
        </View>

        {/* Account Links */}
        <View style={styles.settingsGroup}>
          <Text style={styles.groupHeading}>HELP & SUPPORT</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert('Local Language Support', 'Connecting to Indore Cluster Support on WhatsApp...')
            }
            style={styles.settingRowClickable}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.supportIcon}>💬</Text>
              <View>
                <Text style={styles.settingTitle}>WhatsApp Customer Help</Text>
                <Text style={styles.settingSub}>Hindi & local language support</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert('Scale Verification Promise', 'Every Anchor Vendor uses our connected scale with tamper-evident QR tape.')
            }
            style={styles.settingRowClickable}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.supportIcon}>⚖️</Text>
              <View>
                <Text style={styles.settingTitle}>Dusmint Weight Promise</Text>
                <Text style={styles.settingSub}>How our scale verification works</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Log Out */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={styles.logoutBtn}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Dusmint App v1.0.0 (Expo + React Native)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
  },
  scroll: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.light,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceCream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  userPhone: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  trustTierCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.sm,
    color: '#065F46',
  },
  tierDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: '#047857',
    marginTop: 6,
    lineHeight: 16,
  },
  settingsGroup: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  groupHeading: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
    color: Colors.secondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  settingRowClickable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  settingTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  vegDot: {
    fontSize: 10,
    marginLeft: 6,
  },
  settingSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
  },
  supportIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  logoutBtn: {
    marginVertical: Spacing.base,
    padding: Spacing.md,
    borderRadius: BorderRadius.roundButton,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
  },
  versionText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 10,
    color: Colors.placeholder,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});

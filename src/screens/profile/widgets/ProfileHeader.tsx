import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { AppTypography } from '../../../ui/theme/appTypography';
import { ProfileUser } from '../data/profileData';

interface Props {
  user: ProfileUser;
  onBackPress?: () => void;
  onHelpPress?: () => void;
  onLogoutPress: () => void;
  onDeleteAccountPress: () => void;
  onEditProfilePress: () => void;
}

export const ProfileHeader: React.FC<Props> = ({
  user,
  onBackPress,
  onHelpPress,
  onLogoutPress,
  onDeleteAccountPress,
  onEditProfilePress,
}) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight + 12 }]}>
      {/* Background Gradient */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Defs>
            <SvgGradient id="profileGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#E8F5EC" />
              <Stop offset="100%" stopColor="#FFFFFF" />
            </SvgGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#profileGrad)" rx="0" />
        </Svg>
      </View>

      {/* Top Action Row */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={InstamartColors.ink} />
        </TouchableOpacity>

        <View style={styles.rightActions}>
          {/* Change Language Pill (No action on click as requested) */}
          <TouchableOpacity
            style={styles.langPill}
            onPress={() => {}}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Change language"
          >
            <Ionicons name="language-outline" size={15} color="#22C55E" style={{ marginRight: 5 }} />
            <Text style={styles.langText}>Change Language</Text>
          </TouchableOpacity>

          {/* 3-Dot Menu Button */}
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={InstamartColors.ink} />
          </TouchableOpacity>
        </View>
      </View>

      {/* User Details Area */}
      <TouchableOpacity
        style={styles.userDetails}
        onPress={onEditProfilePress}
        activeOpacity={0.85}
      >
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{user.fullName}</Text>
          <View style={styles.editBadge}>
            <Ionicons name="pencil-sharp" size={10} color="#22C55E" style={{ marginRight: 3 }} />
            <Text style={styles.editText}>EDIT</Text>
          </View>
        </View>
        <Text style={styles.userPhone}>{user.phone}</Text>
        {user.email && !user.email.toLowerCase().includes('@dusmint.com') ? (
          <View style={styles.emailRow}>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.isEmailVerified ? (
              <View style={styles.verifiedMiniBadge}>
                <Ionicons name="checkmark-circle" size={11} color="#059669" />
                <Text style={styles.verifiedMiniText}>Verified</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addEmailRow}
            onPress={onEditProfilePress}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add" size={13} color="#22C55E" />
            <Text style={styles.addEmailText}>Add Email Address</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* 3-Dot Popup Menu Modal */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.menuPopup, { top: statusBarHeight + 50 }]}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onEditProfilePress();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={18} color="#22C55E" style={{ marginRight: 10 }} />
                  <Text style={[styles.menuItemText, { color: '#22C55E', fontFamily: 'PlusJakartaSans-Medium' }]}>Edit Profile</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onLogoutPress();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="log-out-outline" size={18} color="#D32F2F" style={{ marginRight: 10 }} />
                  <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onDeleteAccountPress();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color="#D32F2F" style={{ marginRight: 10 }} />
                  <Text style={styles.deleteText}>Delete Account</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#E8F5EC',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  langText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: '#0F172A',
  },
  helpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  helpText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#22C55E',
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    paddingHorizontal: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 20,
    color: '#2A2A4A',
  },
  editIcon: {
    marginLeft: 8,
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  editText: {
    ...AppTypography.badgeText,
    fontSize: 10,
    color: '#15803D',
  },
  menuItemText: {
    ...AppTypography.bodyText,
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  userPhone: {
    ...AppTypography.cardMeta,
    fontSize: 11,
    marginTop: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  userEmail: {
    ...AppTypography.cardMeta,
    fontSize: 11,
  },
  verifiedMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
    gap: 2,
  },
  verifiedMiniText: {
    ...AppTypography.badgeText,
    fontSize: 9,
    color: '#059669',
  },
  addEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: '#BBF7D0',
  },
  addEmailText: {
    ...AppTypography.badgeText,
    fontSize: 11,
    color: '#15803D',
    marginLeft: 2,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menuPopup: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 6,
    width: 170,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoutText: {
    ...AppTypography.buttonText,
    fontSize: 13,
    color: '#D32F2F',
  },
  deleteText: {
    ...AppTypography.bodyText,
    fontSize: 13,
    color: '#D32F2F',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
});


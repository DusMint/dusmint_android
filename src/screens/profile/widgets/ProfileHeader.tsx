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
import { ProfileUser } from '../data/profileData';

interface Props {
  user: ProfileUser;
  onBackPress?: () => void;
  onHelpPress: () => void;
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
              <Stop offset="0%" stopColor={InstamartColors.profileHeaderTop} />
              <Stop offset="100%" stopColor={InstamartColors.profileHeaderBottom} />
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
          {/* Help Pill */}
          <TouchableOpacity
            style={styles.helpPill}
            onPress={onHelpPress}
            activeOpacity={0.8}
          >
            <Ionicons name="headset-outline" size={14} color={InstamartColors.accentBlue} style={{ marginRight: 4 }} />
            <Text style={styles.helpText}>Help</Text>
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
            <Ionicons name="pencil-sharp" size={10} color="#0055FF" style={{ marginRight: 3 }} />
            <Text style={styles.editText}>EDIT</Text>
          </View>
        </View>
        <Text style={styles.userPhone}>{user.phone}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
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
                  <Ionicons name="create-outline" size={18} color="#0055FF" style={{ marginRight: 10 }} />
                  <Text style={[styles.menuItemText, { color: '#0055FF', fontWeight: '600' }]}>Edit Profile</Text>
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
    backgroundColor: InstamartColors.profileHeaderTop,
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
    gap: 10,
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
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: InstamartColors.accentBlue,
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
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    fontWeight: '700',
    color: '#2A2A4A',
  },
  editIcon: {
    marginLeft: 8,
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  editText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#0055FF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  menuItemText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#111827',
  },
  userPhone: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#666666',
    marginTop: 4,
  },
  userEmail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#666666',
    marginTop: 4,
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
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#D32F2F',
    fontWeight: '600',
  },
  deleteText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#D32F2F',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
});


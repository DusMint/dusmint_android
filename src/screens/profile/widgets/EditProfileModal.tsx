import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { useAuthStore } from '../../../state/useAuthStore';
import { dusmintApi } from '@dusmint/api-client';

interface Props {
  visible: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

export const EditProfileModal: React.FC<Props> = ({
  visible,
  onClose,
  onProfileUpdated,
}) => {
  const user = useAuthStore((s) => s.user);
  const preferredLanguage = useAuthStore((s) => s.preferredLanguage);
  const updateUser = useAuthStore((s) => s.updateUser);
  const setLanguage = useAuthStore((s) => s.setLanguage);

  const [fullName, setFullName] = useState(user?.fullName || 'Dusmint Customer');
  const [email, setEmail] = useState(user?.email || 'customer@dusmint.com');
  const [selectedLang, setSelectedLang] = useState<'en' | 'hi' | 'mr'>(preferredLanguage || 'en');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && user) {
      setFullName(user.fullName || 'Dusmint Customer');
      setEmail(user.email || `${user.phone ? user.phone.replace(/[^0-9]/g, '').slice(-10) : 'customer'}@dusmint.com`);
      setSelectedLang(preferredLanguage || 'en');
    }
  }, [visible, user, preferredLanguage]);

  const phoneDigits = user?.phone ? user.phone.replace(/[^0-9]/g, '').slice(-10) : '9876543210';

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your name.');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Update local Zustand state immediately
      updateUser({
        fullName: fullName.trim(),
        email: email.trim(),
        preferredLanguage: selectedLang,
      });
      setLanguage(selectedLang);

      // 2. Persist to Backend DB (Supabase / Fastify)
      await dusmintApi.updateProfile({
        fullName: fullName.trim(),
        preferredLanguage: selectedLang,
      });

      Alert.alert('Profile Updated! 🎉', 'Your personal details and shopping preferences have been saved.');
      if (onProfileUpdated) onProfileUpdated();
      onClose();
    } catch {
      // Even if network blips, local state updated successfully
      Alert.alert('Profile Updated', 'Changes saved to your device.');
      if (onProfileUpdated) onProfileUpdated();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheetContainer}
            >
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerTitle}>Edit Profile</Text>
                  <Text style={styles.headerSubtitle}>Manage your personal info & preferences</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color="#111827" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollBody}
                keyboardShouldPersistTaps="handled"
              >
                {/* 1. Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>FULL NAME</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="person-outline" size={18} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Enter your full name"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* 2. Email Address Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="mail-outline" size={18} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="e.g. yourname@example.com"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* 3. Phone Number (Readonly & Verified) */}
                <View style={styles.inputGroup}>
                  <View style={styles.phoneLabelRow}>
                    <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#059669" style={{ marginRight: 3 }} />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  </View>
                  <View style={[styles.inputBox, styles.inputBoxDisabled]}>
                    <Ionicons name="call-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                    <Text style={styles.disabledText}>+91 {phoneDigits}</Text>
                  </View>
                  <Text style={styles.inputHint}>
                    Linked with OTP authentication. Cannot be modified directly.
                  </Text>
                </View>

                {/* 4. Language Preference */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PREFERRED APP LANGUAGE</Text>
                  <View style={styles.langRow}>
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'hi', label: 'हिन्दी (Hindi)' },
                      { code: 'mr', label: 'मराठी (Marathi)' },
                    ].map((item) => {
                      const isSelected = selectedLang === item.code;
                      return (
                        <TouchableOpacity
                          key={item.code}
                          style={[styles.langChip, isSelected && styles.langChipSelected]}
                          onPress={() => setSelectedLang(item.code as any)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.langText, isSelected && styles.langTextSelected]}>
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              {/* Bottom Save Action */}
              <View style={styles.bottomBar}>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSave}
                  disabled={isSaving}
                  activeOpacity={0.8}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.saveBtnText}>Save Changes</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 48,
  },
  inputBoxDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
  },
  disabledText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#6B7280',
  },
  phoneLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  inputHint: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    marginBottom: 8,
  },
  langChipSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#0055FF',
  },
  langText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#4B5563',
  },
  langTextSelected: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#0055FF',
    fontWeight: '700',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  saveBtn: {
    backgroundColor: '#0055FF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0055FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

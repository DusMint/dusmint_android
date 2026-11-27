import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../state/useAuthStore';

interface LanguageOption {
  code: string;
  nameEn: string;
  nameNative: string;
}

export const TIER2_LANGUAGES: LanguageOption[] = [
  { code: 'en', nameEn: 'English', nameNative: 'English' },
  { code: 'hi', nameEn: 'Hindi', nameNative: 'हिन्दी' },
  { code: 'mr', nameEn: 'Marathi', nameNative: 'मराठी' },
  { code: 'bho', nameEn: 'Bhojpuri', nameNative: 'भोजपुरी' },
  { code: 'gu', nameEn: 'Gujarati', nameNative: 'ગુજરાતી' },
  { code: 'pa', nameEn: 'Punjabi', nameNative: 'ਪੰਜਾਬੀ' },
  { code: 'bn', nameEn: 'Bengali', nameNative: 'বাংলা' },
  { code: 'te', nameEn: 'Telugu', nameNative: 'తెలుగు' },
  { code: 'ta', nameEn: 'Tamil', nameNative: 'தமிழ்' },
  { code: 'kn', nameEn: 'Kannada', nameNative: 'ಕನ್ನಡ' },
  { code: 'ml', nameEn: 'Malayalam', nameNative: 'മലയാളം' },
  { code: 'or', nameEn: 'Odia', nameNative: 'ଓଡ଼ିଆ' },
  { code: 'mwr', nameEn: 'Marwari', nameNative: 'मारवाड़ी' },
  { code: 'hne', nameEn: 'Chhattisgarhi', nameNative: 'छत्तीसगढ़ी' },
  { code: 'as', nameEn: 'Assamese', nameNative: 'অসমীয়া' },
  { code: 'mai', nameEn: 'Maithili', nameNative: 'मैथिली' },
  { code: 'ur', nameEn: 'Urdu', nameNative: 'اردو' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectLanguage?: (lang: LanguageOption) => void;
}

export const LanguageSelectionSheet: React.FC<Props> = ({
  visible,
  onClose,
  onSelectLanguage,
}) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(
    insets.bottom,
    Platform.OS === 'android' ? 24 : 16
  );

  const preferredLanguage = useAuthStore((s) => s.preferredLanguage);
  const setLanguage = useAuthStore((s) => s.setLanguage);

  const [modalVisible, setModalVisible] = useState(visible);
  const [selectedCode, setSelectedCode] = useState(preferredLanguage || 'en');

  const backdropAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      setSelectedCode(preferredLanguage || 'en');
      backdropAnim.setValue(0);
      sheetAnim.setValue(600);
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(sheetAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sheetAnim, {
          toValue: 600,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible, preferredLanguage, backdropAnim, sheetAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetAnim, {
        toValue: 600,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      onClose();
    });
  };

  const handleChoose = (lang: LanguageOption) => {
    setSelectedCode(lang.code);
    if (lang.code === 'en' || lang.code === 'hi' || lang.code === 'mr') {
      setLanguage(lang.code);
    }
    if (onSelectLanguage) {
      onSelectLanguage(lang);
    }
    setTimeout(() => {
      handleClose();
    }, 180);
  };

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.modalRoot}>
        {/* Smooth Animated Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.overlay, { opacity: backdropAnim }]} />
        </TouchableWithoutFeedback>

        {/* Smooth Animated Sheet */}
        <Animated.View
          style={[
            styles.sheetContainer,
            { transform: [{ translateY: sheetAnim }] },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Language</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* Languages List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 16 }]}
          >
            {TIER2_LANGUAGES.map((lang, index) => {
              const isSelected = selectedCode === lang.code;
              const isLast = index === TIER2_LANGUAGES.length - 1;

              return (
                <View key={lang.code}>
                  <TouchableOpacity
                    style={[styles.langRow, isSelected && styles.langRowSelected]}
                    onPress={() => handleChoose(lang)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.langNameContainer}>
                      <Text style={[styles.langEnText, isSelected && styles.langEnTextSelected]}>
                        {lang.nameEn}
                      </Text>
                      <Text style={[styles.langNativeText, isSelected && styles.langNativeTextSelected]}>
                        ({lang.nameNative})
                      </Text>
                    </View>

                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={20} color="#047A36" />
                    ) : (
                      <View style={styles.radioEmpty} />
                    )}
                  </TouchableOpacity>
                  {!isLast && <View style={styles.divider} />}
                </View>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 520,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: '#0F172A',
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderRadius: 8,
  },
  langRowSelected: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  langNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langEnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 15,
    color: '#0F172A',
    marginRight: 6,
  },
  langEnTextSelected: {
    color: '#047A36',
  },
  langNativeText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  langNativeTextSelected: {
    color: '#047A36',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  radioEmpty: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});

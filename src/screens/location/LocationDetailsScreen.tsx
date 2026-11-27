import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StatusBar,
  Alert,
  Modal,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useLocationStore } from '../../state/useLocationStore';
import { useAuthStore } from '../../state/useAuthStore';
import { dusmintApi } from '@dusmint/api-client';
import { deduplicateAddress } from '../../services/locationService';
import { SavedAddressItem } from './data/locationData';

type Props = NativeStackScreenProps<RootStackParamList, any>;

export const LocationDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;

  const user = useAuthStore((s) => s.user);
  const setUserLocation = useLocationStore((s) => s.setUserLocation);

  const locality = route.params?.locality || 'Vijay Nagar';
  const fullAddress =
    route.params?.fullAddress ||
    'Scheme 54, Vijay Nagar, Indore, Madhya Pradesh 452010, India';
  const latitude = route.params?.latitude || 22.7533;
  const longitude = route.params?.longitude || 75.8937;

  // Form Fields
  const [tag, setTag] = useState<'House' | 'Office' | 'Other'>('House');
  const [houseNo, setHouseNo] = useState('');
  const [floorNo, setFloorNo] = useState('');
  const [buildingStreet, setBuildingStreet] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedLabelDisplay, setSavedLabelDisplay] = useState('Home');
  const iconScaleAnim = React.useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Receiver Details
  const [useAccountDetails, setUseAccountDetails] = useState(true);
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');

  // Photos & Instructions

  const accountUserName = user?.fullName || 'DusMint Customer';
  const accountUserPhone = user?.phone ? user.phone.slice(-10) : '9876543210';

  const isFormValid =
    houseNo.trim().length > 0 &&
    floorNo.trim().length > 0 &&
    (useAccountDetails || (receiverName.trim().length > 0 && receiverPhone.trim().length >= 10));

  const handleSaveAddress = () => {
    if (!isFormValid) {
      Alert.alert('Required Fields', 'Please fill in House/Flat Number and Floor Number.');
      return;
    }

    const labelName = tag === 'Other' ? (customTag.trim() || 'Other') : tag;
    setSavedLabelDisplay(labelName);
    setIsSaving(true);

    const constructedAddress = `${houseNo.trim()}, Floor ${floorNo.trim()}${
      buildingStreet.trim() ? ', ' + buildingStreet.trim() : ''
    }, ${fullAddress}`;

    const extractedPincode =
      route.params?.pincode ||
      fullAddress.match(/\b([1-9][0-9]{5})\b/)?.[1] ||
      '';

    const shortAreaAddress = deduplicateAddress(
      buildingStreet.trim()
        ? `${buildingStreet.trim()}, ${locality}`
        : locality || 'Vijay Nagar, Indore'
    );

    const detectedCity = fullAddress.includes('Delhi')
      ? 'Delhi'
      : fullAddress.includes('Indore')
      ? 'Indore'
      : 'Indore';

    const newAddressItem: SavedAddressItem = {
      id: `addr-${Date.now()}`,
      label: (tag === 'House' ? 'Home' : tag === 'Office' ? 'Work' : 'Other') as any,
      name: labelName,
      houseNo: `${houseNo.trim()}, Floor ${floorNo.trim()}`,
      streetArea: deduplicateAddress(buildingStreet.trim() ? `${buildingStreet.trim()}, ${locality}` : locality),
      landmark: buildingStreet.trim() || undefined,
      pincode: extractedPincode,
      distanceKm: '0.2 km',
      latitude,
      longitude,
      isSelected: true,
      isDefault: true,
    };

    // 1. Add to local persistent store immediately so it displays in Saved Addresses!
    useLocationStore.getState().addSavedAddress(newAddressItem);

    // 2. Persist to Backend DB (Supabase / Fastify) asynchronously
    dusmintApi
      .saveAddress({
        label: tag === 'House' ? 'home' : tag === 'Office' ? 'work' : 'other',
        houseNo: `${houseNo.trim()}, Floor ${floorNo.trim()}`,
        buildingName: buildingStreet.trim(),
        streetArea: locality || 'Vijay Nagar, Indore',
        landmark: buildingStreet.trim() || locality,
        latitude,
        longitude,
        pincode: extractedPincode,
        isDefault: true,
      })
      .catch((err) => {
        console.warn('Address backend sync note:', err);
      });

    // 3. Update Active Location in Store - preserving the real locality/street address!
    setUserLocation({
      latitude,
      longitude,
      address: constructedAddress,
      shortAddress: shortAreaAddress,
      locality: locality || 'Vijay Nagar',
      city: detectedCity,
      pincode: extractedPincode,
    });

    useLocationStore.getState().setAddress({
      id: newAddressItem.id,
      userId: '',
      label: (tag === 'House' ? 'home' : tag === 'Office' ? 'work' : 'other') as any,
      houseNo: newAddressItem.houseNo,
      streetArea: newAddressItem.streetArea,
      landmark: newAddressItem.landmark,
      latitude,
      longitude,
      pincode: extractedPincode,
      isDefault: true,
    });

    // 4. Smooth transition from loading to pretty success dialog
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccessModal(true);
      iconScaleAnim.setValue(0.3);
      Animated.spring(iconScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* 1. Clean Header with Back Arrow and Clear Title */}
      <View style={[styles.header, { paddingTop: statusBarHeight + 6 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Enter Address Details
        </Text>
      </View>

      {/* 2. Scrollable Form Content */}
      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* SECTION 1: Location Details */}
        <Text style={styles.sectionHeading}>Location Details</Text>

        <View style={styles.card}>
          {/* Chips Row: House, Office, Other */}
          <View style={styles.tagChipsRow}>
            {(['House', 'Office', 'Other'] as const).map((t) => {
              const isSelected = tag === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.tagChip, isSelected && styles.selectedTagChip]}
                  onPress={() => setTag(t)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={
                      t === 'House'
                        ? 'home-outline'
                        : t === 'Office'
                        ? 'briefcase-outline'
                        : 'navigate-outline'
                    }
                    size={16}
                    color={isSelected ? '#FFFFFF' : '#64748B'}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[styles.tagChipText, isSelected && styles.selectedTagChipText]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* If 'Other' is selected, provide custom label input */}
          {tag === 'Other' && (
            <TextInput
              style={styles.input}
              placeholder="Save address as (e.g. Mom's place, Gym) *"
              placeholderTextColor="#94A3B8"
              value={customTag}
              onChangeText={setCustomTag}
            />
          )}

          {/* Form Inputs with DusMint visual discipline */}
          <TextInput
            style={styles.input}
            placeholder="House / Flat Number *"
            placeholderTextColor="#94A3B8"
            value={houseNo}
            onChangeText={setHouseNo}
          />

          <TextInput
            style={styles.input}
            placeholder="Floor Number *"
            placeholderTextColor="#94A3B8"
            value={floorNo}
            onChangeText={setFloorNo}
          />

          <TextInput
            style={styles.input}
            placeholder="Building / Street (Recommended)"
            placeholderTextColor="#94A3B8"
            value={buildingStreet}
            onChangeText={setBuildingStreet}
          />

          {/* Area / Locality Box with Edit Button */}
          <View style={styles.areaLocalityBox}>
            <View style={styles.areaLeft}>
              <Text style={styles.areaFieldLabel}>AREA / LOCALITY</Text>
              <Text style={styles.areaAddressText} numberOfLines={3}>
                {deduplicateAddress(fullAddress)}
              </Text>
            </View>

            {/* Edit button tile with black outline icon & light green bg */}
            <TouchableOpacity
              style={styles.miniMapTile}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="location-outline" size={20} color="#0F172A" />
              <Text style={styles.miniMapEditLink}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION 2: Receiver Details */}
        <Text style={styles.sectionHeading}>Receiver Details</Text>

        <View style={styles.card}>
          {/* Use my account details checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setUseAccountDetails(!useAccountDetails)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, useAccountDetails && styles.checkboxActive]}>
              {useAccountDetails && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
            </View>
            <View style={styles.checkboxTextContainer}>
              <Text style={styles.checkboxTitle}>Use my account details</Text>
              <Text style={styles.checkboxSubtitle}>
                {accountUserName}, +91 {accountUserPhone}
              </Text>
            </View>
          </TouchableOpacity>

          {/* If unchecking 'Use my account details', show custom receiver fields */}
          {!useAccountDetails && (
            <View style={styles.customReceiverBox}>
              <TextInput
                style={styles.input}
                placeholder="Receiver's Name *"
                placeholderTextColor="#94A3B8"
                value={receiverName}
                onChangeText={setReceiverName}
              />
              <TextInput
                style={[styles.input, { marginBottom: 0 }]}
                placeholder="Receiver's Phone Number *"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                value={receiverPhone}
                onChangeText={setReceiverPhone}
              />
            </View>
          )}
        </View>

        

        
      </ScrollView>

      {/* 3. Bottom Pinned "Save Address" CTA Button */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: isKeyboardVisible
              ? 12
              : Math.max(insets.bottom + 16, 32),
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveBtn, !isFormValid && styles.disabledSaveBtn]}
          onPress={handleSaveAddress}
          disabled={!isFormValid}
          activeOpacity={0.88}
        >
          {isSaving ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Saving Address...</Text>
            </View>
          ) : (
            <Text style={[styles.saveBtnText, !isFormValid && styles.disabledSaveBtnText]}>
              Save Address
            </Text>
          )}
        </TouchableOpacity>
      </View>
    
      {/* Pretty Success Popout Modal matching DusMint Aesthetics */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Animated.View
              style={[
                styles.modalIconCircle,
                { transform: [{ scale: iconScaleAnim }] },
              ]}
            >
              <Ionicons name="checkmark-circle" size={32} color="#047A36" />
            </Animated.View>

            <Text style={styles.modalTitle}>Address Saved</Text>
            <Text style={styles.modalSubtitle}>
              "{savedLabelDisplay}" has been set as your active delivery address.
            </Text>

            <TouchableOpacity
              style={styles.modalActionBtn}
              activeOpacity={0.88}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('MainTabs', { screen: 'HomeTab' });
              }}
            >
              <Text style={styles.modalActionBtnText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitleCol: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  sectionHeading: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 10,
    marginTop: 6,
    letterSpacing: -0.2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tagChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tagChip: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedTagChip: {
    backgroundColor: '#047A36',
    borderColor: '#047A36',
  },
  tagChipText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12.5,
    color: '#64748B',
  },
  selectedTagChipText: {
    color: '#FFFFFF',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13.5,
    color: '#0F172A',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  areaLocalityBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  areaLeft: {
    flex: 1,
    paddingRight: 12,
  },
  areaFieldLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 10.5,
    color: '#64748B',
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  areaAddressText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    lineHeight: 17,
    color: '#334155',
  },
  miniMapTile: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMapEditLink: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    color: '#047A36',
    marginTop: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#047A36',
    borderColor: '#047A36',
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13.5,
    color: '#0F172A',
  },
  checkboxSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  customReceiverBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  scrollArea: {
    flex: 1,
  },
  saveBtn: {
    height: 50,
    backgroundColor: '#047A36',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledSaveBtn: {
    backgroundColor: '#E2E8F0',
  },
  saveBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  disabledSaveBtnText: {
    color: '#94A3B8',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: '#0F172A',
    letterSpacing: -0.3,
    marginTop: 12,
  },
  modalSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  modalActionBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#047A36',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  modalActionBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
});

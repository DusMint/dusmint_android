import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useLocationStore } from '../../state/useLocationStore';
import { useAuthStore } from '../../state/useAuthStore';
import { dusmintApi } from '@dusmint/api-client';
import { deduplicateAddress } from '../../services/locationService';

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

    const constructedAddress = `${houseNo.trim()}, Floor ${floorNo.trim()}${
      buildingStreet.trim() ? ', ' + buildingStreet.trim() : ''
    }, ${fullAddress}`;

    // 1. Persist to Backend DB (Supabase / Fastify)
    dusmintApi
      .saveAddress({
        label: tag === 'House' ? 'home' : tag === 'Office' ? 'work' : 'other',
        houseNo: `${houseNo.trim()}, Floor ${floorNo.trim()}`,
        buildingName: buildingStreet.trim(),
        streetArea: locality || 'Vijay Nagar, Indore',
        landmark: buildingStreet.trim() || locality,
        latitude,
        longitude,
        pincode: '452010',
        isDefault: true,
      })
      .catch((err) => {
        console.warn('Address backend sync note:', err);
      });

    // 2. Update Global Location Store
    setUserLocation({
      latitude,
      longitude,
      address: constructedAddress,
      shortAddress: labelName || locality || 'Vijay Nagar, Indore',
      locality: locality || 'Vijay Nagar',
      city: 'Indore',
    });

    // Alert & navigate back to Home / MainTabs
    Alert.alert(
      'Address Saved',
      `"${labelName}" has been saved as your delivery address.`,
      [
        {
          text: 'Continue Shopping',
          onPress: () => {
            navigation.navigate('MainTabs', { screen: 'HomeTab' });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
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

        

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 3. Bottom Pinned "Save Address" CTA Button */}
      <View style={[styles.bottomBar, { paddingBottom: Platform.OS === 'ios' ? 24 : 14 }]}>
        <TouchableOpacity
          style={[styles.saveBtn, !isFormValid && styles.disabledSaveBtn]}
          onPress={handleSaveAddress}
          disabled={!isFormValid}
          activeOpacity={0.88}
        >
          <Text style={[styles.saveBtnText, !isFormValid && styles.disabledSaveBtnText]}>
            Save Address
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 6,
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
});

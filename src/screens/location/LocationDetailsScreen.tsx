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
import { InstamartColors } from '../../ui/theme/instamartTheme';
import { useLocationStore } from '../../state/useLocationStore';
import { useAuthStore } from '../../state/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, any>;

export const LocationDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;

  const user = useAuthStore((s) => s.user);
  const setUserLocation = useLocationStore((s) => s.setUserLocation);

  const locality = route.params?.locality || 'Monin Pura';
  const fullAddress =
    route.params?.fullAddress ||
    'Khairati Bazar, Monin Pura, Burhanpur, Madhya Pradesh 450331, India';
  const latitude = route.params?.latitude || 22.7533;
  const longitude = route.params?.longitude || 75.8937;

  // Form Fields
  const [tag, setTag] = useState<'House' | 'Office' | 'Other'>('Other');
  const [houseNo, setHouseNo] = useState('');
  const [floorNo, setFloorNo] = useState('');
  const [buildingStreet, setBuildingStreet] = useState('');
  const [useAccountDetails, setUseAccountDetails] = useState(true);
  const [saveAsName, setSaveAsName] = useState('Home');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [instructions, setInstructions] = useState('');

  const accountUserName = user?.fullName || 'Sarthak Gupta';
  const accountUserPhone = user?.phone || '7999876210';

  const isFormValid = houseNo.trim().length > 0 && floorNo.trim().length > 0;

  const handleSaveAddress = () => {
    if (!isFormValid) {
      Alert.alert('Required Fields', 'Please fill in House/Flat Number and Floor Number.');
      return;
    }

    const constructedAddress = `${houseNo.trim()}, Floor ${floorNo.trim()}${
      buildingStreet.trim() ? ', ' + buildingStreet.trim() : ''
    }, ${fullAddress}`;

    // Update Global Location Store
    setUserLocation({
      latitude,
      longitude,
      address: constructedAddress,
      shortAddress: saveAsName.trim() || locality,
      locality,
      city: 'Burhanpur',
    });

    // Alert & navigate back to Home / MainTabs
    Alert.alert(
      'Address Saved',
      `"${saveAsName}" has been saved as your delivery address.`,
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

      {/* 1. Header with Back Arrow and Locality Title */}
      <View style={[styles.header, { paddingTop: statusBarHeight + 6 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={InstamartColors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {locality}
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
                  onPress={() => {
                    setTag(t);
                    setSaveAsName(t);
                  }}
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
                    color={isSelected ? '#FFFFFF' : '#444444'}
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

          {/* Form Inputs */}
          <TextInput
            style={styles.input}
            placeholder="House / Flat Number *"
            placeholderTextColor="#888888"
            value={houseNo}
            onChangeText={setHouseNo}
          />

          <TextInput
            style={styles.input}
            placeholder="Floor Number *"
            placeholderTextColor="#888888"
            value={floorNo}
            onChangeText={setFloorNo}
          />

          <TextInput
            style={styles.input}
            placeholder="Building / Street (Recommended)"
            placeholderTextColor="#888888"
            value={buildingStreet}
            onChangeText={setBuildingStreet}
          />

          {/* Area / Locality Box with Mini-Map & Edit Button */}
          <View style={styles.areaLocalityBox}>
            <View style={styles.areaLeft}>
              <Text style={styles.areaFieldLabel}>Area/Locality</Text>
              <Text style={styles.areaAddressText} numberOfLines={3}>
                {fullAddress}
              </Text>
            </View>

            {/* Mini Map Preview Tile with Edit button */}
            <TouchableOpacity
              style={styles.miniMapTile}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="location-sharp" size={20} color="#0055FF" />
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
                {accountUserName}, {accountUserPhone}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Save address as input */}
          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            placeholder="Save address as *"
            placeholderTextColor="#888888"
            value={saveAsName}
            onChangeText={setSaveAsName}
          />
        </View>

        {/* SECTION 3: Photos and Instructions */}
        <View style={styles.photoHeadingRow}>
          <Text style={styles.sectionHeadingNoMargin}>Photos and Instructions</Text>
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedBadgeText}>RECOMMENDED</Text>
          </View>
        </View>

        {/* Upload photo box */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => {
            setHasPhoto(!hasPhoto);
            Alert.alert('Photo Upload', 'Door/building photo selected.');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.actionCardText}>
            Upload door/building photos to help us deliver faster and reduce calls
          </Text>
          <View style={[styles.dashedIconBox, hasPhoto && styles.activeDashedBox]}>
            <Ionicons
              name={hasPhoto ? 'checkmark-circle' : 'camera-outline'}
              size={20}
              color={hasPhoto ? '#1B9A5B' : '#0055FF'}
            />
          </View>
        </TouchableOpacity>

        {/* Instructions box */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => {
            Alert.prompt
              ? Alert.prompt(
                  'Instructions',
                  'e.g. Ring bell twice, leave with guard',
                  (txt) => setInstructions(txt)
                )
              : setInstructions('Leave at door');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.actionCardText}>
            {instructions ? `Note: ${instructions}` : 'Instructions to reach location'}
          </Text>
          <Text style={styles.addLinkText}>{instructions ? 'Edit' : 'Add'}</Text>
        </TouchableOpacity>

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
    backgroundColor: '#F7F8FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeading: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: InstamartColors.ink,
    marginBottom: 10,
    marginTop: 6,
  },
  sectionHeadingNoMargin: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  tagChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tagChip: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F6F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EAEF',
  },
  selectedTagChip: {
    backgroundColor: '#000000', // Instamart black selected pill
    borderColor: '#000000',
  },
  tagChipText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#444444',
  },
  selectedTagChipText: {
    color: '#FFFFFF',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E1E4EA',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: InstamartColors.ink,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  areaLocalityBox: {
    borderWidth: 1,
    borderColor: '#E1E4EA',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  areaLeft: {
    flex: 1,
    paddingRight: 10,
  },
  areaFieldLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#888888',
    marginBottom: 2,
  },
  areaAddressText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 17,
    color: '#555555',
  },
  miniMapTile: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#EAEFF8',
    borderWidth: 1,
    borderColor: '#D2DEF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMapEditLink: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#0055FF',
    marginTop: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#BBBBBB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: '#0055FF',
    borderColor: '#0055FF',
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: InstamartColors.ink,
  },
  checkboxSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#666666',
    marginTop: 1,
  },
  photoHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    marginTop: 4,
  },
  recommendedBadge: {
    borderWidth: 1,
    borderColor: '#0055FF',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  recommendedBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#0055FF',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  actionCardText: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    lineHeight: 17,
    color: '#444444',
    paddingRight: 12,
  },
  dashedIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#0055FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDashedBox: {
    borderColor: '#1B9A5B',
    backgroundColor: '#E4F7F1',
  },
  addLinkText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#0055FF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 4,
  },
  saveBtn: {
    height: 48,
    backgroundColor: '#0055FF', // Instamart bright blue
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledSaveBtn: {
    backgroundColor: '#E0E0E0',
  },
  saveBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabledSaveBtnText: {
    color: '#999999',
  },
});


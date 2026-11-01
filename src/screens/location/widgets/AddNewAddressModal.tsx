import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SavedAddressItem } from '../data/locationData';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (address: SavedAddressItem) => void;
}

export const AddNewAddressModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [houseNo, setHouseNo] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('452010');
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');

  const handleSave = () => {
    if (!houseNo.trim()) {
      Alert.alert('Required', 'Please enter Flat / House / Floor number.');
      return;
    }
    if (!streetArea.trim()) {
      Alert.alert('Required', 'Please enter Area / Street name.');
      return;
    }

    const newAddress: SavedAddressItem = {
      id: `addr-${Date.now()}`,
      label,
      name: label === 'Other' ? 'Other' : label,
      houseNo: houseNo.trim(),
      streetArea: streetArea.trim(),
      landmark: landmark.trim() || undefined,
      pincode: pincode.trim() || '452010',
      distanceKm: '0.5 km',
      latitude: 22.7533,
      longitude: 75.8937,
      isSelected: true,
      isDefault: false,
    };

    onSave(newAddress);
    // Reset inputs
    setHouseNo('');
    setStreetArea('');
    setLandmark('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.header}>
                <Text style={styles.title}>Add Delivery Address</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={22} color={InstamartColors.ink} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Address Label Chips */}
                <Text style={styles.inputLabel}>Save address as</Text>
                <View style={styles.labelChipsRow}>
                  {(['Home', 'Work', 'Other'] as const).map((l) => {
                    const isSelected = label === l;
                    return (
                      <TouchableOpacity
                        key={l}
                        style={[styles.chip, isSelected && styles.selectedChip]}
                        onPress={() => setLabel(l)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={
                            l === 'Home'
                              ? 'home-outline'
                              : l === 'Work'
                              ? 'briefcase-outline'
                              : 'location-outline'
                          }
                          size={15}
                          color={isSelected ? '#FFFFFF' : '#444444'}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.selectedChipText,
                          ]}
                        >
                          {l}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Flat / House */}
                <Text style={styles.inputLabel}>House / Flat / Floor No. *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Flat 302, Royal Residency"
                  value={houseNo}
                  onChangeText={setHouseNo}
                />

                {/* Area / Street */}
                <Text style={styles.inputLabel}>Area / Sector / Street *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Vijay Nagar, Scheme 54"
                  value={streetArea}
                  onChangeText={setStreetArea}
                />

                {/* Landmark */}
                <Text style={styles.inputLabel}>Nearby Landmark (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Near Sayaji Hotel"
                  value={landmark}
                  onChangeText={setLandmark}
                />

                {/* Pincode */}
                <Text style={styles.inputLabel}>Pincode</Text>
                <TextInput
                  style={styles.input}
                  placeholder="452010"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={pincode}
                  onChangeText={setPincode}
                />

                {/* Save Button */}
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                  <Text style={styles.saveBtnText}>Save and Deliver Here</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: '82%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: InstamartColors.ink,
  },
  inputLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#444444',
    marginTop: 10,
    marginBottom: 6,
  },
  labelChipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedChip: {
    backgroundColor: InstamartColors.accentBlue,
    borderColor: InstamartColors.accentBlue,
  },
  chipText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#444444',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#D9D9E6',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
  },
  saveBtn: {
    height: 48,
    backgroundColor: InstamartColors.accentBlue,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  saveBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});

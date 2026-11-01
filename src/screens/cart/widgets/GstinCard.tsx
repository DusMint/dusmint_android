import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  gstin: string | null;
  onSaveGstin: (val: string | null) => void;
}

export const GstinCard: React.FC<Props> = ({ gstin, onSaveGstin }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputVal, setInputVal] = useState(gstin || '');

  const handleSave = () => {
    const trimmed = inputVal.trim().toUpperCase();
    if (trimmed.length !== 15) {
      Alert.alert('Invalid GSTIN', 'Please enter a valid 15-character alphanumeric GSTIN number.');
      return;
    }
    onSaveGstin(trimmed);
    setModalVisible(false);
  };

  const handleRemove = () => {
    onSaveGstin(null);
    setInputVal('');
    setModalVisible(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Ionicons name="document-text-outline" size={20} color={InstamartColors.accentBlue} />
        </View>

        <View style={styles.textColumn}>
          <Text style={styles.title}>
            {gstin ? `GSTIN: ${gstin}` : 'Add GSTIN'}
          </Text>
          <Text style={styles.subtitle}>
            {gstin ? 'GST invoice will be sent on email' : 'Claim GST credit up to 18% on the order'}
          </Text>
        </View>

        <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.7}>
          <Text style={styles.actionText}>{gstin ? 'Edit' : 'Add'}</Text>
        </TouchableOpacity>
      </View>

      {/* GSTIN Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Enter GSTIN</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={22} color={InstamartColors.ink} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>15-character GST Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 23AAAAA0000A1Z5"
                  autoCapitalize="characters"
                  maxLength={15}
                  value={inputVal}
                  onChangeText={setInputVal}
                />

                <View style={styles.modalBtnsRow}>
                  {gstin && (
                    <TouchableOpacity style={styles.removeBtn} onPress={handleRemove} activeOpacity={0.8}>
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
                    <Text style={styles.saveBtnText}>Save GSTIN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 12,
    marginTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E3EEFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textColumn: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#666666',
    marginTop: 2,
  },
  actionText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: InstamartColors.accentBlue,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: InstamartColors.ink,
  },
  inputLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#555555',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D9D9E6',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    letterSpacing: 1,
  },
  modalBtnsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  removeBtn: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#D32F2F',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#D32F2F',
  },
  saveBtn: {
    flex: 2,
    height: 46,
    backgroundColor: InstamartColors.accentBlue,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});

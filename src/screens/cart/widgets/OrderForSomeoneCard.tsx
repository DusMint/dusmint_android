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
import { ReceiverDetails } from '../data/cartData';

interface Props {
  receiver: ReceiverDetails | null;
  onSaveReceiver: (details: ReceiverDetails | null) => void;
}

export const OrderForSomeoneCard: React.FC<Props> = ({
  receiver,
  onSaveReceiver,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState(receiver?.name || '');
  const [phone, setPhone] = useState(receiver?.phone || '');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter receiver name.');
      return;
    }
    if (phone.trim().length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    onSaveReceiver({ name: name.trim(), phone: phone.trim() });
    setModalVisible(false);
  };

  const handleRemove = () => {
    onSaveReceiver(null);
    setName('');
    setPhone('');
    setModalVisible(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Ionicons name="person-circle-outline" size={20} color="#555555" style={{ marginRight: 8 }} />
          {receiver ? (
            <Text style={styles.savedText} numberOfLines={1}>
              Receiver: <Text style={styles.savedHighlight}>{receiver.name}</Text> ({receiver.phone})
            </Text>
          ) : (
            <Text style={styles.title}>Ordering for someone else?</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>
            {receiver ? 'EDIT' : 'ADD DETAILS'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Receiver Details Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Receiver Details</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={22} color={InstamartColors.ink} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Receiver Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Ramesh Sharma"
                  value={name}
                  onChangeText={setName}
                />

                <Text style={styles.inputLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10 digit number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />

                <View style={styles.modalBtnsRow}>
                  {receiver && (
                    <TouchableOpacity style={styles.removeBtn} onPress={handleRemove} activeOpacity={0.8}>
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
                    <Text style={styles.saveBtnText}>Save Details</Text>
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
    padding: 16,
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
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: InstamartColors.ink,
  },
  savedText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#444444',
  },
  savedHighlight: {
    fontFamily: 'Poppins_700Bold',
    color: InstamartColors.ink,
  },
  actionText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
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
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D9D9E6',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
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


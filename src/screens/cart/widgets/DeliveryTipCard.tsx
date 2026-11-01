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
  selectedTip: number;
  onSelectTip: (tip: number) => void;
}

const TIP_OPTIONS = [10, 20, 30];

export const DeliveryTipCard: React.FC<Props> = ({
  selectedTip,
  onSelectTip,
}) => {
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const handleChipPress = (amount: number) => {
    if (selectedTip === amount) {
      onSelectTip(0); // Deselect
    } else {
      onSelectTip(amount);
    }
  };

  const handleCustomSubmit = () => {
    const val = parseInt(customAmount, 10);
    if (isNaN(val) || val <= 0 || val > 500) {
      Alert.alert('Invalid Tip', 'Please enter an amount between ₹1 and ₹500.');
      return;
    }
    onSelectTip(val);
    setCustomModalVisible(false);
    setCustomAmount('');
  };

  const isCustomSelected =
    selectedTip > 0 && !TIP_OPTIONS.includes(selectedTip);

  return (
    <View style={styles.card}>
      {/* Caption & Info */}
      <View style={styles.header}>
        <Text style={styles.caption}>DELIVERY TIP</Text>
        <Ionicons name="information-circle-outline" size={16} color="#888888" />
      </View>

      {/* Message and Illustration slot */}
      <View style={styles.messageRow}>
        <Text style={styles.messageText}>
          A small tip, a big gesture! Tip your delivery partner to show your appreciation for their hard work.
        </Text>
        <View style={styles.illustrationSlot}>
          <Ionicons name="heart" size={26} color="#FF6B6B" />
        </View>
      </View>

      {/* 4 Equal Tip Chips */}
      <View style={styles.chipsRow}>
        {TIP_OPTIONS.map((amount) => {
          const isSelected = selectedTip === amount;
          const isPopular = amount === 20;

          return (
            <TouchableOpacity
              key={amount}
              style={[styles.chip, isSelected && styles.selectedChip]}
              onPress={() => handleChipPress(amount)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                ₹{amount}
              </Text>

              {isPopular && (
                <View style={styles.popularRibbon}>
                  <Text style={styles.popularRibbonText}>Most tipped</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Other Chip */}
        <TouchableOpacity
          style={[styles.chip, isCustomSelected && styles.selectedChip]}
          onPress={() => setCustomModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.chipText, isCustomSelected && styles.selectedChipText]}>
            {isCustomSelected ? `₹${selectedTip}` : 'Other'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom Amount Modal */}
      <Modal visible={customModalVisible} transparent animationType="fade" onRequestClose={() => setCustomModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setCustomModalVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Enter Delivery Tip</Text>
                <Text style={styles.modalSubtitle}>100% of this tip goes directly to your delivery partner.</Text>

                <View style={styles.inputRow}>
                  <Text style={styles.rupeeSign}>₹</Text>
                  <TextInput
                    style={styles.tipInput}
                    placeholder="50"
                    keyboardType="number-pad"
                    maxLength={3}
                    value={customAmount}
                    onChangeText={setCustomAmount}
                    autoFocus
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setCustomModalVisible(false)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={handleCustomSubmit}
                  >
                    <Text style={styles.applyBtnText}>Add Tip</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  caption: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#777777',
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  messageText: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 17,
    color: '#555555',
    marginRight: 10,
  },
  illustrationSlot: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9D9E6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  selectedChip: {
    borderWidth: 2,
    borderColor: '#222222',
  },
  chipText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  selectedChipText: {
    color: InstamartColors.accentBlue,
  },
  popularRibbon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: InstamartColors.accentBlue,
    paddingVertical: 1,
    alignItems: 'center',
  },
  popularRibbonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: InstamartColors.ink,
  },
  modalSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: InstamartColors.accentBlue,
    borderRadius: 10,
    paddingHorizontal: 16,
    width: 140,
    height: 48,
    justifyContent: 'center',
  },
  rupeeSign: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: InstamartColors.ink,
    marginRight: 6,
  },
  tipInput: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 22,
    color: InstamartColors.ink,
    width: 60,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#D9D9E6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#666666',
  },
  applyBtn: {
    flex: 1,
    height: 44,
    backgroundColor: InstamartColors.accentBlue,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});


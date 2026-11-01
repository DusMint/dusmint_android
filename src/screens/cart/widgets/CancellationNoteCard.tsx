import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

export const CancellationNoteCard: React.FC = () => {
  const handleReadPolicy = () => {
    Alert.alert(
      'Cancellation Policy',
      'Because fresh mandi products and groceries are procured and packed immediately to ensure 10-minute delivery, orders cannot be cancelled once packed. For any damaged or missing items, our 48-hour instant refund policy protects your purchase.'
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.noteText}>
        <Text style={styles.noteLabel}>NOTE: </Text>
        Orders cannot be cancelled and are non-refundable once packed for delivery.
      </Text>

      <TouchableOpacity
        onPress={handleReadPolicy}
        activeOpacity={0.7}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>Read cancellation policy</Text>
      </TouchableOpacity>
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
  noteText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#444444',
  },
  noteLabel: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: '#C0392B',
  },
  linkContainer: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  linkText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: InstamartColors.accentBlue,
  },
});


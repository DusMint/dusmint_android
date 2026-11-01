import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BillSummary } from '../data/cartData';

interface Props {
  bill: BillSummary;
}

export const SavingsBanner: React.FC<Props> = ({ bill }) => {
  const savingsRupees = (bill.savingsPaise / 100).toFixed(0);
  const neededRupees = (bill.amountNeededForFreeDeliveryPaise / 100).toFixed(0);

  if (bill.isFreeDelivery && bill.savingsPaise <= 0) {
    return null;
  }

  let message = '';
  if (bill.isFreeDelivery) {
    message = 'You unlocked FREE DELIVERY on this order!';
  } else if (bill.savingsPaise > 0) {
    message = `₹${savingsRupees} saved! Add items worth ₹${neededRupees} to get FREE DELIVERY`;
  } else {
    message = `Add items worth ₹${neededRupees} to get FREE DELIVERY`;
  }

  return (
    <View style={styles.banner}>
      <Ionicons name="sparkles" size={13} color="#0E7A47" style={{ marginRight: 6 }} />
      <Text style={styles.text} numberOfLines={1}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#D8F5E6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
    color: '#0E7A47',
  },
});


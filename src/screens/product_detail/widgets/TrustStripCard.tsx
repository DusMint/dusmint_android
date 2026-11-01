import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

export const TrustStripCard: React.FC = () => {
  return (
    <View style={styles.card}>
      {/* 1. Refund */}
      <View style={styles.col}>
        <Ionicons name="refresh-circle-outline" size={20} color={InstamartColors.accentBlue} />
        <Text style={styles.boldText}>48 Hours</Text>
        <Text style={styles.greyText}>Refund*</Text>
      </View>

      <View style={styles.divider} />

      {/* 2. Delivery */}
      <View style={styles.col}>
        <Ionicons name="bicycle-outline" size={20} color="#1B9A5B" />
        <Text style={styles.boldText}>Fast</Text>
        <Text style={styles.greyText}>Delivery</Text>
      </View>

      <View style={styles.divider} />

      {/* 3. Support */}
      <View style={styles.col}>
        <Ionicons name="headset-outline" size={20} color="#F77B1B" />
        <Text style={styles.boldText}>24/7</Text>
        <Text style={styles.greyText}>Support</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boldText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: InstamartColors.ink,
    marginTop: 4,
  },
  greyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#777777',
  },
  divider: {
    width: 1,
    height: 38,
    backgroundColor: '#EEEEEE',
  },
});


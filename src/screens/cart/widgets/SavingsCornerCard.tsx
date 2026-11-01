import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  onPress: () => void;
}

export const SavingsCornerCard: React.FC<Props> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.caption}>SAVINGS CORNER</Text>

      <View style={styles.contentRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="pricetag" size={18} color={InstamartColors.accentBlue} />
        </View>

        <View style={styles.textColumn}>
          <Text style={styles.offerMessage}>
            Apply coupon <Text style={styles.couponCode}>MANDI9</Text> to get flat ₹9 OFF
          </Text>
          <Text style={styles.viewCouponsLink}>View all coupons &amp; offers &gt;</Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#999999" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 12,
    marginTop: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  caption: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#777777',
    fontWeight: '600',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3EEFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
  },
  offerMessage: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: InstamartColors.ink,
    lineHeight: 18,
  },
  couponCode: {
    color: InstamartColors.accentBlue,
    fontWeight: '700',
  },
  viewCouponsLink: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#666666',
    marginTop: 4,
  },
});


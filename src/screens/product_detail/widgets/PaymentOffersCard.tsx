import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { ProductOffer } from '../data/productDetailData';

interface Props {
  offers: ProductOffer[];
  onOffersPress: () => void;
}

export const PaymentOffersCard: React.FC<Props> = ({ offers, onOffersPress }) => {
  if (!offers || offers.length === 0) return null;
  const firstOffer = offers[0];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onOffersPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Payment Offers</Text>
        <Ionicons name="chevron-forward" size={14} color="#777777" />
      </View>

      <View style={styles.offerRow}>
        <View style={styles.offerIconCircle}>
          <Ionicons name="pricetag" size={12} color="#FFFFFF" />
        </View>
        <View style={styles.offerTextContainer}>
          <Text style={styles.offerTitle}>{firstOffer.title}</Text>
          <Text style={styles.offerDesc} numberOfLines={1}>
            {firstOffer.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#555555',
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: InstamartColors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  offerTextContainer: {
    flex: 1,
  },
  offerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  offerDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#666666',
  },
});


import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { PastOrder } from '../data/profileData';

interface Props {
  order: PastOrder;
  onReorder: (order: PastOrder) => void;
  onViewDetails: (order: PastOrder) => void;
}

export const OrderHistoryCard: React.FC<Props> = ({
  order,
  onReorder,
  onViewDetails,
}) => {
  const isDelivered = order.status === 'Delivered';
  const isOutForDelivery = order.status === 'Out for Delivery';
  const isPacking = order.status === 'Packing';
  const totalRupees = Math.round(order.totalPaise / 100);

  let chipBg = '#E4F7F1';
  let chipColor = '#1B9A5B';

  if (isOutForDelivery) {
    chipBg = '#E3EEFB';
    chipColor = '#0066FF';
  } else if (isPacking) {
    chipBg = '#FFF8E1';
    chipColor = '#E65100';
  } else if (!isDelivered) {
    chipBg = '#FDECEA';
    chipColor = '#D32F2F';
  }

  return (
    <View style={styles.card}>
      {/* Row 1: Store info + Status chip */}
      <View style={styles.row1}>
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{order.storeName}</Text>
          <Text style={styles.storeMeta} numberOfLines={1}>
            {order.address} · {order.dateTime}
          </Text>
        </View>

        <View style={[styles.statusChip, { backgroundColor: chipBg }]}>
          <Text style={[styles.statusText, { color: chipColor }]}>
            {order.status}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Row 2: Items summary + Total amount */}
      <View style={styles.row2}>
        <Text style={styles.itemsSummary} numberOfLines={2}>
          {order.itemsSummary}
        </Text>
        <Text style={styles.totalPrice}>₹{totalRupees}</Text>
      </View>

      {/* Buttons Row */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={styles.reorderBtn}
          onPress={() => onReorder(order)}
          activeOpacity={0.8}
        >
          <Text style={styles.reorderBtnText}>REORDER</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => onViewDetails(order)}
          activeOpacity={0.8}
        >
          <Text style={styles.detailsBtnText}>VIEW DETAILS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E4EA',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeInfo: {
    flex: 1,
    marginRight: 8,
  },
  storeName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  storeMeta: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#777777',
    marginTop: 2,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: 10,
  },
  row2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemsSummary: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#444444',
    marginRight: 12,
    lineHeight: 18,
  },
  totalPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  reorderBtn: {
    flex: 1,
    height: 38,
    borderWidth: 1.5,
    borderColor: '#0066FF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  reorderBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#0066FF',
  },
  detailsBtn: {
    flex: 1,
    height: 38,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#333333',
  },
});

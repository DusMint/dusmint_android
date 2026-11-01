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
  const totalRupees = (order.totalPaise / 100).toFixed(0);

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

        <View
          style={[
            styles.statusChip,
            {
              backgroundColor: isDelivered ? '#E4F7F1' : '#FDECEA',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: isDelivered ? '#1B9A5B' : '#D32F2F',
              },
            ]}
          >
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
    alignItems: 'flex-start',
  },
  storeInfo: {
    flex: 1,
    marginRight: 10,
  },
  storeName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  storeMeta: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
  },
  statusChip: {
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  statusText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10,
  },
  row2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemsSummary: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#444444',
    lineHeight: 16,
    marginRight: 12,
  },
  totalPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  reorderBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: InstamartColors.accentBlue,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: InstamartColors.accentBlue,
  },
  detailsBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D9D9E6',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
  },
});


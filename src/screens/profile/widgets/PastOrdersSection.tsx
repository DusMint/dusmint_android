import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { PastOrder } from '../data/profileData';
import { OrderHistoryCard } from './OrderHistoryCard';

interface Props {
  orders: PastOrder[];
  onReorder: (order: PastOrder) => void;
  onViewDetails: (order: PastOrder) => void;
  onStartShopping: () => void;
}

export const PastOrdersSection: React.FC<Props> = ({
  orders,
  onReorder,
  onViewDetails,
  onStartShopping,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>PAST ORDERS</Text>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="receipt-outline" size={32} color="#8FB6E8" />
          </View>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            When you place orders, they will appear here.
          </Text>
          <TouchableOpacity
            style={styles.startShoppingBtn}
            onPress={onStartShopping}
            activeOpacity={0.8}
          >
            <Text style={styles.startShoppingBtnText}>Start shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        orders.map((order) => (
          <OrderHistoryCard
            key={order.id}
            order={order}
            onReorder={onReorder}
            onViewDetails={onViewDetails}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 22,
  },
  heading: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    letterSpacing: 0.4,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E4EA',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3EEFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: InstamartColors.ink,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 16,
  },
  startShoppingBtn: {
    backgroundColor: InstamartColors.accentBlue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  startShoppingBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});


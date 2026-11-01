import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CartItem } from '../../../state/useCartStore';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { CartItemRow } from './CartItemRow';

interface Props {
  items: CartItem[];
  deliveryMins?: string;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onMoveToWishlist: (id: string, name: string) => void;
  onAddMoreItems: () => void;
}

export const CartItemsCard: React.FC<Props> = ({
  items,
  deliveryMins = '10 Mins',
  onIncrement,
  onDecrement,
  onMoveToWishlist,
  onAddMoreItems,
}) => {
  const totalCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.etaText}>{deliveryMins}</Text>
          <View style={styles.superfastChip}>
            <Text style={styles.superfastText}>Superfast</Text>
          </View>
        </View>

        <Text style={styles.itemCountText}>
          {totalCount} {totalCount === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {/* Cart Items List */}
      {items.map((cartItem) => (
        <CartItemRow
          key={cartItem.item.id}
          cartItem={cartItem}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          onMoveToWishlist={onMoveToWishlist}
        />
      ))}

      {/* Footer Text */}
      <View style={styles.footerRow}>
        <Text style={styles.footerNormal}>Forgot something? </Text>
        <TouchableOpacity onPress={onAddMoreItems} activeOpacity={0.7}>
          <Text style={styles.footerLink}>Add more items</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  etaText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  superfastChip: {
    backgroundColor: '#E4F7F1',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  superfastText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    fontWeight: '700',
    color: '#0E7A47',
  },
  itemCountText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#666666',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8F8F8',
  },
  footerNormal: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#444444',
  },
  footerLink: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: InstamartColors.accentBlue,
  },
});


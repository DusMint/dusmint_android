import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CartItem } from '../../../state/useCartStore';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { CartItemRow } from './CartItemRow';

interface Props {
  items: CartItem[];
  deliveryMins?: string;
  vendorName?: string;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onMoveToWishlist: (id: string, name: string) => void;
  onAddMoreItems: () => void;
}

export const CartItemsCard: React.FC<Props> = ({
  items,
  vendorName,
  onIncrement,
  onDecrement,
  onMoveToWishlist,
  onAddMoreItems,
}) => {
  const totalCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <View style={styles.card}>
      {/* Store Header if available (Zomato Multi-Vendor Model) */}
      {vendorName ? (
        <View style={styles.storeHeader}>
          <Text style={styles.storeSubLabel}>ORDERING FROM</Text>
          <Text style={styles.storeTitle} numberOfLines={1}>
            {vendorName}
          </Text>
        </View>
      ) : null}

      {/* Header Row */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Items in Cart</Text>
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
  storeHeader: {
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  storeSubLabel: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-Medium',
    letterSpacing: 0.8,
    color: '#888888',
    marginBottom: 2,
  },
  storeTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: InstamartColors.ink,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  itemCountText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#64748B',
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
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#444444',
  },
  footerLink: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12.5,
    color: '#047A36',
  },
});

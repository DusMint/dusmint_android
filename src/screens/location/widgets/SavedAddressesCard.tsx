import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SavedAddressItem } from '../data/locationData';
import { SavedAddressRow } from './SavedAddressRow';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  addresses: SavedAddressItem[];
  onSelect: (address: SavedAddressItem) => void;
  onOpenMenu: (address: SavedAddressItem) => void;
  onAddNewAddress: () => void;
}

export const SavedAddressesCard: React.FC<Props> = ({
  addresses,
  onSelect,
  onOpenMenu,
  onAddNewAddress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (addresses.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.caption}>SAVED ADDRESSES</Text>
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="location-outline" size={32} color="#8FB6E8" />
          </View>
          <Text style={styles.emptyTitle}>No saved addresses yet</Text>
          <Text style={styles.emptySubtitle}>
            Save your home, office, or other locations for instant 10-minute delivery.
          </Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={onAddNewAddress}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>Add New Address</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const displayedAddresses = isExpanded ? addresses : addresses.slice(0, 4);
  const hasMore = addresses.length > 4;

  return (
    <View style={styles.container}>
      <Text style={styles.caption}>SAVED ADDRESSES</Text>

      <View style={styles.card}>
        {displayedAddresses.map((addr, index) => (
          <SavedAddressRow
            key={addr.id}
            address={addr}
            isLast={index === displayedAddresses.length - 1 && !hasMore}
            onSelect={onSelect}
            onOpenMenu={onOpenMenu}
          />
        ))}

        {hasMore && (
          <TouchableOpacity
            style={styles.viewMoreRow}
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewMoreText}>
              {isExpanded ? 'View less' : `View all (${addresses.length})`}
            </Text>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={15}
              color={InstamartColors.accentBlue}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  caption: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#777777',
    fontWeight: '600',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  viewMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    gap: 4,
  },
  viewMoreText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: InstamartColors.accentBlue,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
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
    color: InstamartColors.ink,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  addBtn: {
    backgroundColor: InstamartColors.accentBlue,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  addBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});

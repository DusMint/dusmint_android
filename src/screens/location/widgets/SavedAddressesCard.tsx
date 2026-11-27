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
            <Ionicons name="location-outline" size={30} color="#0F172A" />
          </View>
          <Text style={styles.emptyTitle}>No saved addresses yet</Text>
          <Text style={styles.emptySubtitle}>
            Add a delivery address to get started.
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
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#777777',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
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
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#047A36',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  addBtn: {
    backgroundColor: '#047A36',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 22,
  },
  addBtnText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#FFFFFF',
  },
});


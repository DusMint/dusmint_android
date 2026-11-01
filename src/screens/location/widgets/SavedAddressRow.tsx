import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SavedAddressItem } from '../data/locationData';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  address: SavedAddressItem;
  isLast: boolean;
  onSelect: (address: SavedAddressItem) => void;
  onOpenMenu: (address: SavedAddressItem) => void;
}

export const SavedAddressRow: React.FC<Props> = ({
  address,
  isLast,
  onSelect,
  onOpenMenu,
}) => {
  const getIconName = () => {
    switch (address.label) {
      case 'Home':
        return 'home-outline';
      case 'Work':
        return 'briefcase-outline';
      default:
        return 'location-outline';
    }
  };

  const fullAddressString = `${address.houseNo}, ${address.streetArea}${
    address.landmark ? ', ' + address.landmark : ''
  }, Indore - ${address.pincode}`;

  return (
    <View style={[styles.container, !isLast && styles.bottomDivider]}>
      {/* 1. Left Tile: Icon + Distance */}
      <View style={styles.leftTile}>
        <Ionicons name={getIconName()} size={19} color="#333333" />
        <Text style={styles.distanceText}>{address.distanceKm || '--'}</Text>
      </View>

      {/* 2. Middle Content (Tappable to select) */}
      <TouchableOpacity
        style={styles.middleContent}
        onPress={() => onSelect(address)}
        activeOpacity={0.7}
      >
        <View style={styles.titleRow}>
          <Text style={styles.name}>{address.name}</Text>
          {address.isSelected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>SELECTED</Text>
            </View>
          )}
        </View>

        <Text style={styles.addressText} numberOfLines={3}>
          {fullAddressString}
        </Text>
      </TouchableOpacity>

      {/* 3. Right: 3-dot Menu */}
      <TouchableOpacity
        style={styles.moreBtn}
        onPress={() => onOpenMenu(address)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="ellipsis-vertical" size={18} color="#777777" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    gap: 12,
  },
  bottomDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  leftTile: {
    width: 44,
    backgroundColor: '#F1F2F6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 6,
  },
  distanceText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    color: '#666666',
    marginTop: 4,
  },
  middleContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  selectedBadge: {
    backgroundColor: '#DDF5E8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  selectedBadgeText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 9,
    fontWeight: '800',
    color: '#0E7A47',
    letterSpacing: 0.3,
  },
  addressText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#555555',
    marginTop: 3,
  },
  moreBtn: {
    padding: 4,
    marginTop: 2,
  },
});


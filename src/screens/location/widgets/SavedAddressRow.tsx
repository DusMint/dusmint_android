import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SavedAddressItem } from '../data/locationData';
import { deduplicateAddress } from '../../../services/locationService';

interface Props {
  address: SavedAddressItem;
  isLast: boolean;
  onSelect: (address: SavedAddressItem) => void;
  onEdit?: (address: SavedAddressItem) => void;
  onSetDefault?: (address: SavedAddressItem) => void;
  onDelete?: (address: SavedAddressItem) => void;
}

export const SavedAddressRow: React.FC<Props> = ({
  address,
  isLast,
  onSelect,
  onEdit,
  onSetDefault,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const moreBtnRef = useRef<View>(null);

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

  // Sanitize erroneous 452010 pincode if address is clearly located in Delhi
  const isDelhi =
    (address.streetArea && address.streetArea.toLowerCase().includes('delhi')) ||
    (address.houseNo && address.houseNo.toLowerCase().includes('delhi'));
  
  const validPincode =
    isDelhi && address.pincode === '452010'
      ? address.streetArea.match(/\b([1-9][0-9]{5})\b/)?.[1] || ''
      : address.pincode;

  const formattedParts = [
    address.houseNo,
    address.streetArea,
    address.landmark && !address.streetArea.includes(address.landmark) ? address.landmark : null,
    validPincode || null,
  ].filter(Boolean).join(', ');
  const fullAddressString = deduplicateAddress(formattedParts);

  const handleOpenMenu = () => {
    moreBtnRef.current?.measureInWindow((x, y, width, height) => {
      const windowWidth = Dimensions.get('window').width;
      setMenuPos({
        top: y + height + 4,
        right: Math.max(16, windowWidth - (x + width)),
      });
      setIsMenuOpen(true);
    });
  };

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

      {/* 3. Right: 3-dot Menu Anchor */}
      <View ref={moreBtnRef} collapsable={false}>
        <TouchableOpacity
          style={styles.moreBtn}
          onPress={handleOpenMenu}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={18} color="#777777" />
        </TouchableOpacity>
      </View>

      {/* Contextual Anchored Popup Menu (Appears then and there) */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsMenuOpen(false)}>
          <View style={styles.menuBackdrop}>
            {menuPos && (
              <TouchableWithoutFeedback>
                <View style={[styles.menuPopup, { top: menuPos.top, right: menuPos.right }]}>
                  {/* Set as Default (if not already default) */}
                  {!address.isDefault && onSetDefault && (
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        setIsMenuOpen(false);
                        onSetDefault(address);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="star-outline" size={16} color="#0F172A" style={styles.menuItemIcon} />
                      <Text style={styles.menuItemText}>Set as default</Text>
                    </TouchableOpacity>
                  )}

                  {/* Edit Option */}
                  {onEdit && (
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        setIsMenuOpen(false);
                        onEdit(address);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="create-outline" size={16} color="#0F172A" style={styles.menuItemIcon} />
                      <Text style={styles.menuItemText}>Edit</Text>
                    </TouchableOpacity>
                  )}

                  {/* Divider before Delete */}
                  <View style={styles.menuDivider} />

                  {/* Delete Option */}
                  {onDelete && (
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        setIsMenuOpen(false);
                        onDelete(address);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={16} color="#DC2626" style={styles.menuItemIcon} />
                      <Text style={[styles.menuItemText, { color: '#DC2626' }]}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 10,
    color: '#888888',
    marginTop: 2,
  },
  middleContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    color: '#0F172A',
  },
  selectedBadge: {
    backgroundColor: '#E6F8EE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedBadgeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 9.5,
    color: '#047A36',
    letterSpacing: 0.4,
  },
  addressText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12.5,
    color: '#555555',
    lineHeight: 18,
  },
  moreBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  menuPopup: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    width: 155,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    zIndex: 9999,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  menuItemIcon: {
    marginRight: 10,
  },
  menuItemText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13.5,
    color: '#0F172A',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
});

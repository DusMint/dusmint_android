import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SavedAddressItem } from '../../location/data/locationData';
import { AppTypography } from '../../../ui/theme/appTypography';

interface Props {
  grandTotalPaise: number;
  hasOutOfStock: boolean;
  isLoading?: boolean;
  savedAddress?: SavedAddressItem | null;
  onChangeAddress?: () => void;
  onAddAddress?: () => void;
  onViewDetailedBill?: () => void;
  onProceedToPay: () => void;
}

export const CartBottomBar: React.FC<Props> = ({
  grandTotalPaise,
  hasOutOfStock,
  isLoading = false,
  savedAddress,
  onChangeAddress,
  onAddAddress,
  onProceedToPay,
}) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 12);
  const totalRupees = (grandTotalPaise / 100).toFixed(0);

  const getAddressIcon = (label?: string) => {
    switch (label) {
      case 'Work':
        return 'briefcase-outline';
      case 'Other':
        return 'location-outline';
      default:
        return 'home-outline';
    }
  };

  const addressLine = savedAddress
    ? [savedAddress.houseNo, savedAddress.streetArea, savedAddress.landmark].filter(Boolean).join(', ')
    : '';

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      {/* Warning strip if out of stock */}
      {hasOutOfStock && (
        <View style={styles.warningStrip}>
          <Text style={styles.warningText}>
            Some items are out of stock. Remove them to proceed.
          </Text>
        </View>
      )}

      {/* Row 1: Saved Address Dock (Matching 3rd screenshot) */}
      {savedAddress ? (
        <View style={styles.addressSection}>
          <View style={styles.addressLeft}>
            <View style={styles.houseIconBox}>
              <Ionicons
                name={getAddressIcon(savedAddress.label)}
                size={22}
                color="#B45309"
              />
            </View>
            <View style={styles.addressTextCol}>
              <Text style={styles.deliveringTitle}>
                Delivering to <Text style={styles.deliveringBold}>{savedAddress.label || 'Home'}</Text>
              </Text>
              <Text style={styles.addressSubtitle} numberOfLines={1}>
                {addressLine}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.changeBtn}
            onPress={onChangeAddress}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 10, right: 10 }}
          >
            <Text style={styles.changeBtnText}>Change</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {savedAddress ? <View style={styles.divider} /> : null}

      {/* Row 2: Total Price on Left, Action Button on Right */}
      <View style={styles.bottomRow}>
        <View style={styles.priceCol}>
          <Text style={styles.priceText}>₹{totalRupees}</Text>
        </View>

        {savedAddress ? (
          <TouchableOpacity
            style={[
              styles.actionBtn,
              hasOutOfStock && styles.disabledBtn,
            ]}
            onPress={onProceedToPay}
            disabled={hasOutOfStock || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.actionBtnText}>Proceed to Pay</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onAddAddress}
            activeOpacity={0.85}
          >
            <Ionicons name="location-outline" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>Add an Address</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
  warningStrip: {
    backgroundColor: '#FDECEA',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  warningText: {
    ...AppTypography.badgeText,
    color: '#D32F2F',
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  houseIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  addressTextCol: {
    flex: 1,
  },
  deliveringTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 2,
  },
  deliveringBold: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#0F172A',
  },
  addressSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  changeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  changeBtnText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: '#047A36',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: -16,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceCol: {
    justifyContent: 'center',
  },
  priceText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 21,
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#047A36',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 28,
    elevation: 2,
    shadowColor: '#047A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledBtn: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionBtnText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});

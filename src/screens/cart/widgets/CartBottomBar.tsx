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
  onViewDetailedBill,
  onProceedToPay,
}) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 12);
  const totalRupees = (grandTotalPaise / 100).toFixed(0);

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

      {/* Row 1: Saved Address Dock with GPS Icon */}
      {savedAddress ? (
        <View style={styles.addressSection}>
          <View style={styles.addressLeft}>
            {/* GPS icon with light green bg and black outline */}
            <View style={styles.gpsIconBox}>
              <Ionicons
                name="navigate"
                size={18}
                color="#000000"
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

      {/* Row 2: Total Price with inline TOTAL & View Bill on Left, Action Button on Right */}
      <View style={styles.bottomRow}>
        <View style={styles.priceCol}>
          <View style={styles.priceRowInline}>
            <Text style={styles.priceText}>₹{totalRupees}</Text>
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>TOTAL</Text>
            </View>
          </View>
          {onViewDetailedBill ? (
            <TouchableOpacity
              onPress={onViewDetailedBill}
              style={styles.viewBillRow}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 6 }}
            >
              <Text style={styles.viewBillText}>View Detailed Bill</Text>
              <Ionicons name="chevron-down" size={12} color="#047A36" />
            </TouchableOpacity>
          ) : null}
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
              <>
                <Text style={styles.actionBtnText}>Proceed to Pay</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </>
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
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
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
  gpsIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#DCFCE7', // Light green background
    borderWidth: 1.5,
    borderColor: '#000000', // Outline with black
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
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
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  priceCol: {
    justifyContent: 'center',
    flexShrink: 0,
  },
  priceRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 21,
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  totalBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  totalBadgeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 9.5,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  viewBillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  viewBillText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    color: '#047A36',
  },
  actionBtn: {
    flex: 1,
    maxWidth: 210,
    marginLeft: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#047A36',
    borderRadius: 14,
    height: 48,
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

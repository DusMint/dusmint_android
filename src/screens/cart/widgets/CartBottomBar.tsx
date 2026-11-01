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
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  grandTotalPaise: number;
  hasOutOfStock: boolean;
  isLoading?: boolean;
  onViewDetailedBill: () => void;
  onProceedToPay: () => void;
}

export const CartBottomBar: React.FC<Props> = ({
  grandTotalPaise,
  hasOutOfStock,
  isLoading = false,
  onViewDetailedBill,
  onProceedToPay,
}) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 10);
  const totalRupees = (grandTotalPaise / 100).toFixed(0);

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      {/* Warning banner above bar if out of stock */}
      {hasOutOfStock && (
        <View style={styles.warningStrip}>
          <Text style={styles.warningText}>
            Some items are out of stock. Remove them to proceed.
          </Text>
        </View>
      )}

      <View style={styles.contentRow}>
        {/* Left: Total & View Bill */}
        <View style={styles.leftColumn}>
          <Text style={styles.price}>₹{totalRupees}</Text>
          <TouchableOpacity onPress={onViewDetailedBill} activeOpacity={0.7}>
            <Text style={styles.viewBillText}>VIEW DETAILED BILL</Text>
          </TouchableOpacity>
        </View>

        {/* Right: Proceed to Pay Button */}
        <TouchableOpacity
          style={[
            styles.proceedBtn,
            hasOutOfStock && styles.disabledBtn,
          ]}
          onPress={onProceedToPay}
          disabled={hasOutOfStock || isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.proceedBtnText}>Proceed to Pay</Text>
          )}
        </TouchableOpacity>
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
    borderTopColor: '#EEEEEE',
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  warningStrip: {
    backgroundColor: '#FDECEA',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  warningText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#D32F2F',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftColumn: {
    justifyContent: 'center',
    marginRight: 16,
  },
  price: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 20,
    fontWeight: '800',
    color: InstamartColors.ink,
  },
  viewBillText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    fontWeight: '700',
    color: InstamartColors.accentBlue,
    marginTop: 2,
  },
  proceedBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#1F4FE8', // Swiggy Instamart checkout blue
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    backgroundColor: '#CCCCCC',
  },
  proceedBtnText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
});


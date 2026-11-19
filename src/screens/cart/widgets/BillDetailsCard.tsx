import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BillSummary } from '../data/cartData';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { AppTypography, AppTextColors } from '../../../ui/theme/appTypography';

interface Props {
  bill: BillSummary;
  onAddTipPress: () => void;
}

export const BillDetailsCard: React.FC<Props> = ({ bill, onAddTipPress }) => {
  const itemTotalRupees = (bill.itemTotalPaise / 100).toFixed(0);
  const itemMrpRupees = (bill.itemMrpPaise / 100).toFixed(0);
  const handlingFeeRupees = (bill.handlingFeePaise / 100).toFixed(0);
  const deliveryFeeRupees = (bill.deliveryFeePaise / 100).toFixed(0);
  const tipRupees = (bill.tipPaise / 100).toFixed(0);
  const grandTotalRupees = (bill.grandTotalPaise / 100).toFixed(0);
  const neededForFreeDelivery = (bill.amountNeededForFreeDeliveryPaise / 100).toFixed(0);

  return (
    <View style={styles.card}>
      <Text style={styles.caption}>BILL DETAILS</Text>

      {/* 1. Item Total */}
      <View style={styles.row}>
        <Text style={styles.label}>Item Total</Text>
        <View style={styles.valueRow}>
          {bill.itemMrpPaise > bill.itemTotalPaise && (
            <Text style={styles.strikethrough}>₹{itemMrpRupees}</Text>
          )}
          <Text style={styles.boldValue}>₹{itemTotalRupees}</Text>
        </View>
      </View>

      {/* 2. Handling Fee */}
      {bill.handlingFeePaise > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Handling Fee</Text>
          <View style={styles.valueRow}>
            <Text style={styles.strikethrough}>₹15</Text>
            <Text style={styles.boldValue}>₹{handlingFeeRupees}</Text>
          </View>
        </View>
      )}

      {/* 3. Small Cart Fee (if any) */}
      {bill.smallCartFeePaise > 0 ? (
        <View style={styles.columnRow}>
          <View style={styles.row}>
            <Text style={styles.label}>Small Cart Fee</Text>
            <Text style={styles.boldValue}>
              ₹{(bill.smallCartFeePaise / 100).toFixed(0)}
            </Text>
          </View>
          <Text style={styles.subCaption}>No small cart fee on orders above ₹49</Text>
        </View>
      ) : null}

      <View style={styles.divider} />

      {/* 4. Delivery Partner Tip */}
      <View style={styles.row}>
        <Text style={styles.label}>Delivery Partner Tip</Text>
        {bill.tipPaise > 0 ? (
          <Text style={styles.boldValue}>₹{tipRupees}</Text>
        ) : (
          <TouchableOpacity onPress={onAddTipPress} activeOpacity={0.7}>
            <Text style={styles.linkText}>Add a tip</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />

      {/* 5. Delivery Partner Fee */}
      <View style={styles.columnRow}>
        <View style={styles.row}>
          <Text style={styles.label}>Delivery Partner Fee</Text>
          {bill.isFreeDelivery ? (
            <View style={styles.valueRow}>
              <Text style={styles.strikethrough}>₹25</Text>
              <Text style={styles.freeText}>FREE</Text>
            </View>
          ) : (
            <Text style={styles.boldValue}>₹{deliveryFeeRupees}</Text>
          )}
        </View>
        {!bill.isFreeDelivery && (
          <Text style={styles.subCaption}>
            Add items worth ₹{neededForFreeDelivery} to avail Free Delivery
          </Text>
        )}
      </View>

      <View style={styles.divider} />

      {/* 6. Grand Total (To Pay) */}
      <View style={styles.row}>
        <Text style={styles.toPayLabel}>To Pay</Text>
        <View style={styles.valueRow}>
          {bill.savingsPaise > 0 && (
            <Text style={styles.mrpToPay}>
              ₹{((bill.grandTotalPaise + bill.savingsPaise) / 100).toFixed(0)}
            </Text>
          )}
          <Text style={styles.toPayValue}>₹{grandTotalRupees}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 12,
    marginTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  caption: {
    ...AppTypography.sectionLabel,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  columnRow: {
    paddingVertical: 2,
  },
  label: {
    ...AppTypography.bodyText,
    fontSize: 13,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strikethrough: {
    ...AppTypography.mrpText,
    fontSize: 12,
  },
  boldValue: {
    ...AppTypography.priceText,
    fontSize: 13,
  },
  freeText: {
    ...AppTypography.badgeText,
    fontSize: 13,
    color: '#1B9A5B',
  },
  subCaption: {
    ...AppTypography.cardMeta,
    fontSize: 10,
    marginTop: -2,
    marginBottom: 4,
  },
  linkText: {
    ...AppTypography.buttonText,
    fontSize: 13,
    color: InstamartColors.accentBlue,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 6,
  },
  toPayLabel: {
    ...AppTypography.cardMetaStrong,
    fontSize: 14,
  },
  mrpToPay: {
    ...AppTypography.mrpText,
    fontSize: 13,
  },
  toPayValue: {
    ...AppTypography.cardTitle,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
});


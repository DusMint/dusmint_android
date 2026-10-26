import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius, RoundButton, TrustBadge } from '@dusmint/ui';
import { useCartStore } from '../../state/useCartStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export const CartScreen: React.FC<Props> = ({ navigation }) => {
  const items = useCartStore((s) => s.items);
  const totalPaise = useCartStore((s) => s.getTotalPaise());
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const substitutionPreference = useCartStore((s) => s.substitutionPreference);
  const setSubstitutionPreference = useCartStore((s) => s.setSubstitutionPreference);
  const vendorCount = useCartStore((s) => s.getVendorCount());

  // Free delivery above ₹199 (19900 paise)
  const isFreeDelivery = totalPaise >= 19900;
  const deliveryFeePaise = isFreeDelivery ? 0 : 2500;
  const handlingFeePaise = 500; // ₹5.00
  const finalTotalPaise = totalPaise + deliveryFeePaise + handlingFeePaise;

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Add fresh vegetables, fruits or dairy from trusted neighbourhood shops to get started.
        </Text>
        <RoundButton
          title="Browse Daily Essentials"
          onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
          style={styles.browseBtn}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={require('../../../assets/img/btn_back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Order</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Item List */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>Items in Cart</Text>
          {items.map(({ item, quantity }) => {
            const itemTotalRupees = ((item.pricePaise * quantity) / 100).toFixed(0);
            return (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.nameEn}</Text>
                  <Text style={styles.itemUnit}>
                    {item.unit} • ₹{(item.pricePaise / 100).toFixed(0)}
                  </Text>
                </View>

                <View style={styles.rightAction}>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      onPress={() => decrementItem(item.id)}
                      style={styles.stepperBtn}
                    >
                      <Text style={styles.stepperText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepperQty}>{quantity}</Text>
                    <TouchableOpacity
                      onPress={() => incrementItem(item.id)}
                      style={styles.stepperBtn}
                    >
                      <Text style={styles.stepperText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.itemTotalPrice}>₹{itemTotalRupees}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Substitution Preferences */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>If an item is unavailable at the shop:</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSubstitutionPreference('replace_with_similar')}
            style={[
              styles.prefRow,
              substitutionPreference === 'replace_with_similar' ? styles.prefSelected : null,
            ]}
          >
            <Text style={styles.prefRadio}>
              {substitutionPreference === 'replace_with_similar' ? '🔘' : '⚪'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.prefTitle}>Replace with similar fresh item</Text>
              <Text style={styles.prefSub}>
                Vendor picks best alternative within mandi price limit
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSubstitutionPreference('remove_if_unavailable')}
            style={[
              styles.prefRow,
              substitutionPreference === 'remove_if_unavailable' ? styles.prefSelected : null,
            ]}
          >
            <Text style={styles.prefRadio}>
              {substitutionPreference === 'remove_if_unavailable' ? '🔘' : '⚪'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.prefTitle}>Remove & refund immediately</Text>
              <Text style={styles.prefSub}>
                Do not substitute. Unpacked items are refunded automatically
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bill Summary */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>Bill Details</Text>
          
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{(totalPaise / 100).toFixed(0)}</Text>
          </View>

          <View style={styles.billRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.billLabel}>Delivery Fee (Scheduled Slot)</Text>
              {isFreeDelivery ? (
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>FREE</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.billValue}>
              {isFreeDelivery ? '₹0' : `₹${(deliveryFeePaise / 100).toFixed(0)}`}
            </Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Packaging & Scale Seal Fee</Text>
            <Text style={styles.billValue}>₹{(handlingFeePaise / 100).toFixed(0)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>To Pay</Text>
            <Text style={styles.totalValue}>₹{(finalTotalPaise / 100).toFixed(0)}</Text>
          </View>
        </View>

        {/* Trust Note */}
        <View style={styles.trustFooter}>
          <TrustBadge type="seal_verified" />
          <Text style={styles.trustFooterText}>
            Every bag is sealed with tamper-evident QR tape and weight logged on scale.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Checkout CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.barLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.barPrice}>₹{(finalTotalPaise / 100).toFixed(0)}</Text>
        </View>
        <RoundButton
          title="Select Slot & Checkout →"
          onPress={() => navigation.navigate('SlotAndAddress')}
          style={styles.checkoutBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  browseBtn: {
    width: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: {
    paddingRight: Spacing.md,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  scroll: {
    padding: Spacing.base,
    paddingBottom: 100,
  },
  multiVendorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
  },
  vendorNoticeIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  vendorNoticeTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.xs,
    color: '#065F46',
  },
  vendorNoticeDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  cardSection: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeading: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  itemVernacular: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  itemUnit: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  rightAction: {
    alignItems: 'flex-end',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.roundButton,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stepperBtn: {
    paddingHorizontal: 6,
  },
  stepperText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontFamily: Typography.fontFamily.headingBold,
  },
  stepperQty: {
    color: Colors.textWhite,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.heading,
    paddingHorizontal: 6,
  },
  itemTotalPrice: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginTop: 6,
  },
  prefSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDF4',
  },
  prefRadio: {
    fontSize: 16,
    marginRight: 8,
  },
  prefTitle: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.xs,
    color: Colors.textPrimary,
  },
  prefSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 10,
    color: Colors.secondary,
    marginTop: 1,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  billLabel: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  billValue: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: Typography.fontSize.xs,
    color: Colors.textPrimary,
  },
  freeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  freeBadgeText: {
    color: '#15803D',
    fontSize: 9,
    fontFamily: Typography.fontFamily.headingBold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.md,
    color: Colors.primary,
  },
  trustFooter: {
    alignItems: 'center',
    marginVertical: Spacing.base,
  },
  trustFooterText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: Spacing.lg,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barLabel: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.headingBold,
    color: Colors.secondary,
  },
  barPrice: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
  },
  checkoutBtn: {
    width: '65%',
  },
});

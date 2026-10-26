import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius, Shadows, TrustBadge } from '@dusmint/ui';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'OrdersTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

const mockOrders = [
  {
    id: 'ord-active-1',
    orderCode: 'ORD-261026-0042',
    status: 'out_for_delivery',
    statusText: 'Rider Out for Delivery 🛵',
    statusColor: '#059669',
    slotName: 'Evening Slot (5:00 PM - 8:00 PM)',
    itemsSummary: 'Desi Tomato (1 kg), Aloo (1 kg), Robusta Banana (1 dozen)',
    totalRupees: 165,
    deliveryOtp: '4829',
    isActive: true,
  },
  {
    id: 'ord-past-1',
    orderCode: 'ORD-261025-0019',
    status: 'delivered',
    statusText: 'Delivered Yesterday 7:45 AM',
    statusColor: Colors.primary,
    slotName: 'Morning Slot (7:00 AM - 10:00 AM)',
    itemsSummary: 'Cow Milk Pouch (2 pcs), Malai Paneer (200 g)',
    totalRupees: 145,
    deliveryOtp: undefined,
    isActive: false,
  },
];

export const OrdersListScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>Track current slots and view past receipts</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Active Order Spotlight */}
        <Text style={styles.sectionHeading}>ACTIVE ORDERS</Text>
        {mockOrders
          .filter((o) => o.isActive)
          .map((order) => (
            <TouchableOpacity
              key={order.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
              style={styles.activeCard}
            >
              <View style={styles.activeHeader}>
                <View>
                  <Text style={styles.orderCode}>{order.orderCode}</Text>
                  <Text style={styles.slotText}>{order.slotName}</Text>
                </View>
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>LIVE TRACKING</Text>
                </View>
              </View>

              <Text style={styles.statusHighlight}>{order.statusText}</Text>
              <Text style={styles.itemsSummary} numberOfLines={2}>
                {order.itemsSummary}
              </Text>

              {/* Delivery OTP Callout */}
              {order.deliveryOtp ? (
                <View style={styles.otpBox}>
                  <Text style={styles.otpLabel}>SHARE THIS OTP AT DOORSTEP:</Text>
                  <Text style={styles.otpValue}>{order.deliveryOtp}</Text>
                </View>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.totalText}>Total: ₹{order.totalRupees}</Text>
                <Text style={styles.trackAction}>Track Live Details →</Text>
              </View>
            </TouchableOpacity>
          ))}

        {/* Past Orders */}
        <Text style={[styles.sectionHeading, { marginTop: Spacing.lg }]}>PAST ORDERS</Text>
        {mockOrders
          .filter((o) => !o.isActive)
          .map((order) => (
            <TouchableOpacity
              key={order.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
              style={styles.pastCard}
            >
              <View style={styles.pastHeader}>
                <Text style={styles.pastOrderCode}>{order.orderCode}</Text>
                <TrustBadge type="weight_verified" />
              </View>
              <Text style={styles.pastStatus}>{order.statusText}</Text>
              <Text style={styles.pastSummary} numberOfLines={1}>
                {order.itemsSummary}
              </Text>

              <View style={styles.pastFooter}>
                <Text style={styles.pastTotal}>₹{order.totalRupees}</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('ReportClaim', { orderId: order.id })
                  }
                >
                  <Text style={styles.reportLink}>Report Issue</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
    color: Colors.secondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  activeCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadows.medium,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderCode: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  slotText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  liveBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  liveBadgeText: {
    color: '#059669',
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
  },
  statusHighlight: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.md,
    color: '#059669',
    marginTop: Spacing.sm,
  },
  itemsSummary: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.secondary,
    marginTop: 4,
  },
  otpBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otpLabel: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
    color: '#92400E',
  },
  otpValue: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.lg,
    color: '#92400E',
    letterSpacing: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  totalText: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  trackAction: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
  },
  pastCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  pastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pastOrderCode: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  pastStatus: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    marginTop: 2,
  },
  pastSummary: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 4,
  },
  pastFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  pastTotal: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  reportLink: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.xs,
    color: Colors.orange,
  },
});

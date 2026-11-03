import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius, Shadows, TrustBadge } from '@dusmint/ui';
import { dusmintApi } from '@dusmint/api-client';
import { OrderSummary } from '@dusmint/api-client/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'OrdersTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const OrdersListScreen: React.FC<Props> = ({ navigation }) => {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const data = await dusmintApi.getOrders();
      if (data && data.length > 0) {
        setOrders(data);
      }
    } catch (err) {
      console.warn('Orders list fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      loadOrders();
    }, 6000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const activeOrders = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );
  const pastOrders = orders.filter(
    (o) => o.status === 'delivered' || o.status === 'cancelled'
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>Live multi-vendor slot deliveries & past receipts</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && orders.length === 0 && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Fetching your orders...</Text>
          </View>
        )}

        {/* Active Order Spotlight */}
        <Text style={styles.sectionHeading}>ACTIVE ORDERS ({activeOrders.length})</Text>

        {activeOrders.length === 0 && !loading && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active orders right now. Add items from home to place an order!</Text>
          </View>
        )}

        {activeOrders.map((order) => {
          const totalRupees = Math.round(order.totalPaise / 100);
          const partsSummary = (order.vendorParts || [])
            .map((p) => p.vendorName)
            .join(' + ');

          return (
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

              <Text style={styles.statusHighlight}>
                Status: {order.status === 'ready' ? 'Packed & Sealed • Awaiting Pickup' : order.status.toUpperCase()}
              </Text>
              <Text style={styles.itemsSummary} numberOfLines={2}>
                Stores: {partsSummary || 'Local Partners'} ({order.itemCount} items)
              </Text>

              {/* Delivery OTP Callout */}
              {order.deliveryOtp ? (
                <View style={styles.otpBox}>
                  <Text style={styles.otpLabel}>SHARE THIS OTP AT DOORSTEP:</Text>
                  <Text style={styles.otpValue}>{order.deliveryOtp}</Text>
                </View>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.totalText}>Total: ₹{totalRupees}</Text>
                <Text style={styles.trackAction}>Track Live Details →</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Past Orders */}
        {pastOrders.length > 0 && (
          <>
            <Text style={[styles.sectionHeading, { marginTop: Spacing.lg }]}>
              PAST ORDERS ({pastOrders.length})
            </Text>
            {pastOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
                style={styles.pastCard}
              >
                <View style={styles.pastHeader}>
                  <Text style={styles.pastOrderCode}>{order.orderCode}</Text>
                  <TrustBadge type="weight_verified" />
                </View>
                <Text style={styles.pastStatus}>Delivered ({order.slotName})</Text>
                <Text style={styles.pastSummary} numberOfLines={1}>
                  {order.itemCount} items • {order.paymentMode}
                </Text>

                <View style={styles.pastFooter}>
                  <Text style={styles.pastTotal}>₹{Math.round(order.totalPaise / 100)}</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ReportClaim', { orderId: order.id })}
                  >
                    <Text style={styles.reportLink}>Report Issue</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
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
    color: Colors.secondary,
    marginTop: 2,
  },
  scroll: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.secondary,
  },
  sectionHeading: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: 11,
    color: Colors.secondary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  emptyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.secondary,
    textAlign: 'center',
  },
  activeCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginBottom: Spacing.base,
    ...Shadows.light,
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
    color: Colors.secondary,
    marginTop: 2,
  },
  liveBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontFamily: Typography.fontFamily.headingBold,
  },
  statusHighlight: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  itemsSummary: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginVertical: 4,
  },
  otpBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  otpLabel: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: 10,
    color: '#B45309',
  },
  otpValue: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.md,
    color: '#92400E',
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  totalText: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  trackAction: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
  },
  pastCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  pastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pastOrderCode: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  pastStatus: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: '#059669',
    marginTop: 2,
  },
  pastSummary: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pastFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  pastTotal: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  reportLink: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.xs,
    color: Colors.secondary,
  },
});

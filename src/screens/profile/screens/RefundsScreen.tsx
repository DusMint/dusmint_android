import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOrderStore } from '../../../state/useOrderStore';

interface Props {
  navigation: any;
}

export const RefundsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;
  const storeOrders = useOrderStore((s) => s.orders);

  // Filter refunded or cancelled orders
  const refundedOrders = storeOrders.filter(
    (o) => o.status === 'cancelled'
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* 1. Header */}
      <View style={[styles.headerContainer, { paddingTop: statusBarHeight }]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Refunds</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Refund Policy Summary Card */}
        <View style={styles.section}>
          <Text style={styles.caption}>REFUND SUMMARY</Text>
          <View style={styles.card}>
            <View style={styles.summaryTop}>
              <View>
                <Text style={styles.summaryLabel}>Total Refunded</Text>
                <Text style={styles.summaryAmount}>₹0.00</Text>
              </View>
              <View style={styles.speedBadge}>
                <Ionicons name="flash" size={13} color="#047A36" style={{ marginRight: 4 }} />
                <Text style={styles.speedText}>Instant Credits</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.policyRow}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#047A36" style={{ marginRight: 8 }} />
              <Text style={styles.policyText}>
                All quality claims and cancellations are credited to your original payment source within 15-30 minutes.
              </Text>
            </View>
          </View>
        </View>

        {/* Refund List or Clean Empty Card */}
        <View style={styles.section}>
          <Text style={styles.caption}>REFUND HISTORY</Text>
          {refundedOrders.length > 0 ? (
            <View style={styles.card}>
              {refundedOrders.map((order, idx) => (
                <View key={order.id}>
                  <View style={styles.refundRow}>
                    <View style={styles.refundInfo}>
                      <Text style={styles.orderCode}>Order #{order.orderCode}</Text>
                      <Text style={styles.refundDate}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.refundAmount}>+₹{order.totalRupees}</Text>
                      <View style={styles.processedBadge}>
                        <Text style={styles.processedText}>Processed to Bank</Text>
                      </View>
                    </View>
                  </View>
                  {idx < refundedOrders.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="cash-outline" size={38} color="#94A3B8" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>No refunds yet</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => navigation.navigate('OrdersList')}
                activeOpacity={0.8}
              >
                <Text style={styles.addBtnText}>View Past Orders</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
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
    padding: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
  },
  summaryLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  summaryAmount: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 22,
    color: '#0F172A',
    marginTop: 2,
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  speedText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    color: '#047A36',
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
  },
  policyText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#475569',
    flex: 1,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  refundInfo: {
    flex: 1,
  },
  orderCode: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  refundDate: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  refundAmount: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 15,
    color: '#047A36',
  },
  processedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  processedText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 10,
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
  emptyTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 16,
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

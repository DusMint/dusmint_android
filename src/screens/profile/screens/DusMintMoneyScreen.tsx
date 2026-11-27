import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../state/useAuthStore';

interface Props {
  navigation: any;
}

export const DusMintMoneyScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;
  const user = useAuthStore((s) => s.user);

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
          <Text style={styles.headerTitle}>DusMint Money</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Wallet Balance Card */}
        <View style={styles.section}>
          <Text style={styles.caption}>AVAILABLE BALANCE</Text>
          <View style={styles.card}>
            <View style={styles.balanceRow}>
              <View>
                <Text style={styles.balanceLabel}>Current Wallet Balance</Text>
                <Text style={styles.balanceAmount}>₹{(user as any)?.tolaBalance || 0}</Text>
              </View>
              <View style={styles.activePill}>
                <View style={styles.greenDot} />
                <Text style={styles.activePillText}>Ready to use</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.addMoneyBtn}
                activeOpacity={0.8}
                onPress={() => Alert.alert('Add Money', 'Add funds to your wallet using UPI, Cards or Net Banking.')}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.addMoneyText}>Add Money</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.giftCardBtn}
                activeOpacity={0.8}
                onPress={() => Alert.alert('Gift Card', 'Redeem a DusMint gift card or promotional coupon voucher.')}
              >
                <Ionicons name="gift-outline" size={15} color="#047A36" style={{ marginRight: 4 }} />
                <Text style={styles.giftCardText}>Redeem Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Wallet Benefits */}
        <View style={styles.section}>
          <Text style={styles.caption}>WALLET PERKS</Text>
          <View style={styles.card}>
            <View style={styles.perkRow}>
              <View style={styles.perkIconBox}>
                <Ionicons name="flash-outline" size={18} color="#047A36" />
              </View>
              <View style={styles.perkInfo}>
                <Text style={styles.perkTitle}>1-Click Checkout</Text>
                <Text style={styles.perkDesc}>Instant payment with zero OTP or bank gateway delays</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.perkRow}>
              <View style={styles.perkIconBox}>
                <Ionicons name="refresh-outline" size={18} color="#047A36" />
              </View>
              <View style={styles.perkInfo}>
                <Text style={styles.perkTitle}>Instant Refund Credits</Text>
                <Text style={styles.perkDesc}>Any quality claims are credited in under 60 seconds</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.perkRow}>
              <View style={styles.perkIconBox}>
                <Ionicons name="pricetag-outline" size={18} color="#047A36" />
              </View>
              <View style={styles.perkInfo}>
                <Text style={styles.perkTitle}>Extra Cashback & Offers</Text>
                <Text style={styles.perkDesc}>Get bonus cashback on fresh Mandi orders</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transactions Empty State Card */}
        <View style={styles.section}>
          <Text style={styles.caption}>TRANSACTION HISTORY</Text>
          <View style={styles.emptyCard}>
            <Ionicons name="wallet-outline" size={38} color="#94A3B8" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('HomeTab')}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>Explore Fresh Store</Text>
            </TouchableOpacity>
          </View>
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
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
  },
  balanceLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  balanceAmount: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 26,
    color: '#0F172A',
    marginTop: 2,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  activePillText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    color: '#047A36',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    gap: 10,
  },
  addMoneyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#047A36',
    borderRadius: 10,
    paddingVertical: 10,
  },
  addMoneyText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  giftCardBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 10,
  },
  giftCardText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#047A36',
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  perkIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  perkInfo: {
    flex: 1,
  },
  perkTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13.5,
    color: '#0F172A',
  },
  perkDesc: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
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

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

interface Props {
  navigation: any;
}

export const PartnerRewardsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;

  const vouchers = [
    {
      id: 'v-1',
      title: '₹50 OFF on Fresh Vegetables',
      code: 'MANDI50',
      minOrder: 'Valid on orders above ₹299',
      store: 'Sharma Sabzi Mandi & Kirana',
    },
    {
      id: 'v-2',
      title: 'Free Coriander & Green Chillies',
      code: 'FRESHMINT',
      minOrder: 'Valid on all daily mandi baskets',
      store: 'Indore Mandi Direct',
    },
    {
      id: 'v-3',
      title: '5% Extra Cashback on Dairy',
      code: 'DAIRY5',
      minOrder: 'Valid on Milk, Paneer & Butter',
      store: 'Shri Ram Dairy & Kirana',
    },
  ];

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
          <Text style={styles.headerTitle}>Partner Rewards</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Tier Status Card */}
        <View style={styles.section}>
          <Text style={styles.caption}>TIER STATUS</Text>
          <View style={styles.card}>
            <View style={styles.tierTop}>
              <View>
                <Text style={styles.tierName}>DusMint Green Member</Text>
                <Text style={styles.tierDesc}>Exclusive partner perks from local Indore stores</Text>
              </View>
              <View style={styles.tierIconBadge}>
                <Ionicons name="gift" size={20} color="#047A36" />
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.progressRow}>
              <Ionicons name="sparkles" size={15} color="#047A36" style={{ marginRight: 6 }} />
              <Text style={styles.progressText}>2 more orders to unlock 15% Kirana discount badge</Text>
            </View>
          </View>
        </View>

        {/* Active Partner Coupons */}
        <View style={styles.section}>
          <Text style={styles.caption}>ACTIVE PARTNER COUPONS</Text>
          <View style={styles.card}>
            {vouchers.map((v, idx) => (
              <View key={v.id}>
                <View style={styles.voucherRow}>
                  <View style={styles.voucherLeft}>
                    <Text style={styles.voucherTitle}>{v.title}</Text>
                    <Text style={styles.voucherStore}>{v.store}</Text>
                    <Text style={styles.voucherMin}>{v.minOrder}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.codeBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      Alert.alert('Coupon Applied', `Code ${v.code} will be applied automatically at checkout.`);
                    }}
                  >
                    <Text style={styles.codeText}>{v.code}</Text>
                    <Text style={styles.applySub}>TAP TO APPLY</Text>
                  </TouchableOpacity>
                </View>
                {idx < vouchers.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Milestone Empty State Card */}
        <View style={styles.section}>
          <Text style={styles.caption}>MILESTONES</Text>
          <View style={styles.emptyCard}>
            <Ionicons name="gift-outline" size={38} color="#0F172A" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>Order more to unlock perks</Text>
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
  tierTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
  },
  tierName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  tierDesc: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  tierIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
  },
  progressText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: '#047A36',
  },
  voucherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  voucherLeft: {
    flex: 1,
    marginRight: 12,
  },
  voucherTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13.5,
    color: '#0F172A',
  },
  voucherStore: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11.5,
    color: '#047A36',
    marginTop: 2,
  },
  voucherMin: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  codeBtn: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  codeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    color: '#047A36',
    letterSpacing: 0.5,
  },
  applySub: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 8,
    color: '#16A34A',
    marginTop: 1,
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

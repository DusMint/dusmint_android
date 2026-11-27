import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../state/useAuthStore';

interface Props {
  navigation: any;
}

export const PaymentModesScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;
  const user = useAuthStore((s) => s.user);

  const phone = user?.phone ? user.phone.replace(/[^0-9]/g, '').slice(-10) : '9801093988';
  const [codEnabled, setCodEnabled] = useState(true);

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
          <Text style={styles.headerTitle}>Payment Modes</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* UPI & Wallets */}
        <View style={styles.section}>
          <Text style={styles.caption}>SAVED UPI & APPS</Text>
          <View style={styles.card}>
            <View style={styles.paymentRow}>
              <View style={styles.upiIconBadge}>
                <Ionicons name="flash-outline" size={18} color="#047A36" />
              </View>
              <View style={styles.paymentInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.paymentName}>Google Pay</Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>PRIMARY</Text>
                  </View>
                </View>
                <Text style={styles.paymentSub}>{phone}@okaxis</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#047A36" />
            </View>

            <View style={styles.divider} />

            <View style={styles.paymentRow}>
              <View style={styles.upiIconBadge}>
                <Ionicons name="phone-portrait-outline" size={18} color="#0F172A" />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>PhonePe UPI</Text>
                <Text style={styles.paymentSub}>{phone}@ybl</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.addRow}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Add UPI ID', 'Enter your VPA (Virtual Payment Address) to link a new UPI ID.')}
            >
              <Ionicons name="add-circle-outline" size={20} color="#047A36" />
              <Text style={styles.addText}>Add New UPI ID</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cards */}
        <View style={styles.section}>
          <Text style={styles.caption}>SAVED CARDS</Text>
          <View style={styles.card}>
            <View style={styles.paymentRow}>
              <View style={styles.cardIconBadge}>
                <Ionicons name="card-outline" size={18} color="#0F172A" />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>HDFC Bank Debit Card</Text>
                <Text style={styles.paymentSub}>•••• •••• •••• 4102  •  Exp 08/28</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.addRow}
              activeOpacity={0.7}
              onPress={() => Alert.alert('Add Card', 'Save your Credit or Debit card securely for fast 1-click checkout.')}
            >
              <Ionicons name="add-circle-outline" size={20} color="#047A36" />
              <Text style={styles.addText}>Add Credit or Debit Card</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pay on Delivery */}
        <View style={styles.section}>
          <Text style={styles.caption}>PAY ON DELIVERY</Text>
          <View style={styles.card}>
            <View style={styles.paymentRow}>
              <View style={styles.codIconBadge}>
                <Ionicons name="cash-outline" size={18} color="#047A36" />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>Cash on Delivery (COD)</Text>
                <Text style={styles.paymentSub}>Pay with cash or scan QR when your delivery arrives</Text>
              </View>
              <Switch
                value={codEnabled}
                onValueChange={setCodEnabled}
                trackColor={{ false: '#E2E8F0', true: '#BBF7D0' }}
                thumbColor={codEnabled ? '#047A36' : '#94A3B8'}
              />
            </View>
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
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  upiIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  codIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentName: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: '#0F172A',
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  verifiedText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 9,
    color: '#047A36',
  },
  paymentSub: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  addText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: '#047A36',
    marginLeft: 8,
  },
});

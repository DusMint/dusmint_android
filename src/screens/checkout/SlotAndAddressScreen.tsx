import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { InstamartColors } from '../../ui/theme/instamartTheme';
import { useCartStore } from '../../state/useCartStore';
import { useLocationStore } from '../../state/useLocationStore';
import { dusmintApi } from '@dusmint/api-client';

type Props = NativeStackScreenProps<RootStackParamList, 'SlotAndAddress'>;

type PaymentOptionId =
  | 'gpay'
  | 'phonepe'
  | 'paytm'
  | 'other_upi'
  | 'doorstep_qr'
  | 'cod'
  | 'card'
  | 'netbanking';

interface PaymentMethodItem {
  id: PaymentOptionId;
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  badge?: string;
  badgeColor?: string;
}

const UPI_OPTIONS: PaymentMethodItem[] = [
  {
    id: 'gpay',
    title: 'Google Pay',
    subtitle: 'Fastest checkout with GPay',
    iconName: 'logo-google',
    iconColor: '#EA4335',
    badge: '1-CLICK',
    badgeColor: '#10B981',
  },
  {
    id: 'phonepe',
    title: 'PhonePe UPI',
    subtitle: 'Pay via PhonePe app',
    iconName: 'phone-portrait-outline',
    iconColor: '#5F259F',
  },
  {
    id: 'paytm',
    title: 'Paytm UPI',
    subtitle: 'Pay securely using Paytm',
    iconName: 'wallet-outline',
    iconColor: '#00BAF2',
  },
  {
    id: 'other_upi',
    title: 'Add Other UPI ID',
    subtitle: 'Pay via CRED, BHIM, Amazon Pay or any VPA',
    iconName: 'qr-code-outline',
    iconColor: '#2563EB',
  },
];

const POD_OPTIONS: PaymentMethodItem[] = [
  {
    id: 'doorstep_qr',
    title: 'Scan QR at Doorstep',
    subtitle: 'Scan dynamic QR code on rider’s phone upon delivery',
    iconName: 'scan-circle-outline',
    iconColor: '#0055FF',
    badge: 'RECOMMENDED',
    badgeColor: '#0055FF',
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    subtitle: 'Pay cash to the delivery partner',
    iconName: 'cash-outline',
    iconColor: '#10B981',
  },
];

const CARD_NET_OPTIONS: PaymentMethodItem[] = [
  {
    id: 'card',
    title: 'Credit / Debit Cards',
    subtitle: 'Visa, MasterCard, RuPay, Diners',
    iconName: 'card-outline',
    iconColor: '#D97706',
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    subtitle: 'HDFC, ICICI, SBI, Axis, Kotak & more',
    iconName: 'business-outline',
    iconColor: '#4B5563',
  },
];

export const SlotAndAddressScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<PaymentOptionId>('gpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(false);

  const items = useCartStore((s) => s.items);
  const totalPaise = useCartStore((s) => s.getTotalPaise());
  const substitutionPreference = useCartStore((s) => s.substitutionPreference);
  const clearCart = useCartStore((s) => s.clearCart);

  const currentAddress = useLocationStore((s) => s.currentAddress);
  const currentCluster = useLocationStore((s) => s.currentCluster);
  const userAddress = useLocationStore((s) => s.userAddress);
  const shortAddress = useLocationStore((s) => s.shortAddress);

  const totalRupees = Math.round(totalPaise / 100);

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
  );

  const displayAddress =
    currentAddress?.fullAddress ||
    userAddress ||
    'Flat 402, Royal Palms, Scheme 54, Vijay Nagar, Indore';

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        clusterId: currentCluster?.clusterId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        deliverySlotId: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
        addressId: currentAddress?.id || 'addr-default-1',
        substitutionPreference,
        items: items.map((i) => ({
          itemId: i.item.id,
          vendorId: i.item.vendorId,
          quantity: i.quantity,
        })),
        paymentMode:
          selectedMethod === 'doorstep_qr'
            ? 'upi_on_delivery'
            : selectedMethod === 'cod'
            ? 'cash_on_delivery'
            : 'upi_intent',
      };

      const res = await dusmintApi.createOrder(payload);
      clearCart();
      setIsSubmitting(false);

      navigation.replace('OrderTracking', {
        orderId: res.orderId || 'ord-1234',
      });
    } catch {
      // Mock order preview for offline testing
      clearCart();
      setIsSubmitting(false);
      navigation.replace('OrderTracking', {
        orderId: 'mock-order-uuid',
      });
    }
  };

  const renderPaymentRow = (item: PaymentMethodItem) => {
    const isSelected = selectedMethod === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.paymentRow, isSelected && styles.paymentRowSelected]}
        onPress={() => setSelectedMethod(item.id)}
        activeOpacity={0.75}
      >
        <View style={styles.iconCircle}>
          <Ionicons name={item.iconName} size={22} color={item.iconColor} />
        </View>

        <View style={styles.paymentInfoCol}>
          <View style={styles.paymentTitleRow}>
            <Text style={styles.paymentTitleText}>{item.title}</Text>
            {item.badge && (
              <View
                style={[
                  styles.badgePill,
                  { backgroundColor: item.badgeColor ? `${item.badgeColor}15` : '#EEF2FF' },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: item.badgeColor || '#0055FF' },
                  ]}
                >
                  {item.badge}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.paymentSubtitleText} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>

        <View style={styles.radioBox}>
          {isSelected ? (
            <Ionicons name="checkmark-circle" size={24} color="#0055FF" />
          ) : (
            <Ionicons name="ellipse-outline" size={24} color="#D1D5DB" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. Fixed Header with Safe Area Insets */}
      <View style={[styles.header, { paddingTop: topInset + 6 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Select Payment</Text>
          <Text style={styles.headerSubtitle}>
            Order Total: <Text style={{ fontWeight: '700' }}>₹{totalRupees}</Text>
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Instant 10-Minute Delivery Address Banner (Swiggy Instamart style) */}
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryTopRow}>
            <View style={styles.etaBadge}>
              <Ionicons name="flash" size={14} color="#0055FF" style={{ marginRight: 4 }} />
              <Text style={styles.etaText}>9-10 MINS</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('SelectLocation')}
              activeOpacity={0.7}
            >
              <Text style={styles.changeActionText}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addressRow}>
            <View style={styles.addressIconBox}>
              <Ionicons name="home" size={16} color="#0055FF" />
            </View>
            <View style={styles.addressTextCol}>
              <Text style={styles.addressLabel}>
                HOME &bull; {shortAddress || 'Vijay Nagar'}
              </Text>
              <Text style={styles.addressDetail} numberOfLines={2}>
                {displayAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Payment Methods: Group 1 - UPI (Recommended) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>UPI (Recommended & Fastest)</Text>
            <View style={styles.instantTag}>
              <Text style={styles.instantTagText}>⚡ INSTANT</Text>
            </View>
          </View>
          {UPI_OPTIONS.map(renderPaymentRow)}
        </View>

        {/* 4. Payment Methods: Group 2 - Pay on Delivery */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Pay on Delivery</Text>
          </View>
          {POD_OPTIONS.map(renderPaymentRow)}
        </View>

        {/* 5. Payment Methods: Group 3 - Cards & Netbanking */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Cards & Net Banking</Text>
          </View>
          {CARD_NET_OPTIONS.map(renderPaymentRow)}
        </View>

        {/* 6. Collapsible Bill Breakdown Card */}
        <View style={styles.billSummaryCard}>
          <TouchableOpacity
            style={styles.billHeaderRow}
            onPress={() => setShowBillDetails((prev) => !prev)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name="receipt-outline"
                size={18}
                color="#0055FF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.billSummaryTitle}>Bill Summary</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.billTotalText}>To Pay: ₹{totalRupees}</Text>
              <Ionicons
                name={showBillDetails ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#6B7280"
                style={{ marginLeft: 6 }}
              />
            </View>
          </TouchableOpacity>

          {showBillDetails && (
            <View style={styles.billDetailsBody}>
              <View style={styles.billLine}>
                <Text style={styles.billLabel}>Item Total</Text>
                <Text style={styles.billValue}>₹{totalRupees}</Text>
              </View>
              <View style={styles.billLine}>
                <Text style={styles.billLabel}>Delivery Partner Fee</Text>
                <Text style={styles.billFreeValue}>FREE</Text>
              </View>
              <View style={styles.billLine}>
                <Text style={styles.billLabel}>Handling & Packaging</Text>
                <Text style={styles.billValue}>₹5</Text>
              </View>
              <View style={styles.billLine}>
                <Text style={styles.billLabel}>Govt Taxes & Charges</Text>
                <Text style={styles.billValue}>Included</Text>
              </View>
            </View>
          )}
        </View>

        {/* Trust Badge */}
        <View style={styles.securityTrustRow}>
          <Ionicons name="shield-checkmark" size={16} color="#10B981" />
          <Text style={styles.securityTrustText}>
            100% Safe & Secure Payments &bull; DusMint Tamper-Proof Guarantee
          </Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* 7. Bottom Sticky Payment Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPayableLabel}>TOTAL PAYABLE</Text>
          <Text style={styles.bottomPriceText}>₹{totalRupees}</Text>
        </View>

        <TouchableOpacity
          style={styles.payBtn}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
          activeOpacity={0.88}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.payBtnContent}>
              <Ionicons name="lock-closed" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.payBtnText}>
                {selectedMethod === 'cod'
                  ? `Place Order • ₹${totalRupees}`
                  : `Pay ₹${totalRupees}`}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EBF0FF',
  },
  deliveryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  etaText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#0055FF',
    fontWeight: '700',
  },
  changeActionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#0055FF',
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  addressTextCol: {
    flex: 1,
  },
  addressLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  addressDetail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.2,
  },
  instantTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  instantTagText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#059669',
    fontWeight: '700',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  paymentRowSelected: {
    backgroundColor: '#F9FAFC',
    borderRadius: 10,
    marginHorizontal: -4,
    paddingHorizontal: 4,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  paymentInfoCol: {
    flex: 1,
  },
  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentTitleText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  badgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    fontWeight: '700',
  },
  paymentSubtitleText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  radioBox: {
    marginLeft: 8,
  },
  billSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  billHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  billSummaryTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  billTotalText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#0055FF',
  },
  billDetailsBody: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  billLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  billLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#4B5563',
  },
  billValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#111827',
  },
  billFreeValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#10B981',
  },
  securityTrustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  securityTrustText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
    color: '#6B7280',
    marginLeft: 6,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomPriceCol: {
    justifyContent: 'center',
  },
  bottomPayableLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9.5,
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  bottomPriceText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  payBtn: {
    backgroundColor: '#0055FF', // Swiggy Instamart signature blue
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0055FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 160,
  },
  payBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

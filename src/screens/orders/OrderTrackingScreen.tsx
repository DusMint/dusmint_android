import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { dusmintApi } from '@dusmint/api-client';
import { OrderSummary } from '@dusmint/api-client/types';
import { LiveTrackingMap } from './widgets/LiveTrackingMap';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderTracking'>;

interface OrderedItemPreview {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  quantityLabel?: string;
}

const DEFAULT_ORDERED_ITEMS: OrderedItemPreview[] = [
  {
    id: 'it-1',
    name: 'Nashik Red Onion (Pyaaz)',
    price: 34,
    quantity: 1,
    quantityLabel: '1 kg',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200',
  },
  {
    id: 'it-2',
    name: 'Fresh Malai Paneer',
    price: 38,
    quantity: 1,
    quantityLabel: '200 g',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200',
  },
];

export const OrderTrackingScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    orderId,
    orderCode = 'DM-84920',
    items: passedItems,
    totalRupees = 72,
    deliveryAddress = 'Flat 402, Royal Palms, Scheme 54, Vijay Nagar, Indore',
    paymentModeTitle = 'Google Pay (UPI)',
  } = route.params || {};

  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Live countdown timer in seconds (starts at 9 mins = 540 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(524);
  const [liveDistance, setLiveDistance] = useState('1.1 km');

  const displayItems = passedItems && passedItems.length > 0 ? passedItems : DEFAULT_ORDERED_ITEMS;

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
  );

  // Fetch live order status from API with background polling
  const fetchOrder = useCallback(
    async (isPolling = false) => {
      if (!isPolling) setLoading(true);
      try {
        const data = await dusmintApi.getOrderDetail(orderId);
        if (data) setOrder(data);
      } catch (err) {
        // Fallback gracefully for offline/demo orders
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    fetchOrder();
    const pollInterval = setInterval(() => {
      fetchOrder(true);
    }, 6000);
    return () => clearInterval(pollInterval);
  }, [fetchOrder]);

  // Second-by-second countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCallRider = () => {
    Alert.alert(
      'Call Delivery Partner',
      'Connecting to Rahul Sharma (+91 98765-43210)...',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dial',
          onPress: () => Linking.openURL('tel:9876543210').catch(() => {}),
        },
      ]
    );
  };

  const handleTipRider = () => {
    Alert.alert(
      'Tip Delivery Partner',
      'Add a tip for Rahul’s prompt delivery:',
      [
        { text: '₹10', onPress: () => Alert.alert('Thank You', '₹10 tip added!') },
        { text: '₹20 (Recommended)', onPress: () => Alert.alert('Thank You', '₹20 tip added!') },
        { text: '₹30', onPress: () => Alert.alert('Thank You', '₹30 tip added!') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleScanSeal = () => {
    Alert.alert(
      'Scan Tamper-Proof Seal QR',
      'Scan the unique QR code on the bag tape upon receiving your delivery. This activates your 30-minute quality & weight guarantee.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Scanner',
          onPress: () => navigation.navigate('ReportClaim', { orderId }),
        },
      ]
    );
  };

  const handleHelpPress = () => {
    Alert.alert(
      'DusMint 24/7 Priority Support',
      'How can we help with your order?\n\n1. Mandi Quality Issue\n2. Delay in Delivery\n3. Missing Item Claim',
      [
        {
          text: 'Call Helpline',
          onPress: () => Linking.openURL('tel:18002006263').catch(() => {}),
        },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. Top Navigation App Bar */}
      <View style={[styles.header, { paddingTop: topInset + 6 }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Live Order Tracking</Text>
          <Text style={styles.orderIdBadge}>Order #{order?.orderCode || orderCode}</Text>
        </View>

        <TouchableOpacity style={styles.helpBtn} onPress={handleHelpPress} activeOpacity={0.75}>
          <Ionicons name="headset-outline" size={18} color="#0055FF" />
          <Text style={styles.helpBtnText}>Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchOrder(false)} />
        }
      >
        {/* 2. Hero Header: Instamart Signature 9-Mins Timer & Progress */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.instantBadge}>
              <Ionicons name="flash" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.instantBadgeText}>9 MINS INSTANT DELIVERY</Text>
            </View>
            <Text style={styles.timerLiveText}>{formatCountdown(secondsRemaining)}</Text>
          </View>

          <Text style={styles.heroEtaTitle}>Arriving in {Math.ceil(secondsRemaining / 60)} MINS</Text>
          <Text style={styles.heroEtaSubtitle}>
            Packing your fresh items at Mandi Superstore, Vijay Nagar
          </Text>

          {/* 4-Stage Horizontal Progress Step Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '68%' }]} />
            </View>

            <View style={styles.stepsRow}>
              <View style={styles.stepCol}>
                <View style={[styles.stepCircle, styles.stepDone]}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.stepTextActive}>Confirmed</Text>
              </View>

              <View style={styles.stepCol}>
                <View style={[styles.stepCircle, styles.stepDone]}>
                  <Ionicons name="cube" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.stepTextActive}>Weighed</Text>
              </View>

              <View style={styles.stepCol}>
                <View style={[styles.stepCircle, styles.stepCurrent]}>
                  <Ionicons name="bicycle" size={14} color="#FFFFFF" />
                </View>
                <Text style={styles.stepTextHighlight}>On the way</Text>
              </View>

              <View style={styles.stepCol}>
                <View style={[styles.stepCircle, styles.stepPending]}>
                  <Ionicons name="home-outline" size={12} color="#9CA3AF" />
                </View>
                <Text style={styles.stepTextPending}>Doorstep</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. Live Route Map (Store to Home + Moving Scooter + Floating Pill) */}
        <LiveTrackingMap
          originLat={22.7485}
          originLng={75.8855}
          storeName="Mandi Superstore, Vijay Nagar"
          destLat={22.7533}
          destLng={75.8937}
          destAddress={deliveryAddress}
          riderName="Rahul"
          onProgressUpdate={(dist) => setLiveDistance(dist)}
        />

        {/* 4. Delivery Partner & Doorstep OTP Card */}
        <View style={styles.riderCard}>
          <View style={styles.riderTopRow}>
            <View style={styles.riderAvatarBox}>
              <Ionicons name="person" size={26} color="#0055FF" />
              <View style={styles.onlineDot} />
            </View>

            <View style={styles.riderInfoCol}>
              <View style={styles.riderNameRow}>
                <Text style={styles.riderName}>Rahul Sharma</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={11} color="#F59E0B" />
                  <Text style={styles.ratingText}>4.9</Text>
                </View>
              </View>
              <Text style={styles.riderVehicleText}>
                DusMint Express Eco-EV &bull; Vaccinated &amp; Masked
              </Text>
            </View>

            <TouchableOpacity
              style={styles.callRiderBtn}
              onPress={handleCallRider}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Quick Tip Rider Button */}
          <TouchableOpacity
            style={styles.tipRow}
            onPress={handleTipRider}
            activeOpacity={0.75}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="heart" size={16} color="#EC4899" style={{ marginRight: 6 }} />
              <Text style={styles.tipRowText}>Tip Rahul for swift delivery</Text>
            </View>
            <Text style={styles.tipActionText}>Add Tip &rarr;</Text>
          </TouchableOpacity>

          {/* Sleek Modern Delivery OTP Card */}
          <View style={styles.otpPillCard}>
            <View style={styles.otpLeftBox}>
              <View style={styles.keyIconCircle}>
                <Ionicons name="key" size={16} color="#D97706" />
              </View>
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.otpCardTitle}>DOORSTEP DELIVERY OTP</Text>
                <Text style={styles.otpCardSubtitle}>
                  Share only with rider upon arrival
                </Text>
              </View>
            </View>

            <View style={styles.otpBadgeBox}>
              <Text style={styles.otpDigits}>{order?.deliveryOtp || '4291'}</Text>
            </View>
          </View>
        </View>

        {/* 5. DusMint Mandi Special: Live Weight & Tamper-Proof Seal (USP) */}
        <View style={styles.mandiProofCard}>
          <View style={styles.mandiHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="scale-outline" size={18} color="#059669" style={{ marginRight: 6 }} />
              <Text style={styles.mandiTitle}>Mandi Scale &amp; Seal Verified</Text>
            </View>
            <View style={styles.verifiedTag}>
              <Text style={styles.verifiedTagText}>100% ACCURATE</Text>
            </View>
          </View>

          <Text style={styles.mandiDesc}>
            Items are weighed on certified electronic Bluetooth scales and sealed with tamper-evident tape by local dukandars.
          </Text>

          {/* Vendor Proof Item 1 */}
          <View style={styles.vendorItemRow}>
            <View style={styles.vendorCategoryIcon}>
              <Ionicons name="leaf-outline" size={18} color="#059669" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.vendorTitleRow}>
                <Text style={styles.vendorName}>Mandi Fresh Sabzi</Text>
                <Text style={styles.sealedTag}>SEALED &amp; READY</Text>
              </View>
              <Text style={styles.vendorSub}>
                Verified Bag Weight: <Text style={{ fontWeight: '700', color: '#059669' }}>2040 grams</Text>
              </Text>
              <Text style={styles.sealNumber}>Security Tape: #DST-78923-INDR</Text>
            </View>
          </View>

          {/* Vendor Proof Item 2 */}
          <View style={[styles.vendorItemRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.vendorCategoryIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="basket-outline" size={18} color="#D97706" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.vendorTitleRow}>
                <Text style={styles.vendorName}>Sharma Kirana Store</Text>
                <Text style={styles.sealedTag}>SEALED &amp; READY</Text>
              </View>
              <Text style={styles.vendorSub}>
                Verified Bag Weight: <Text style={{ fontWeight: '700', color: '#059669' }}>5040 grams</Text>
              </Text>
              <Text style={styles.sealNumber}>Security Tape: #DST-90218-KIRANA</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.scanTapeBtn}
            onPress={handleScanSeal}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code-outline" size={16} color="#0055FF" style={{ marginRight: 6 }} />
            <Text style={styles.scanTapeText}>Scan Bag Seal Tape to Open</Text>
          </TouchableOpacity>
        </View>

        {/* 6. Ordered Items Summary & Bill */}
        <View style={styles.itemsSummaryCard}>
          <View style={styles.itemsHeaderRow}>
            <Text style={styles.itemsSectionTitle}>
              Items in this Order ({displayItems.length})
            </Text>
            <Text style={styles.paidBadge}>₹{totalRupees} &bull; Paid</Text>
          </View>

          {displayItems.map((item, idx) => (
            <View key={item.id || idx} style={styles.productRow}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.productThumb} />
              ) : (
                <View style={styles.productPlaceholder}>
                  <Ionicons name="cart-outline" size={16} color="#6B7280" />
                </View>
              )}

              <View style={styles.productInfoCol}>
                <Text style={styles.productNameText} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.productMetaText}>
                  {item.quantityLabel || 'Standard Pack'} &bull; Qty: {item.quantity}
                </Text>
              </View>

              <Text style={styles.productPriceText}>₹{item.price * item.quantity}</Text>
            </View>
          ))}

          <View style={styles.paymentInfoRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="card-outline" size={15} color="#4B5563" style={{ marginRight: 6 }} />
              <Text style={styles.paymentModeText}>Payment Mode:</Text>
            </View>
            <Text style={styles.paymentModeValue}>{paymentModeTitle}</Text>
          </View>

          {/* Action Links */}
          <View style={styles.orderActionsRow}>
            <TouchableOpacity
              style={styles.orderActionPill}
              onPress={() => Alert.alert('Invoice', 'Invoice sent to your registered email & phone.')}
              activeOpacity={0.75}
            >
              <Ionicons name="document-text-outline" size={14} color="#0055FF" style={{ marginRight: 4 }} />
              <Text style={styles.orderActionText}>Download Invoice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.orderActionPill}
              onPress={handleHelpPress}
              activeOpacity={0.75}
            >
              <Ionicons name="chatbubbles-outline" size={14} color="#0055FF" style={{ marginRight: 4 }} />
              <Text style={styles.orderActionText}>Need Help?</Text>
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
    backgroundColor: '#F4F5F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  orderIdBadge: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  helpBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#0055FF',
    fontWeight: '600',
    marginLeft: 4,
  },
  scrollContent: {
    paddingTop: 12,
  },
  heroCard: {
    backgroundColor: '#0055FF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0055FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  instantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  instantBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  timerLiveText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroEtaTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  heroEtaSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#E0E7FF',
    marginTop: 2,
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepCol: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDone: {
    backgroundColor: '#10B981',
  },
  stepCurrent: {
    backgroundColor: '#F59E0B',
  },
  stepPending: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  stepTextActive: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stepTextHighlight: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#FEF08A',
    fontWeight: '700',
  },
  stepTextPending: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#C7D2FE',
  },
  riderCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  riderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 12,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  riderInfoCol: {
    flex: 1,
  },
  riderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginRight: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ratingText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#B45309',
    marginLeft: 2,
    fontWeight: '700',
  },
  riderVehicleText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  callRiderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FDF2F8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  tipRowText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
    color: '#BE185D',
  },
  tipActionText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11.5,
    color: '#BE185D',
    fontWeight: '700',
  },
  otpPillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  otpLeftBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  keyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpCardTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10.5,
    color: '#92400E',
    letterSpacing: 0.5,
  },
  otpCardSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#B45309',
  },
  otpBadgeBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  otpDigits: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 18,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 4,
  },
  mandiProofCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  mandiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  mandiTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  verifiedTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  verifiedTagText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#059669',
    fontWeight: '700',
  },
  mandiDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 12,
  },
  vendorItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  vendorCategoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vendorName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  sealedTag: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#059669',
    fontWeight: '700',
  },
  vendorSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
  },
  sealNumber: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
  scanTapeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F5FF',
    borderRadius: 10,
    paddingVertical: 9,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D6E4FF',
  },
  scanTapeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#0055FF',
    fontWeight: '600',
  },
  itemsSummaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  itemsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
  },
  itemsSectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  paidBadge: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  productThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
  },
  productPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  productInfoCol: {
    flex: 1,
  },
  productNameText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#111827',
  },
  productMetaText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  productPriceText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  paymentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 4,
  },
  paymentModeText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#4B5563',
  },
  paymentModeValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#111827',
  },
  orderActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  orderActionPill: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  orderActionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#0055FF',
    fontWeight: '600',
  },
});

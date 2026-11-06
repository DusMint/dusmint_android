import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  RefreshControl,
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
import { useCartStore } from '../../state/useCartStore';
import { useOrderStore, PlacedOrder } from '../../state/useOrderStore';
import { OrderReceiptModal } from './widgets/OrderReceiptModal';

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
    status: passedStatus,
    deliveredAt: passedDeliveredAt,
    items: passedItems,
    totalRupees = 72,
    deliveryAddress = 'Flat 402, Royal Palms, Scheme 54, Vijay Nagar, Indore',
    paymentModeTitle = 'Google Pay (UPI)',
  } = route.params || {};

  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [liveDistance, setLiveDistance] = useState('1.1 km');
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(5);

  const storeOrders = useOrderStore((s) => s.orders);
  const matchedStoreOrder = storeOrders.find(
    (o) => o.id === orderId || o.orderCode === orderCode
  );

  // Status resolution
  const effectiveStatus = (
    order?.status ||
    passedStatus ||
    matchedStoreOrder?.status ||
    'on_the_way'
  ).toLowerCase();

  const isDelivered = effectiveStatus === 'delivered' || effectiveStatus === 'completed';
  const isCancelled = effectiveStatus === 'cancelled';
  const isOnTheWay = effectiveStatus === 'on_the_way';

  const displayItems =
    passedItems && passedItems.length > 0
      ? passedItems
      : matchedStoreOrder?.items && matchedStoreOrder.items.length > 0
      ? matchedStoreOrder.items
      : DEFAULT_ORDERED_ITEMS;

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
    // If order was just placed, ensure cart is clear
    useCartStore.getState().clearCart();
    fetchOrder();

    // Only poll live GPS when active & not delivered
    if (!isDelivered && !isCancelled) {
      const pollInterval = setInterval(() => {
        fetchOrder(true);
      }, 6000);
      return () => clearInterval(pollInterval);
    }
  }, [fetchOrder, isDelivered, isCancelled]);

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

  const handleRateDelivery = (stars: number) => {
    setUserRating(stars);
    Alert.alert(
      'Feedback Received ⭐',
      `Thank you for rating Rahul ${stars} star${stars > 1 ? 's' : ''}! We’ve shared your feedback with our delivery operations team.`
    );
  };

  const handleReorder = () => {
    displayItems.forEach((item) => {
      useCartStore.getState().addItem({
        id: item.id,
        vendorId: 'vendor-reorder',
        categoryId: 'cat-reorder',
        nameEn: item.name,
        unit: item.quantityLabel || '1 pc',
        stepQuantity: 1,
        pricePaise: item.price * 100,
        photoUrl: item.imageUrl,
        isInStock: true,
      });
    });

    Alert.alert(
      'Items Added to Cart',
      `${displayItems.length} items from Order #${order?.orderCode || orderCode} have been added to your cart.`,
      [
        { text: 'Keep Browsing', style: 'cancel' },
        {
          text: 'Go to Cart',
          onPress: () => navigation.navigate('Cart'),
        },
      ]
    );
  };

  // Synthesize PlacedOrder for Instamart Receipt modal
  const receiptOrder: PlacedOrder = matchedStoreOrder || {
    id: orderId || 'DM-ORDER',
    orderCode: order?.orderCode || orderCode,
    status: isDelivered ? 'delivered' : isCancelled ? 'cancelled' : 'on_the_way',
    slotName: 'Instant 9 Mins',
    createdAt: passedDeliveredAt || new Date().toISOString(),
    items: displayItems.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      quantityLabel: i.quantityLabel || 'Standard Pack',
      imageUrl: i.imageUrl,
    })),
    itemCount: displayItems.reduce((acc, i) => acc + (i.quantity || 1), 0),
    totalRupees: totalRupees,
    deliveryFeeRupees: 0,
    deliveryOtp: order?.deliveryOtp || '4291',
    deliveryAddress: deliveryAddress,
    paymentModeTitle: paymentModeTitle,
    storeName: 'Mandi Superstore, Vijay Nagar',
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. Top Navigation App Bar */}
      <View style={[styles.header, { paddingTop: topInset + 6 }]}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs', { screen: 'HomeTab' });
            }
          }}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>
            {isDelivered ? 'Order Delivered' : isCancelled ? 'Order Cancelled' : 'Live Order Tracking'}
          </Text>
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
        {/* 2. Hero Header: Conditional on Delivered vs Active vs Cancelled */}
        {isDelivered ? (
          // ================= DELIVERED HERO CARD =================
          <View style={[styles.heroCard, styles.heroCardDelivered]}>
            <View style={styles.heroTopRow}>
              <View style={[styles.instantBadge, styles.deliveredBadge]}>
                <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.instantBadgeText}>ORDER DELIVERED</Text>
              </View>
              <Text style={styles.heroDeliveredTimeBadge}>
                {passedDeliveredAt ? `${passedDeliveredAt}` : 'Today'}
              </Text>
            </View>

            <Text style={styles.heroEtaTitle}>Delivered in 9 Mins!</Text>
            <Text style={styles.heroEtaSubtitle}>
              Your fresh order was safely handed over at {deliveryAddress.split(',')[0] || 'doorstep'}.
            </Text>

            {/* 4-Stage Horizontal Progress Step Indicator - 100% COMPLETE */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '100%', backgroundColor: '#34D399' }]} />
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
                  <View style={[styles.stepCircle, styles.stepDone]}>
                    <Ionicons name="bicycle" size={12} color="#FFFFFF" />
                  </View>
                  <Text style={styles.stepTextActive}>Dispatched</Text>
                </View>

                <View style={styles.stepCol}>
                  <View style={[styles.stepCircle, styles.stepDone]}>
                    <Ionicons name="home" size={12} color="#FFFFFF" />
                  </View>
                  <Text style={styles.stepTextActive}>Delivered</Text>
                </View>
              </View>
            </View>
          </View>
        ) : isCancelled ? (
          // ================= CANCELLED HERO CARD =================
          <View style={[styles.heroCard, { backgroundColor: '#DC2626' }]}>
            <View style={styles.heroTopRow}>
              <View style={[styles.instantBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="close-circle" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.instantBadgeText}>ORDER CANCELLED</Text>
              </View>
            </View>
            <Text style={styles.heroEtaTitle}>Order Was Cancelled</Text>
            <Text style={styles.heroEtaSubtitle}>
              If any payment was deducted, 100% refund is initiated back to your source account.
            </Text>
          </View>
        ) : (
          // ================= ACTIVE LIVE TRACKING HERO CARD =================
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.instantBadge}>
                <Ionicons name="flash" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.instantBadgeText}>9 MINS INSTANT DELIVERY</Text>
              </View>
            </View>

            <Text style={styles.heroEtaTitle}>
              {isOnTheWay ? 'Arriving in 9 MINS' : 'Packing Fresh Items'}
            </Text>
            <Text style={styles.heroEtaSubtitle}>
              {isOnTheWay
                ? 'Delivery partner is on the way to your doorstep'
                : 'Packing your fresh items at Mandi Superstore, Vijay Nagar'}
            </Text>

            {/* 4-Stage Horizontal Progress Step Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: isOnTheWay ? '68%' : '35%' },
                  ]}
                />
              </View>

              <View style={styles.stepsRow}>
                <View style={styles.stepCol}>
                  <View style={[styles.stepCircle, styles.stepDone]}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                  <Text style={styles.stepTextActive}>Confirmed</Text>
                </View>

                <View style={styles.stepCol}>
                  <View
                    style={[
                      styles.stepCircle,
                      isOnTheWay ? styles.stepDone : styles.stepCurrent,
                    ]}
                  >
                    <Ionicons name="cube" size={12} color="#FFFFFF" />
                  </View>
                  <Text
                    style={isOnTheWay ? styles.stepTextActive : styles.stepTextHighlight}
                  >
                    Weighed
                  </Text>
                </View>

                <View style={styles.stepCol}>
                  <View
                    style={[
                      styles.stepCircle,
                      isOnTheWay ? styles.stepCurrent : styles.stepPending,
                    ]}
                  >
                    <Ionicons
                      name="bicycle"
                      size={14}
                      color={isOnTheWay ? '#FFFFFF' : '#9CA3AF'}
                    />
                  </View>
                  <Text
                    style={isOnTheWay ? styles.stepTextHighlight : styles.stepTextPending}
                  >
                    On the way
                  </Text>
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
        )}

        {/* 3. Live Route Map (Rendered ONLY when order is actively on the way) */}
        {!isDelivered && !isCancelled && (
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
        )}

        {/* 4. Delivery Partner & Doorstep Card */}
        {isDelivered ? (
          // ================= DELIVERED RIDER & FEEDBACK CARD =================
          <View style={styles.riderCard}>
            <View style={styles.riderTopRow}>
              <View style={[styles.riderAvatarBox, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="person" size={26} color="#059669" />
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
                  Delivered by DusMint Express Eco-EV
                </Text>
              </View>

              <View style={styles.deliveredPillBadge}>
                <Ionicons name="checkmark-done" size={14} color="#059669" style={{ marginRight: 3 }} />
                <Text style={styles.deliveredPillText}>Completed</Text>
              </View>
            </View>

            {/* Interactive Rating Prompt */}
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackTitle}>Rate delivery experience with Rahul:</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRateDelivery(star)}
                    activeOpacity={0.7}
                    style={styles.starTouch}
                  >
                    <Ionicons
                      name={(userRating || 0) >= star ? 'star' : 'star-outline'}
                      size={24}
                      color={(userRating || 0) >= star ? '#F59E0B' : '#D1D5DB'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Doorstep Delivery Verified Banner */}
            <View style={[styles.otpPillCard, styles.otpPillCardDelivered]}>
              <View style={styles.otpLeftBox}>
                <View style={[styles.keyIconCircle, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="shield-checkmark" size={16} color="#059669" />
                </View>
                <View style={{ marginLeft: 8 }}>
                  <Text style={[styles.otpCardTitle, { color: '#065F46' }]}>
                    DOORSTEP DELIVERY VERIFIED
                  </Text>
                  <Text style={[styles.otpCardSubtitle, { color: '#047857' }]}>
                    Handed over safely • Bag seal verified intact
                  </Text>
                </View>
              </View>

              <View style={[styles.otpBadgeBox, { borderColor: '#10B981', backgroundColor: '#ECFDF5', flexDirection: 'row', alignItems: 'center' }]}>
                <Text style={[styles.otpDigits, { color: '#065F46', fontSize: 14, letterSpacing: 1.5 }]}>
                  {order?.deliveryOtp || '4291'}
                </Text>
                <Ionicons name="checkmark-circle" size={13} color="#065F46" style={{ marginLeft: 4 }} />
              </View>
            </View>
          </View>
        ) : (
          // ================= ACTIVE RIDER CARD =================
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

            {/* Active Delivery OTP Card */}
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
        )}

        {/* 5. Ordered Items Summary & Bill */}
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
              onPress={() => setReceiptModalVisible(true)}
              activeOpacity={0.75}
            >
              <Ionicons name="document-text-outline" size={15} color="#0055FF" style={{ marginRight: 4 }} />
              <Text style={styles.orderActionText}>View Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.orderActionPill, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}
              onPress={handleReorder}
              activeOpacity={0.75}
            >
              <Ionicons name="repeat-outline" size={15} color="#0055FF" style={{ marginRight: 4 }} />
              <Text style={styles.orderActionText}>Order Again</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Instamart Style Receipt Modal */}
      <OrderReceiptModal
        visible={receiptModalVisible}
        onClose={() => setReceiptModalVisible(false)}
        order={receiptOrder}
        onReorder={handleReorder}
      />
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
  heroCardDelivered: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
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
  deliveredBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  deliveredPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  deliveredPillText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  heroDeliveredTimeBadge: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#E6FFFA',
  },
  instantBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9.5,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heroEtaTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 22,
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
  feedbackBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  feedbackTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11.5,
    color: '#4B5563',
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starTouch: {
    paddingHorizontal: 6,
    paddingVertical: 2,
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
  otpPillCardDelivered: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
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
    fontSize: 11.5,
    color: '#0055FF',
    fontWeight: '600',
  },
});

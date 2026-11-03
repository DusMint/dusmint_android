import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { useOrderStore, PlacedOrder } from '../../state/useOrderStore';
import { useCartStore } from '../../state/useCartStore';
import { dusmintApi } from '@dusmint/api-client';
import { OrderReceiptModal } from './widgets/OrderReceiptModal';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'OrdersTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const OrdersListScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<PlacedOrder | null>(null);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);

  // Read orders from Zustand store (ensures newly placed orders appear instantly!)
  const storeOrders = useOrderStore((s) => s.orders);

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
  );

  const loadOrders = useCallback(async () => {
    try {
      const backendOrders = await dusmintApi.getOrders();
      if (backendOrders && backendOrders.length > 0) {
        backendOrders.forEach((bo: any) => {
          const items: any[] =
            bo.items && bo.items.length > 0
              ? bo.items
              : [
                  {
                    id: 'it-1',
                    name: 'Fresh Desi Tomato (Tamatar)',
                    price: 35,
                    quantity: 1,
                    quantityLabel: '1 kg',
                    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200',
                  },
                  {
                    id: 'it-2',
                    name: 'Aashirvaad Shudh Chakki Atta',
                    price: 245,
                    quantity: 1,
                    quantityLabel: '5 kg',
                    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200',
                  },
                ];

          const mapped: PlacedOrder = {
            id: bo.id,
            orderCode: bo.orderCode || 'DM-ORDER',
            status: bo.status || 'placed',
            slotName: bo.slotName || 'Instant 9 Mins',
            createdAt: bo.createdAt || new Date().toISOString(),
            items,
            itemCount: bo.itemCount || items.reduce((acc, i) => acc + (i.quantity || 1), 0),
            totalRupees: Math.round((bo.totalPaise || 28500) / 100),
            deliveryFeeRupees: Math.round((bo.deliveryFeePaise || 0) / 100),
            deliveryOtp: bo.deliveryOtp || '7823',
            deliveryAddress: 'Flat 402, Royal Palms, Scheme 54, Vijay Nagar, Indore',
            paymentModeTitle: bo.paymentMode || 'Online UPI',
            storeName: bo.vendorParts?.[0]?.vendorName || 'Mandi Superstore, Vijay Nagar',
          };

          useOrderStore.getState().addOrder(mapped);
        });
      }
    } catch (err) {
      console.warn('Orders fetch error from backend:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    // Only poll if there are active (packing/on_the_way) orders
    const interval = setInterval(() => {
      const currentOrders = useOrderStore.getState().orders;
      const hasActive = currentOrders.some(
        (o) => o.status !== 'delivered' && o.status !== 'cancelled'
      );
      if (hasActive) {
        loadOrders();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, [loadOrders]);

  const activeOrders = storeOrders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );
  const pastOrders = storeOrders.filter(
    (o) => o.status === 'delivered' || o.status === 'cancelled'
  );

  const handleTrackOrder = (order: PlacedOrder) => {
    navigation.navigate('OrderTracking', {
      orderId: order.id,
      orderCode: order.orderCode,
      status: order.status,
      deliveredAt: order.createdAt,
      items: order.items,
      totalRupees: order.totalRupees,
      deliveryAddress: order.deliveryAddress,
      paymentModeTitle: order.paymentModeTitle,
    });
  };

  const handleReorder = (order: PlacedOrder) => {
    order.items.forEach((item) => {
      useCartStore.getState().addItem({
        id: item.id,
        vendorId: 'vendor-default',
        nameEn: item.name,
        pricePaise: item.price * 100,
        unit: item.quantityLabel || 'pack',
        stepQuantity: 1,
        categoryId: 'cat-default',
        photoUrl: item.imageUrl,
        isInStock: true,
      });
    });

    Alert.alert(
      'Reorder Added! 🛒',
      `${order.items.length} items from Order #${order.orderCode} have been added to your cart.`,
      [
        { text: 'Keep Browsing', style: 'cancel' },
        {
          text: 'Go to Cart',
          onPress: () => navigation.navigate('Cart'),
        },
      ]
    );
  };

  const handleViewReceipt = (order: PlacedOrder) => {
    setSelectedReceiptOrder(order);
    setReceiptModalVisible(true);
  };

  const handleSupport = () => {
    Alert.alert(
      'DusMint 24/7 Support',
      'Need help with any of your orders?\nCall: 1800-200-MANDI\nEmail: orders@dusmint.com',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. Header */}
      <View style={[styles.header, { paddingTop: topInset + 6 }]}>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSubtitle}>
            Live deliveries &amp; past receipts
          </Text>
        </View>

        <TouchableOpacity style={styles.supportBtn} onPress={handleSupport} activeOpacity={0.75}>
          <Ionicons name="headset-outline" size={18} color="#0055FF" />
          <Text style={styles.supportBtnText}>Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 2. Active Orders Section */}
        {activeOrders.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.livePulseDot} />
              <Text style={styles.sectionTitle}>
                ACTIVE DELIVERIES ({activeOrders.length})
              </Text>
            </View>

            {activeOrders.map((order) => {
              const visibleThumbs = order.items.slice(0, 3);
              const extraCount = order.items.length - visibleThumbs.length;

              return (
                <View key={order.id} style={styles.activeCard}>
                  {/* Store Name & ETA Pill */}
                  <View style={styles.activeCardTopRow}>
                    <View style={styles.storeRow}>
                      <View style={styles.storeIconCircle}>
                        <Ionicons name="storefront" size={16} color="#0055FF" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.activeStoreName} numberOfLines={1}>
                          {order.storeName}
                        </Text>
                        <Text style={styles.activeOrderCode}>
                          Order #{order.orderCode} &bull; Placed Today
                        </Text>
                      </View>
                    </View>

                    <View style={styles.activeEtaBadge}>
                      <Ionicons name="flash" size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
                      <Text style={styles.activeEtaText}>Arriving in 9 MINS</Text>
                    </View>
                  </View>

                  {/* Overlapping Item Avatars + Product Summary */}
                  <View style={styles.itemsPreviewRow}>
                    <View style={styles.avatarStack}>
                      {visibleThumbs.map((item, idx) => (
                        <View
                          key={item.id || idx}
                          style={[
                            styles.avatarWrap,
                            { marginLeft: idx === 0 ? 0 : -10, zIndex: 10 - idx },
                          ]}
                        >
                          {item.imageUrl ? (
                            <Image source={{ uri: item.imageUrl }} style={styles.avatarImg} />
                          ) : (
                            <View style={styles.avatarFallback}>
                              <Ionicons name="cart" size={14} color="#6B7280" />
                            </View>
                          )}
                        </View>
                      ))}
                      {extraCount > 0 && (
                        <View style={[styles.avatarWrap, styles.extraBadgeWrap, { marginLeft: -10, zIndex: 1 }]}>
                          <Text style={styles.extraBadgeText}>+{extraCount}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.itemNamesCol}>
                      <Text style={styles.itemNamesText} numberOfLines={1}>
                        {order.items.map((i) => i.name).join(', ')}
                      </Text>
                      <Text style={styles.itemCountPrice}>
                        {order.itemCount} items &bull; <Text style={{ color: '#111827', fontWeight: '700' }}>₹{order.totalRupees}</Text> (Paid)
                      </Text>
                    </View>
                  </View>

                  {/* Doorstep Delivery OTP Banner */}
                  <View style={styles.activeOtpBanner}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="key" size={15} color="#D97706" style={{ marginRight: 6 }} />
                      <Text style={styles.activeOtpTitle}>Doorstep Delivery OTP:</Text>
                    </View>
                    <View style={styles.otpValuePill}>
                      <Text style={styles.otpValueDigits}>{order.deliveryOtp || '4291'}</Text>
                    </View>
                  </View>

                  {/* Prominent Track Live Order Button */}
                  <TouchableOpacity
                    style={styles.trackLiveBtn}
                    onPress={() => handleTrackOrder(order)}
                    activeOpacity={0.88}
                  >
                    <Ionicons name="bicycle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.trackLiveBtnText}>Track Live Order on Map</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* 3. Past Orders Section */}
        {pastOrders.length > 0 && (
          <View style={[styles.sectionContainer, { marginTop: activeOrders.length > 0 ? 10 : 0 }]}>
            <Text style={styles.pastSectionTitle}>PAST ORDERS ({pastOrders.length})</Text>

            {pastOrders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <View key={order.id} style={styles.pastCard}>
                  {/* Top: Store & Delivered Badge */}
                  <View style={styles.pastTopRow}>
                    <View style={styles.pastStoreRow}>
                      <View style={styles.pastStoreIconCircle}>
                        <Ionicons name="storefront-outline" size={16} color="#4B5563" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.pastStoreName} numberOfLines={1}>
                          {order.storeName}
                        </Text>
                        <Text style={styles.pastDateText}>
                          Order #{order.orderCode} &bull; {formattedDate}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.deliveredChip}>
                      <Ionicons name="checkmark-circle" size={12} color="#059669" style={{ marginRight: 3 }} />
                      <Text style={styles.deliveredChipText}>Delivered</Text>
                    </View>
                  </View>

                  {/* Middle: Items List */}
                  <View style={styles.pastItemsBox}>
                    {order.items.map((item, idx) => (
                      <View key={item.id || idx} style={styles.pastItemRow}>
                        {item.imageUrl ? (
                          <Image source={{ uri: item.imageUrl }} style={styles.pastItemThumb} />
                        ) : (
                          <View style={styles.pastItemThumbFallback}>
                            <Ionicons name="basket-outline" size={14} color="#9CA3AF" />
                          </View>
                        )}
                        <Text style={styles.pastItemName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.pastItemQty}>x{item.quantity}</Text>
                        <Text style={styles.pastItemPrice}>₹{item.price * item.quantity}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Bottom: Total & Actions */}
                  <View style={styles.pastFooterRow}>
                    <View>
                      <Text style={styles.pastTotalLabel}>TOTAL PAID</Text>
                      <Text style={styles.pastTotalAmount}>₹{order.totalRupees}</Text>
                    </View>

                    <View style={styles.pastActionButtons}>
                      <TouchableOpacity
                        style={styles.receiptBtn}
                        onPress={() => handleViewReceipt(order)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.receiptBtnText}>View Receipt</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.reorderBtn}
                        onPress={() => handleReorder(order)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="repeat" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.reorderBtnText}>Reorder</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* 4. Empty State if zero orders */}
        {storeOrders.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="basket-outline" size={48} color="#0055FF" />
            </View>
            <Text style={styles.emptyTitle}>You haven't placed any orders yet</Text>
            <Text style={styles.emptySubtitle}>
              Order farm-fresh vegetables, fruits, dairy &amp; groceries in 9 mins!
            </Text>
            <TouchableOpacity
              style={styles.startShoppingBtn}
              onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
              activeOpacity={0.88}
            >
              <Text style={styles.startShoppingText}>Explore Fresh Store &rarr;</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Swiggy Instamart-Grade Order Receipt & Tax Invoice Modal */}
      <OrderReceiptModal
        visible={receiptModalVisible}
        onClose={() => setReceiptModalVisible(false)}
        order={selectedReceiptOrder}
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
    justifyContent: 'space-between',
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
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  supportBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#0055FF',
    fontWeight: '600',
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0055FF',
    marginRight: 6,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#0055FF',
    letterSpacing: 0.5,
  },
  pastSectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  activeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0055FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#EBF0FF',
  },
  activeCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  storeIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStoreName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  activeOrderCode: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  activeEtaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0055FF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeEtaText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  itemsPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  extraBadgeWrap: {
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  itemNamesCol: {
    flex: 1,
  },
  itemNamesText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#111827',
  },
  itemCountPrice: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  activeOtpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  activeOtpTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#92400E',
  },
  otpValuePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  otpValueDigits: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#B45309',
    fontWeight: '700',
    letterSpacing: 2,
  },
  trackLiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0055FF',
    borderRadius: 12,
    paddingVertical: 11,
    shadowColor: '#0055FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  trackLiveBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  pastCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  pastTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pastStoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  pastStoreIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastStoreName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  pastDateText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  deliveredChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deliveredChipText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '600',
  },
  pastItemsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  pastItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  pastItemThumb: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
  },
  pastItemThumbFallback: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pastItemName: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11.5,
    color: '#374151',
    flex: 1,
  },
  pastItemQty: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#6B7280',
    marginRight: 8,
  },
  pastItemPrice: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
    color: '#111827',
  },
  pastFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F3F4F6',
  },
  pastTotalLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 9.5,
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  pastTotalAmount: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  pastActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  receiptBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
    color: '#374151',
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#0055FF',
  },
  reorderBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  startShoppingBtn: {
    backgroundColor: '#0055FF',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#0055FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  startShoppingText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

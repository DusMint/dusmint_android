import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlacedOrder } from '../../../state/useOrderStore';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  visible: boolean;
  onClose: () => void;
  order: PlacedOrder | null;
  onReorder?: (order: PlacedOrder) => void;
}

export const OrderReceiptModal: React.FC<Props> = ({
  visible,
  onClose,
  order,
  onReorder,
}) => {
  if (!order) return null;

  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const itemsTotal = order.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const deliveryFee = order.deliveryFeeRupees || 0;
  const handlingFee = 5;
  const grandTotal = order.totalRupees || itemsTotal + deliveryFee + handlingFee;

  const isDelivered = order.status === 'delivered';

  const handleDownloadInvoice = () => {
    Alert.alert(
      'Invoice Downloaded',
      `Tax Invoice for Order #${order.orderCode} has been saved to your downloads.\nGSTIN: 23AABCS1429B1Z2`,
      [{ text: 'OK' }]
    );
  };

  const handleShareReceipt = async () => {
    try {
      const itemsList = order.items
        .map((i) => `• ${i.name} (x${i.quantity}) - ₹${i.price * i.quantity}`)
        .join('\n');
      await Share.share({
        title: `DusMint Receipt: #${order.orderCode}`,
        message: `DusMint Order Receipt #${order.orderCode}\nStore: ${order.storeName}\nDate: ${formattedDate}, ${formattedTime}\n\nItems:\n${itemsList}\n\nTotal Paid: ₹${grandTotal} via ${order.paymentModeTitle}\nDelivered To: ${order.deliveryAddress}`,
      });
    } catch {
      // ignore
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Drag Handle Indicator */}
              <View style={styles.dragHandleBox}>
                <View style={styles.dragHandle} />
              </View>

              {/* Header Bar */}
              <View style={styles.headerRow}>
                <View style={styles.headerTitleBox}>
                  <Text style={styles.headerTitle}>Order Receipt & Bill</Text>
                  <Text style={styles.headerSubtitle}>
                    Order #{order.orderCode} • {formattedDate}
                  </Text>
                </View>

                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={handleShareReceipt}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="share-outline" size={19} color="#374151" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={20} color="#374151" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* 1. Status & Store Hero Card */}
                <View style={styles.storeHeroCard}>
                  <View style={styles.storeRow}>
                    <View style={styles.storeIconCircle}>
                      <Ionicons name="storefront" size={20} color="#0066FF" />
                    </View>
                    <View style={styles.storeInfo}>
                      <Text style={styles.storeName}>{order.storeName}</Text>
                      <Text style={styles.storeMeta}>
                        Verified Mandi Partner • Vijay Nagar
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: isDelivered ? '#E4F7F1' : '#E3EEFB',
                        },
                      ]}
                    >
                      <Ionicons
                        name={isDelivered ? 'checkmark-circle' : 'time'}
                        size={12}
                        color={isDelivered ? '#1B9A5B' : '#0066FF'}
                        style={{ marginRight: 3 }}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: isDelivered ? '#1B9A5B' : '#0066FF' },
                        ]}
                      >
                        {isDelivered ? 'Delivered' : 'In Progress'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.slotDeliveryRow}>
                    <Ionicons name="flash" size={13} color="#F59E0B" />
                    <Text style={styles.slotDeliveryText}>
                      Delivery Slot: <Text style={styles.bold}>{order.slotName}</Text> • 9 Mins Guaranteed
                    </Text>
                  </View>
                </View>

                {/* 2. Items Ordered List */}
                <View style={styles.cardSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      ITEMS ORDERED ({order.items.length})
                    </Text>
                    <Text style={styles.sectionRightBadge}>Scale Verified ✅</Text>
                  </View>

                  {order.items.map((item, idx) => (
                    <View
                      key={item.id || idx}
                      style={[
                        styles.itemRow,
                        idx !== order.items.length - 1 && styles.itemRowBorder,
                      ]}
                    >
                      <View style={styles.vegSquare}>
                        <View style={styles.vegDot} />
                      </View>

                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQuantityLabel}>
                          {item.quantityLabel || 'Standard Pack'} • Qty: {item.quantity}
                        </Text>
                      </View>

                      <View style={styles.itemPriceBox}>
                        <Text style={styles.itemPrice}>
                          ₹{item.price * item.quantity}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* 3. Detailed Bill Summary (Instamart Format) */}
                <View style={styles.cardSection}>
                  <Text style={styles.sectionTitle}>BILL SUMMARY</Text>

                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Item Total</Text>
                    <Text style={styles.billValue}>₹{itemsTotal}</Text>
                  </View>

                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Handling Fee</Text>
                    <View style={styles.strikethroughRow}>
                      <Text style={styles.strikeText}>₹15</Text>
                      <Text style={styles.billValue}>₹{handlingFee}</Text>
                    </View>
                  </View>

                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Delivery Partner Fee</Text>
                    <View style={styles.strikethroughRow}>
                      <Text style={styles.strikeText}>₹25</Text>
                      <Text style={styles.freeGreenText}>
                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Taxes & GST (Included)</Text>
                    <Text style={styles.billValue}>₹0</Text>
                  </View>

                  <View style={styles.dashedDivider} />

                  <View style={styles.grandTotalRow}>
                    <View>
                      <Text style={styles.grandTotalLabel}>Total Paid</Text>
                      <Text style={styles.savingsPill}>
                        Saved ₹35 on this order 🥳
                      </Text>
                    </View>
                    <Text style={styles.grandTotalValue}>₹{grandTotal}</Text>
                  </View>

                  {/* Payment Mode Banner */}
                  <View style={styles.paymentModeBanner}>
                    <View style={styles.paymentModeLeft}>
                      <Ionicons name="card" size={16} color="#0066FF" />
                      <Text style={styles.paymentModeText}>
                        Paid via {order.paymentModeTitle || 'Google Pay (UPI)'}
                      </Text>
                    </View>
                    <View style={styles.paidBadge}>
                      <Ionicons name="checkmark-done" size={13} color="#1B9A5B" />
                      <Text style={styles.paidBadgeText}>PAID</Text>
                    </View>
                  </View>
                </View>

                {/* 4. Delivery Address & Handover */}
                <View style={styles.cardSection}>
                  <Text style={styles.sectionTitle}>DELIVERY DETAILS</Text>

                  <View style={styles.addressRow}>
                    <Ionicons
                      name="location-sharp"
                      size={18}
                      color="#0066FF"
                      style={{ marginTop: 2, marginRight: 8 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.addressLabel}>Delivered To</Text>
                      <Text style={styles.addressText}>
                        {order.deliveryAddress}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.otpRow}>
                    <View style={styles.otpPill}>
                      <Ionicons name="key-outline" size={13} color="#666666" />
                      <Text style={styles.otpLabel}>Doorstep OTP:</Text>
                      <Text style={styles.otpCode}>{order.deliveryOtp || '4291'}</Text>
                    </View>
                    <Text style={styles.verifiedText}>Verified by Partner ✅</Text>
                  </View>
                </View>

                {/* 5. Download Invoice Button */}
                <TouchableOpacity
                  style={styles.downloadInvoiceBtn}
                  onPress={handleDownloadInvoice}
                  activeOpacity={0.8}
                >
                  <Ionicons name="document-text-outline" size={18} color="#0066FF" />
                  <Text style={styles.downloadInvoiceText}>
                    Download Tax Invoice (PDF)
                  </Text>
                </TouchableOpacity>

                {/* Need Help link */}
                <TouchableOpacity
                  style={styles.helpLinkBox}
                  onPress={() => {
                    onClose();
                    Alert.alert(
                      'DusMint Support',
                      'Need help with this order? Call 1800-DUSMINT or chat in app.'
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.helpLinkText}>Need help with this order?</Text>
                </TouchableOpacity>

                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  dragHandleBox: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  headerSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  storeHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  storeMeta: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    fontWeight: '700',
  },
  slotDeliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 4,
  },
  slotDeliveryText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11.5,
    color: '#475569',
  },
  bold: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  sectionRightBadge: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10.5,
    fontWeight: '600',
    color: '#16A34A',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  vegSquare: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#16A34A',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: InstamartColors.ink,
    lineHeight: 18,
  },
  itemQuantityLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  itemPriceBox: {
    marginLeft: 8,
  },
  itemPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  billLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12.5,
    color: '#475569',
  },
  billValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12.5,
    fontWeight: '600',
    color: InstamartColors.ink,
  },
  strikethroughRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strikeText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  freeGreenText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  dashedDivider: {
    height: 1,
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  grandTotalLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  savingsPill: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
    marginTop: 2,
  },
  grandTotalValue: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 18,
    fontWeight: '800',
    color: InstamartColors.ink,
  },
  paymentModeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
  },
  paymentModeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentModeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11.5,
    color: '#334155',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  paidBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addressLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#64748B',
  },
  addressText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: InstamartColors.ink,
    marginTop: 1,
    lineHeight: 17,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  otpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  otpLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#64748B',
  },
  otpCode: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: InstamartColors.ink,
    letterSpacing: 1,
  },
  verifiedText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#16A34A',
  },
  downloadInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    height: 44,
    gap: 8,
    marginTop: 4,
  },
  downloadInvoiceText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: '#0066FF',
  },
  helpLinkBox: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  helpLinkText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#64748B',
    textDecorationLine: 'underline',
  },
});


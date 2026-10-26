import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius, RoundButton, TrustBadge } from '@dusmint/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderTracking'>;

export const OrderTrackingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { orderId } = route.params;

  const milestones = [
    { title: 'Order Placed', time: '4:15 PM', done: true },
    { title: 'Vendors Packed & Scale Verified', time: '4:45 PM', done: true },
    { title: 'Rider Collected Sealed Bags', time: '5:10 PM', done: true },
    { title: 'Out for Delivery (Arriving in 15 mins)', time: '5:25 PM', active: true },
    { title: 'Delivered at Doorstep', time: 'Estimated 5:40 PM', done: false },
  ];

  const handleScanSeal = () => {
    Alert.alert(
      'Scan Tamper-Proof Seal QR',
      'Point camera at the unique QR code on the bag tape. This verifies the bag was untampered and opens your 30-minute inspection claim window.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Scan',
          onPress: () => {
            navigation.navigate('ReportClaim', { orderId });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={require('../../../assets/img/btn_back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.orderIdText}>ORD-261026-0042</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* OTP Callout Box */}
        <View style={styles.otpCard}>
          <View style={styles.otpHeader}>
            <Text style={styles.otpTitle}>Doorstep Delivery OTP</Text>
            <Text style={styles.otpSubtitle}>
              Give this 4-digit code to the rider when receiving your bags
            </Text>
          </View>
          <View style={styles.otpBadge}>
            <Text style={styles.otpNumber}>4829</Text>
          </View>
        </View>

        {/* Status Milestones Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live Status</Text>

          <View style={styles.timeline}>
            {milestones.map((m, idx) => (
              <View key={idx} style={styles.milestoneRow}>
                <View style={styles.timelineIndicator}>
                  <View
                    style={[
                      styles.circle,
                      m.done
                        ? styles.circleDone
                        : m.active
                        ? styles.circleActive
                        : styles.circlePending,
                    ]}
                  >
                    {m.done ? (
                      <Text style={styles.checkMark}>✓</Text>
                    ) : m.active ? (
                      <View style={styles.pulseDot} />
                    ) : null}
                  </View>
                  {idx < milestones.length - 1 ? (
                    <View
                      style={[
                        styles.line,
                        m.done ? styles.lineDone : styles.linePending,
                      ]}
                    />
                  ) : null}
                </View>

                <View style={styles.milestoneContent}>
                  <Text
                    style={[
                      styles.milestoneTitle,
                      m.active ? styles.milestoneActiveTitle : null,
                    ]}
                  >
                    {m.title}
                  </Text>
                  <Text style={styles.milestoneTime}>{m.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Vendor Scale Proof Summary */}
        <View style={styles.card}>
          <View style={styles.vendorProofHeader}>
            <Text style={styles.cardTitle}>Vendor Packing Proof</Text>
            <TrustBadge type="weight_verified" />
          </View>
          <Text style={styles.proofDesc}>
            Items were weighed on electronic Bluetooth scale and sealed with QR tape before dispatch.
          </Text>

          <View style={styles.proofBox}>
            <Text style={styles.shopName}>Patidar Fresh Sabzi Mandi</Text>
            <Text style={styles.scaleReading}>
              Logged Bag Weight: <Text style={styles.boldWeight}>2,040 grams</Text> (Expected: 2,000 g)
            </Text>
            <Text style={styles.sealCode}>Seal QR Code: #DST-78923-INDR</Text>
          </View>
        </View>

        {/* Scan Seal QR CTA */}
        <View style={styles.scanSection}>
          <Text style={styles.scanHeading}>Receiving your delivery?</Text>
          <Text style={styles.scanSub}>
            Scan the bag seal tape when opening to confirm bag integrity and activate your 30-minute claim window.
          </Text>

          <RoundButton
            title="📷 Scan Bag Seal QR to Open"
            onPress={handleScanSeal}
            type="orange"
            style={styles.scanBtn}
          />
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: {
    paddingRight: Spacing.md,
  },
  backArrow: {
    fontSize: 22,
    color: Colors.textPrimary,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  orderIdText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.secondary,
  },
  scroll: {
    padding: Spacing.base,
    paddingBottom: 40,
  },
  otpCard: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otpHeader: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  otpTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.base,
    color: '#92400E',
  },
  otpSubtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  otpBadge: {
    backgroundColor: '#92400E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  otpNumber: {
    color: Colors.textWhite,
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: 24,
    letterSpacing: 4,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  timeline: {
    marginTop: Spacing.md,
  },
  milestoneRow: {
    flexDirection: 'row',
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleDone: {
    backgroundColor: Colors.primary,
  },
  circleActive: {
    backgroundColor: Colors.orange,
  },
  circlePending: {
    backgroundColor: '#E5E7EB',
  },
  checkMark: {
    color: Colors.textWhite,
    fontSize: 12,
    fontFamily: Typography.fontFamily.headingBold,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.textWhite,
  },
  line: {
    width: 2,
    height: 34,
  },
  lineDone: {
    backgroundColor: Colors.primary,
  },
  linePending: {
    backgroundColor: '#E5E7EB',
  },
  milestoneContent: {
    flex: 1,
    paddingBottom: Spacing.md,
  },
  milestoneTitle: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  milestoneActiveTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    color: Colors.orange,
  },
  milestoneTime: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  vendorProofHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proofDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginVertical: Spacing.xs,
  },
  proofBox: {
    backgroundColor: Colors.surfaceCream,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: 4,
  },
  shopName: {
    fontFamily: Typography.fontFamily.heading,
    fontSize: Typography.fontSize.xs,
    color: Colors.textPrimary,
  },
  scaleReading: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  boldWeight: {
    fontFamily: Typography.fontFamily.headingBold,
    color: Colors.primary,
  },
  sealCode: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 10,
    color: Colors.secondary,
    marginTop: 2,
  },
  scanSection: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  scanHeading: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.sm,
    color: '#9A3412',
  },
  scanSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: '#C2410C',
    textAlign: 'center',
    marginVertical: 6,
  },
  scanBtn: {
    marginTop: 6,
    width: '90%',
  },
});

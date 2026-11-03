import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderCelebrationModalProps {
  visible: boolean;
  orderCode?: string;
  totalRupees?: number;
  deliveryAddress?: string;
  onComplete: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 12 festive confetti particle configurations
const CONFETTI_PARTICLES = [
  { color: '#0055FF', size: 10, targetX: -90, targetY: -140 },
  { color: '#10B981', size: 8, targetX: 100, targetY: -120 },
  { color: '#F59E0B', size: 12, targetX: -120, targetY: -50 },
  { color: '#EC4899', size: 9, targetX: 110, targetY: -40 },
  { color: '#8B5CF6', size: 11, targetX: -70, targetY: 70 },
  { color: '#3B82F6', size: 8, targetX: 80, targetY: 80 },
  { color: '#10B981', size: 12, targetX: -130, targetY: 20 },
  { color: '#F59E0B', size: 9, targetX: 130, targetY: 10 },
  { color: '#EF4444', size: 7, targetX: -40, targetY: -160 },
  { color: '#06B6D4', size: 10, targetX: 45, targetY: -150 },
  { color: '#F43F5E', size: 8, targetX: -100, targetY: 120 },
  { color: '#10B981', size: 11, targetX: 95, targetY: 130 },
];

export const OrderCelebrationModal: React.FC<OrderCelebrationModalProps> = ({
  visible,
  orderCode = 'DM-84920',
  totalRupees = 72,
  deliveryAddress = 'Flat 402, Royal Palms, Vijay Nagar',
  onComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      confettiAnim.setValue(0);

      // Trigger spring pop-up and confetti burst simultaneously
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]).start();

      // Automatically advance to Live Tracking after 2.2 seconds
      const timer = setTimeout(() => {
        onComplete();
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Confetti particles radiating outward */}
          {CONFETTI_PARTICLES.map((particle, idx) => {
            const translateX = confettiAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, particle.targetX],
            });
            const translateY = confettiAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, particle.targetY],
            });
            const scale = confettiAnim.interpolate({
              inputRange: [0, 0.7, 1],
              outputRange: [0, 1.2, 0.8],
            });

            return (
              <Animated.View
                key={idx}
                style={[
                  styles.confettiDot,
                  {
                    backgroundColor: particle.color,
                    width: particle.size,
                    height: particle.size,
                    borderRadius: particle.size / 2,
                    transform: [{ translateX }, { translateY }, { scale }],
                  },
                ]}
              />
            );
          })}

          {/* Big Green Animated Checkmark Badge */}
          <View style={styles.checkCircleGlow}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={44} color="#FFFFFF" />
            </View>
          </View>

          {/* Celebration Titles */}
          <Text style={styles.title}>Order Confirmed! 🎉</Text>
          <Text style={styles.subtitle}>
            Arriving at your doorstep in <Text style={styles.highlightMins}>9 mins</Text>
          </Text>

          {/* Order Details Mini-Pills */}
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Ionicons name="receipt-outline" size={15} color="#0055FF" />
              <Text style={styles.detailLabel}>Order ID:</Text>
              <Text style={styles.detailValue}>{orderCode}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle-outline" size={15} color="#10B981" />
              <Text style={styles.detailLabel}>Total Paid:</Text>
              <Text style={styles.detailValueBold}>₹{totalRupees}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="home-outline" size={15} color="#6B7280" />
              <Text style={styles.detailLabel}>Delivering to:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {deliveryAddress}
              </Text>
            </View>
          </View>

          {/* Instant Track CTA */}
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={onComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.trackBtnText}>Track Live Order &rarr;</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 30, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
    position: 'relative',
  },
  confettiDot: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    zIndex: 1,
  },
  checkCircleGlow: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    zIndex: 2,
  },
  checkCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  highlightMins: {
    color: '#0055FF',
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
  },
  detailsBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  detailLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11.5,
    color: '#6B7280',
    marginLeft: 6,
    marginRight: 4,
  },
  detailValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
    color: '#1E293B',
    flex: 1,
  },
  detailValueBold: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
  },
  trackBtn: {
    width: '100%',
    backgroundColor: '#0055FF',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0055FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  trackBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

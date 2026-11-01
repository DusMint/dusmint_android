import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  onStartShopping: () => void;
}

export const EmptyCartView: React.FC<Props> = ({ onStartShopping }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="cart-outline" size={54} color="#8FB6E8" />
      </View>

      <Text style={styles.title}>Your cart is empty</Text>
      <Text style={styles.subtitle}>
        Add fresh sabzi, dairy and daily essentials to get superfast 10-minute delivery.
      </Text>

      <TouchableOpacity
        style={styles.startBtn}
        onPress={onStartShopping}
        activeOpacity={0.8}
      >
        <Text style={styles.startBtnText}>Start shopping</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#F1F2F6',
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#E3EEFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: InstamartColors.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  startBtn: {
    borderWidth: 1.5,
    borderColor: InstamartColors.accentBlue,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: '#FFFFFF',
  },
  startBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: InstamartColors.accentBlue,
  },
});


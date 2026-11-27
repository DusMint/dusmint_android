import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onStartShopping: () => void;
}

export const EmptyCartView: React.FC<Props> = ({ onStartShopping }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="cart-outline" size={46} color="#047A36" />
      </View>

      <Text style={styles.title}>Your cart is empty</Text>
      <Text style={styles.subtitle}>
        Add fresh fruits, veggies, dairy and daily essentials to get delivery at your doorstep.
      </Text>

      <TouchableOpacity
        style={styles.startBtn}
        onPress={onStartShopping}
        activeOpacity={0.85}
      >
        <Text style={styles.startBtnText}>Start Shopping</Text>
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
    backgroundColor: '#FFFFFF',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 26,
  },
  startBtn: {
    backgroundColor: '#047A36',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 34,
    elevation: 2,
    shadowColor: '#047A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  startBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14.5,
    color: '#FFFFFF',
  },
});

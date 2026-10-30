import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { useCartStore } from '../../../state/useCartStore';

export const FreeDeliveryStrip: React.FC = () => {
  const totalPaise = useCartStore((s) => s.getTotalPaise());
  const thresholdPaise = 99 * 100;
  const isUnlocked = totalPaise >= thresholdPaise;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {isUnlocked
          ? '🎉 You unlocked FREE DELIVERY on this order!'
          : 'FREE DELIVERY on orders above ₹99'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: InstamartColors.freeDeliveryBg,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: InstamartColors.freeDeliveryText,
    textAlign: 'center',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  isLocating: boolean;
  onUseCurrentLocation: () => void;
  onAddNewAddress: () => void;
}

export const LocationActionButtons: React.FC<Props> = ({
  isLocating,
  onUseCurrentLocation,
  onAddNewAddress,
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Use Current Location */}
      <TouchableOpacity
        style={styles.btn}
        onPress={onUseCurrentLocation}
        disabled={isLocating}
        activeOpacity={0.8}
      >
        {isLocating ? (
          <ActivityIndicator size="small" color={InstamartColors.accentBlue} />
        ) : (
          <Ionicons name="locate" size={17} color={InstamartColors.accentBlue} />
        )}
        <Text style={styles.btnText}>Use Current Location</Text>
      </TouchableOpacity>

      {/* 2. Add New Address */}
      <TouchableOpacity
        style={styles.btn}
        onPress={onAddNewAddress}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={18} color={InstamartColors.accentBlue} />
        <Text style={styles.btnText}>Add New Address</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    gap: 10,
  },
  btn: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E4EA',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  btnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
    fontWeight: '600',
    color: InstamartColors.ink,
  },
});


import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useLocationStore } from '../../state/useLocationStore';
import { dusmintApi } from '@dusmint/api-client';
import { deduplicateAddress } from '../../services/locationService';

// Data & Widgets
import { SavedAddressItem } from './data/locationData';
import { LocationAppBar } from './widgets/LocationAppBar';
import { SavedAddressesCard } from './widgets/SavedAddressesCard';
import { AddNewAddressModal } from './widgets/AddNewAddressModal';

type Props = NativeStackScreenProps<RootStackParamList, any>;

export const SelectLocationScreen: React.FC<Props> = ({ navigation }) => {
  const setUserLocation = useLocationStore((s) => s.setUserLocation);
  const storeSavedAddresses = useLocationStore((s) => s.savedAddresses);
  const addSavedAddress = useLocationStore((s) => s.addSavedAddress);
  const setStoreSavedAddresses = useLocationStore((s) => s.setSavedAddresses);
  const deleteStoreSavedAddress = useLocationStore((s) => s.deleteSavedAddress);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load real saved addresses from Supabase DB / Fastify backend
  const loadSavedAddresses = useCallback(async () => {
    try {
      const backendAddrs = await dusmintApi.getSavedAddresses();
      if (backendAddrs && backendAddrs.length > 0) {
        const mapped: SavedAddressItem[] = backendAddrs.map((a, idx) => ({
          id: a.id,
          label: (a.label ? a.label.charAt(0).toUpperCase() + a.label.slice(1) : 'Home') as any,
          name: a.label ? a.label.charAt(0).toUpperCase() + a.label.slice(1) : 'Home',
          houseNo: a.houseNo || 'Flat 402',
          streetArea: a.streetArea || a.landmark || 'Vijay Nagar, Indore',
          landmark: a.landmark,
          pincode: a.pincode || '',
          distanceKm: '0.2 km',
          latitude: a.latitude || 22.7533,
          longitude: a.longitude || 75.8937,
          isSelected: a.isDefault || idx === 0,
          isDefault: a.isDefault || false,
        }));
        const existing = useLocationStore.getState().savedAddresses;
        const merged = [...mapped];
        for (const loc of existing) {
          if (!merged.some((m) => m.id === loc.id || (m.houseNo === loc.houseNo && m.streetArea === loc.streetArea))) {
            merged.push(loc);
          }
        }
        setStoreSavedAddresses(merged);
      }
    } catch {
      // Maintain local store addresses
    }
  }, [setStoreSavedAddresses]);

  useFocusEffect(
    useCallback(() => {
      loadSavedAddresses();
    }, [loadSavedAddresses])
  );

  const handleSelectAddress = (address: SavedAddressItem) => {
    // 1. Mark as selected
    setStoreSavedAddresses(
      storeSavedAddresses.map((a) => ({
        ...a,
        isSelected: a.id === address.id,
      }))
    );

    // 2. Sync with global location store - compute proper shortAddress without losing real address!
    const shortAddr = deduplicateAddress(
      address.landmark
        ? `${address.landmark}, ${address.streetArea}`
        : address.streetArea || address.houseNo || 'Vijay Nagar, Indore'
    );

    const fullAddr = deduplicateAddress(
      [address.houseNo, address.streetArea, address.pincode].filter(Boolean).join(', ')
    );

    setUserLocation({
      latitude: address.latitude,
      longitude: address.longitude,
      address: fullAddr,
      shortAddress: shortAddr,
      locality: address.streetArea,
      city: address.streetArea.includes('Delhi') ? 'Delhi' : 'Indore',
      pincode: address.pincode,
    });

    useLocationStore.getState().setAddress({
      id: address.id,
      userId: '',
      label: address.label.toLowerCase() as any,
      houseNo: address.houseNo,
      streetArea: address.streetArea,
      landmark: address.landmark,
      latitude: address.latitude,
      longitude: address.longitude,
      pincode: address.pincode,
      isDefault: address.isDefault,
    });

    // 3. Pop back to Home / Cart
    navigation.goBack();
  };

  const handleEditAddress = (address: SavedAddressItem) => {
    navigation.navigate('LocationDetails', {
      locality: address.streetArea,
      fullAddress: [address.houseNo, address.streetArea, address.pincode].filter(Boolean).join(', '),
      latitude: address.latitude,
      longitude: address.longitude,
      pincode: address.pincode,
    });
  };

  const handleSaveNewAddress = (newAddr: SavedAddressItem) => {
    addSavedAddress(newAddr);
    handleSelectAddress(newAddr);
    dusmintApi.saveAddress({
      label: newAddr.label.toLowerCase() as any,
      houseNo: newAddr.houseNo,
      buildingName: newAddr.landmark,
      streetArea: newAddr.streetArea,
      landmark: newAddr.landmark,
      pincode: newAddr.pincode,
      latitude: newAddr.latitude,
      longitude: newAddr.longitude,
      isDefault: true,
    }).catch(() => {});
  };

  const handleSetDefault = (address: SavedAddressItem) => {
    setStoreSavedAddresses(
      storeSavedAddresses.map((a) => ({
        ...a,
        isDefault: a.id === address.id,
      }))
    );
  };

  const handleDeleteAddress = (address: SavedAddressItem) => {
    if (address.isSelected) {
      Alert.alert(
        'Cannot Delete',
        'This is your currently active delivery address. Please select another address first.'
      );
      return;
    }

    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${address.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteStoreSavedAddress(address.id);
            dusmintApi.deleteAddress(address.id).catch(() => {});
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* 1. App Bar */}
      <LocationAppBar onBackPress={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <SavedAddressesCard
          addresses={storeSavedAddresses}
          onSelect={handleSelectAddress}
          onEdit={handleEditAddress}
          onSetDefault={handleSetDefault}
          onDelete={handleDeleteAddress}
          onAddNewAddress={() => navigation.navigate('ConfirmLocationMap')}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add New Address Modal */}
      <AddNewAddressModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewAddress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 24,
  },
});

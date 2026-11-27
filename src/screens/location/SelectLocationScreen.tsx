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

// Data & Widgets
import { SavedAddressItem } from './data/locationData';
import { LocationAppBar } from './widgets/LocationAppBar';
import { SavedAddressesCard } from './widgets/SavedAddressesCard';
import { AddressMenuSheet } from './widgets/AddressMenuSheet';
import { AddNewAddressModal } from './widgets/AddNewAddressModal';

type Props = NativeStackScreenProps<RootStackParamList, any>;

export const SelectLocationScreen: React.FC<Props> = ({ navigation }) => {
  const setUserLocation = useLocationStore((s) => s.setUserLocation);
  const storeSavedAddresses = useLocationStore((s) => s.savedAddresses);
  const addSavedAddress = useLocationStore((s) => s.addSavedAddress);
  const setStoreSavedAddresses = useLocationStore((s) => s.setSavedAddresses);
  const deleteStoreSavedAddress = useLocationStore((s) => s.deleteSavedAddress);

  const [menuAddress, setMenuAddress] = useState<SavedAddressItem | null>(null);
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
          pincode: a.pincode || '452010',
          distanceKm: '0.2 km',
          latitude: a.latitude || 22.7533,
          longitude: a.longitude || 75.8937,
          isSelected: a.isDefault || idx === 0,
          isDefault: a.isDefault || false,
        }));
        setStoreSavedAddresses(mapped);
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

    // 2. Sync with global location store
    const fullAddr = `${address.houseNo}, ${address.streetArea}, Indore - ${address.pincode}`;
    setUserLocation({
      latitude: address.latitude,
      longitude: address.longitude,
      address: fullAddr,
      shortAddress: address.name,
      locality: address.streetArea,
      city: 'Indore',
      pincode: address.pincode,
    });

    // 3. Pop back to Home / Cart
    navigation.goBack();
  };

  const handleSaveNewAddress = (newAddr: SavedAddressItem) => {
    addSavedAddress(newAddr);
    handleSelectAddress(newAddr);
    // Sync to backend DB asynchronously
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
    deleteStoreSavedAddress(address.id);
    // Delete from backend DB asynchronously
    dusmintApi.deleteAddress(address.id).catch(() => {});
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
          onOpenMenu={(addr) => setMenuAddress(addr)}
          onAddNewAddress={() => navigation.navigate('ConfirmLocationMap')}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 3-Dot Address Menu Sheet */}
      <AddressMenuSheet
        visible={menuAddress !== null}
        address={menuAddress}
        onClose={() => setMenuAddress(null)}
        onEdit={() => setIsAddModalOpen(true)}
        onSetDefault={handleSetDefault}
        onDelete={handleDeleteAddress}
      />

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
    paddingBottom: 20,
  },
});

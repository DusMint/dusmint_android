import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useLocationStore } from '../../state/useLocationStore';
import { dusmintApi } from '@dusmint/api-client';
import { searchPlacesAutocomplete } from '../../services/locationService';

// Data & Widgets
import {
  INITIAL_SAVED_ADDRESSES,
  MOCK_PLACES_DATABASE,
  SavedAddressItem,
  PlaceSuggestion,
} from './data/locationData';
import { LocationAppBar } from './widgets/LocationAppBar';
import { LocationSearchField } from './widgets/LocationSearchField';
import { LocationActionButtons } from './widgets/LocationActionButtons';
import { SavedAddressesCard } from './widgets/SavedAddressesCard';
import { SearchResultsList } from './widgets/SearchResultsList';
import { AddressMenuSheet } from './widgets/AddressMenuSheet';
import { AddNewAddressModal } from './widgets/AddNewAddressModal';

type Props = NativeStackScreenProps<RootStackParamList, any>;

export const SelectLocationScreen: React.FC<Props> = ({ navigation }) => {
  const setUserLocation = useLocationStore((s) => s.setUserLocation);
  const fetchUserLocation = useLocationStore((s) => s.fetchUserLocation);
  const isLocatingStore = useLocationStore((s) => s.isLocating);

  const [searchQuery, setSearchQuery] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>(INITIAL_SAVED_ADDRESSES);
  const [remoteResults, setRemoteResults] = useState<PlaceSuggestion[]>([]);
  const [menuAddress, setMenuAddress] = useState<SavedAddressItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

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
        setSavedAddresses(mapped);
      } else {
        setSavedAddresses(INITIAL_SAVED_ADDRESSES);
      }
    } catch {
      setSavedAddresses(INITIAL_SAVED_ADDRESSES);
    }
  }, []);

  useEffect(() => {
    loadSavedAddresses();
  }, [loadSavedAddresses]);

  // Real-time place autocomplete via Places/Ola Maps API
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setRemoteResults([]);
      return;
    }

    let active = true;
    searchPlacesAutocomplete(q)
      .then((res) => {
        if (active && res && res.length > 0) {
          const mapped: PlaceSuggestion[] = res.map((r) => ({
            id: r.id,
            mainText: r.title,
            secondaryText: r.address || r.subtitle,
            latitude: r.lat,
            longitude: r.lng,
          }));
          setRemoteResults(mapped);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [searchQuery]);

  // Combined search results (Remote Places API + Quick Local Presets)
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];

    const local = MOCK_PLACES_DATABASE.filter(
      (p) =>
        p.mainText.toLowerCase().includes(q) ||
        p.secondaryText.toLowerCase().includes(q)
    );

    if (remoteResults.length > 0) {
      const existingNames = new Set(remoteResults.map((r) => r.mainText.toLowerCase()));
      const uniqueLocal = local.filter((l) => !existingNames.has(l.mainText.toLowerCase()));
      return [...remoteResults, ...uniqueLocal];
    }
    return local;
  }, [searchQuery, remoteResults]);

  const handleSelectAddress = (address: SavedAddressItem) => {
    // 1. Mark as selected
    setSavedAddresses((prev) =>
      prev.map((a) => ({
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

  const handleSelectPlace = (place: PlaceSuggestion) => {
    navigation.navigate('ConfirmLocationMap', {
      initialLocality: place.mainText,
      initialAddress: `${place.mainText}, ${place.secondaryText}`,
    });
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const resolved = await fetchUserLocation();
      setIsLocating(false);
      if (resolved) {
        setUserLocation({
          latitude: resolved.latitude,
          longitude: resolved.longitude,
          address: resolved.fullAddress,
          shortAddress: resolved.shortAddress || 'Current Location',
          locality: resolved.locality,
          city: resolved.city,
          pincode: resolved.pincode,
        });
        navigation.goBack();
      } else {
        // Fallback simulated Indore GPS
        setUserLocation({
          latitude: 22.7533,
          longitude: 75.8937,
          address: 'Indore Vijay Nagar, Scheme 54, Indore - 452010',
          shortAddress: 'Vijay Nagar',
          locality: 'Vijay Nagar',
          city: 'Indore',
          pincode: '452010',
        });
        navigation.goBack();
      }
    } catch {
      setIsLocating(false);
      Alert.alert('GPS Location', 'Unable to fetch current location. Please check GPS settings.');
    }
  };

  const handleSaveNewAddress = (newAddr: SavedAddressItem) => {
    setSavedAddresses((prev) => [newAddr, ...prev.map((a) => ({ ...a, isSelected: false }))]);
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
    setSavedAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === address.id,
      }))
    );
  };

  const handleDeleteAddress = (address: SavedAddressItem) => {
    setSavedAddresses((prev) => prev.filter((a) => a.id !== address.id));
    // Delete from backend DB asynchronously
    dusmintApi.deleteAddress(address.id).catch(() => {});
  };

  const isSearching = searchQuery.trim().length >= 2;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1F2F6" translucent={true} />

      {/* 1. App Bar */}
      <LocationAppBar onBackPress={() => navigation.goBack()} />

      {/* 2. Search Field */}
      <LocationSearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {isSearching ? (
          /* Search Results */
          <SearchResultsList
            results={searchResults}
            query={searchQuery}
            onSelectPlace={handleSelectPlace}
          />
        ) : (
          /* Normal View: Action Buttons + Saved Addresses */
          <>
            <LocationActionButtons
              isLocating={isLocating || isLocatingStore}
              onUseCurrentLocation={handleUseCurrentLocation}
              onAddNewAddress={() => navigation.navigate('ConfirmLocationMap')}
            />

            <SavedAddressesCard
              addresses={savedAddresses}
              onSelect={handleSelectAddress}
              onOpenMenu={(addr) => setMenuAddress(addr)}
              onAddNewAddress={() => navigation.navigate('ConfirmLocationMap')}
            />
          </>
        )}

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
    backgroundColor: '#F1F2F6',
  },
  scrollContent: {
    paddingBottom: 20,
  },
});

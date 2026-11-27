import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useCartStore } from '../../state/useCartStore';
import { useWishlistStore } from '../../state/useWishlistStore';
import { useLocationStore } from '../../state/useLocationStore';
import { dusmintApi } from '@dusmint/api-client';
import { SavedAddressItem } from '../location/data/locationData';

// Data & Widgets
import {
  calculateBill,
  ReceiverDetails,
} from './data/cartData';
import { CartAppBar } from './widgets/CartAppBar';
import { CartItemsCard } from './widgets/CartItemsCard';
import { OrderForSomeoneCard } from './widgets/OrderForSomeoneCard';
import { BillDetailsCard } from './widgets/BillDetailsCard';
import { CartBottomBar } from './widgets/CartBottomBar';
import { EmptyCartView } from './widgets/EmptyCartView';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export const CartScreen: React.FC<Props> = ({ navigation }) => {
  const scrollRef = useRef<ScrollView>(null);

  // Cart Store
  const items = useCartStore((s) => s.items);
  const currentVendorName = useCartStore((s) => s.currentVendorName);
  const totalPaise = useCartStore((s) => s.getTotalPaise());
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  // Location Store
  const savedAddresses = useLocationStore((s) => s.savedAddresses);
  const setSavedAddresses = useLocationStore((s) => s.setSavedAddresses);
  const activeSavedAddress = savedAddresses.find((a) => a.isSelected) || savedAddresses[0] || null;

  // Cart Local States
  const [receiver, setReceiver] = useState<ReceiverDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Sync saved addresses on screen focus
  useFocusEffect(
    useCallback(() => {
      dusmintApi
        .getSavedAddresses()
        .then((backendAddrs) => {
          if (backendAddrs && backendAddrs.length > 0) {
            const mapped: SavedAddressItem[] = backendAddrs.map((a, idx) => ({
              id: a.id,
              label: (a.label ? a.label.charAt(0).toUpperCase() + a.label.slice(1) : 'Home') as any,
              name: a.label ? a.label.charAt(0).toUpperCase() + a.label.slice(1) : 'Home',
              houseNo: a.houseNo || '',
              streetArea: a.streetArea || a.landmark || '',
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
            setSavedAddresses(merged);
          }
        })
        .catch(() => {});
    }, [setSavedAddresses])
  );

  // Calculate dynamic bill
  const bill = calculateBill(totalPaise, 0, 0);
  const hasOutOfStock = items.some((i) => i.item.isInStock === false);

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearCart(),
        },
      ]
    );
  };

  const handleMoveToWishlist = (id: string, name: string) => {
    const found = items.find((ci) => ci.item.id === id);
    if (found) {
      useWishlistStore.getState().addItem(found.item);
    }
    removeItem(id);
    Alert.alert('Saved to Wishlist', `${name} has been moved to your wishlist.`, [
      { text: 'OK', style: 'cancel' },
      { text: 'View Wishlist', onPress: () => navigation.navigate('Wishlist') },
    ]);
  };

  const handleAddMoreItems = () => {
    navigation.navigate('MainTabs', { screen: 'HomeTab' });
  };

  const handleStartShopping = () => {
    navigation.navigate('MainTabs', { screen: 'HomeTab' });
  };

  const handleScrollToBill = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const handleProceedToPay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigation.navigate('SlotAndAddress', {
        bill,
        grandTotalPaise: bill.grandTotalPaise,
      });
    }, 400);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* 1. Pinned App Bar with 'Your Cart' */}
      <CartAppBar
        onBackPress={() => navigation.goBack()}
        onClearCart={items.length > 0 ? handleClearCart : undefined}
        showTrustBanner={items.length > 0}
      />

      {items.length === 0 ? (
        <EmptyCartView onStartShopping={handleStartShopping} />
      ) : (
        <>
          

          {/* 3. Scrollable Cart Content */}
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Cart Items Card */}
            <CartItemsCard
              items={items}
              vendorName={currentVendorName || items[0]?.item.vendorName}
              onIncrement={incrementItem}
              onDecrement={decrementItem}
              onMoveToWishlist={handleMoveToWishlist}
              onAddMoreItems={handleAddMoreItems}
            />

            {/* Transparent Bill Details Card */}
            <BillDetailsCard
              bill={bill}
              onAddTipPress={() => {}}
            />

            {/* Receiver Details */}
            <OrderForSomeoneCard
              receiver={receiver}
              onSaveReceiver={setReceiver}
            />

            {/* Bottom Padding for Pinned Bar */}
            <View style={{ height: activeSavedAddress ? 140 : 100 }} />
          </ScrollView>

          {/* 4. Pinned Bottom Bar */}
          <CartBottomBar
            grandTotalPaise={bill.grandTotalPaise}
            hasOutOfStock={hasOutOfStock}
            isLoading={isProcessing}
            savedAddress={activeSavedAddress}
            onChangeAddress={() => navigation.navigate('SelectLocation')}
            onAddAddress={() => navigation.navigate('ConfirmLocationMap')}
            onViewDetailedBill={handleScrollToBill}
            onProceedToPay={handleProceedToPay}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  trustBanner: {
    backgroundColor: '#047A36',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    elevation: 2,
    shadowColor: '#047A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  trustBannerText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12.5,
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
});

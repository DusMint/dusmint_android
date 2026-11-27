import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useCartStore } from '../../state/useCartStore';
import { useWishlistStore } from '../../state/useWishlistStore';
import { useLocationStore } from '../../state/useLocationStore';
import { useAuthStore } from '../../state/useAuthStore';

// Data & Widgets
import {
  calculateBill,
  ReceiverDetails,
} from './data/cartData';
import { CartAppBar } from './widgets/CartAppBar';
import { CartItemsCard } from './widgets/CartItemsCard';
import { OrderForSomeoneCard } from './widgets/OrderForSomeoneCard';
import { NoBagCard } from './widgets/NoBagCard';
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
  const shortAddress = useLocationStore((s) => s.shortAddress);
  const userAddress = useLocationStore((s) => s.userAddress);
  const currentAddress = useLocationStore((s) => s.currentAddress);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const displayAddress = shortAddress || userAddress || 'Tap to add address';
  const addressTitle = isAuthenticated && currentAddress?.label
    ? currentAddress.label.toUpperCase()
    : 'CURRENT LOCATION';

  // Cart Local States
  const [receiver, setReceiver] = useState<ReceiverDetails | null>(null);
  const [noBagSelected, setNoBagSelected] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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

      {/* 1. Pinned App Bar */}
      <CartAppBar
        addressTitle={addressTitle}
        addressSubtitle={displayAddress}
        onBackPress={() => navigation.goBack()}
        onAddressPress={() => navigation.navigate('SelectLocation')}
        onSearchPress={() => navigation.navigate('Search')}
        onWishlistPress={() => navigation.navigate('Wishlist')}
        onClearCart={handleClearCart}
        onHelpPress={() =>
          Alert.alert('DusMint Support', 'Need help with your order? Contact support@dusmint.com')
        }
      />

      {items.length === 0 ? (
        <EmptyCartView onStartShopping={handleStartShopping} />
      ) : (
        <>
          {/* 2. Clean Brand Trust Banner */}
          <View style={styles.trustBanner}>
            <Text style={styles.trustBannerText}>
              No confusing fees. No hidden charges.
            </Text>
          </View>

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
              deliveryMins="12 Mins"
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

            {/* Eco-Friendly No Bag Option */}
            <NoBagCard
              noBagSelected={noBagSelected}
              onToggleNoBag={setNoBagSelected}
              noBagAvailable={true}
            />

            {/* Bottom Padding for Pinned Bar */}
            <View style={{ height: 110 }} />
          </ScrollView>

          {/* 4. Pinned Bottom Bar */}
          <CartBottomBar
            grandTotalPaise={bill.grandTotalPaise}
            hasOutOfStock={hasOutOfStock}
            isLoading={isProcessing}
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  trustBannerText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
});

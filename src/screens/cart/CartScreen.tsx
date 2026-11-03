import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useCartStore } from '../../state/useCartStore';
import { useLocationStore } from '../../state/useLocationStore';

// Data & Widgets
import {
  calculateBill,
  ReceiverDetails,
} from './data/cartData';
import { CartAppBar } from './widgets/CartAppBar';
import { SavingsBanner } from './widgets/SavingsBanner';
import { CartItemsCard } from './widgets/CartItemsCard';
import { SavingsCornerCard } from './widgets/SavingsCornerCard';
import { DidYouForgetCard } from './widgets/DidYouForgetCard';
import { OrderForSomeoneCard } from './widgets/OrderForSomeoneCard';
import { NoBagCard } from './widgets/NoBagCard';
import { DeliveryTipCard } from './widgets/DeliveryTipCard';
import { GstinCard } from './widgets/GstinCard';
import { BillDetailsCard } from './widgets/BillDetailsCard';
import { CancellationNoteCard } from './widgets/CancellationNoteCard';
import { CartBottomBar } from './widgets/CartBottomBar';
import { EmptyCartView } from './widgets/EmptyCartView';
import { ProductItem } from '../home/data/homeData';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export const CartScreen: React.FC<Props> = ({ navigation }) => {
  const scrollRef = useRef<ScrollView>(null);

  // Cart Store
  const items = useCartStore((s) => s.items);
  const totalPaise = useCartStore((s) => s.getTotalPaise());
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  // Location Store
  const shortAddress = useLocationStore((s) => s.shortAddress);
  const userAddress = useLocationStore((s) => s.userAddress);
  const displayAddress = shortAddress || userAddress || 'Vijay Nagar, Indore';

  // Cart Local States
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [receiver, setReceiver] = useState<ReceiverDetails | null>(null);
  const [noBagSelected, setNoBagSelected] = useState<boolean>(false);
  const [gstin, setGstin] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Calculate dynamic bill
  const bill = calculateBill(totalPaise, selectedTip * 100, 0);
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
    removeItem(id);
    Alert.alert('Wishlist', `${name} has been moved to your wishlist.`);
  };

  const handleAddMoreItems = () => {
    navigation.navigate('MainTabs', { screen: 'HomeTab' });
  };

  const handleStartShopping = () => {
    navigation.navigate('MainTabs', { screen: 'HomeTab' });
  };

  const handleCouponsPress = () => {
    Alert.alert(
      'Coupons & Offers',
      'Available Coupons:\n\n1. MANDI9 - Flat ₹9 OFF on all orders\n2. SHUDDH50 - Flat ₹50 OFF on orders above ₹499\n3. FREEDEL - Free Delivery on all fresh items',
      [{ text: 'OK' }]
    );
  };

  const handleProductPress = (product: ProductItem) => {
    navigation.navigate('ProductDetail', { productId: product.id });
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
        addressTitle="HOME"
        addressSubtitle={displayAddress}
        onBackPress={() => navigation.goBack()}
        onAddressPress={() => navigation.navigate('SelectLocation')}
        onSearchPress={() => navigation.navigate('Search')}
        onWishlistPress={() => navigation.navigate('Search')}
        onClearCart={handleClearCart}
        onHelpPress={() =>
          Alert.alert('Shuddh Mandi Support', 'Call 1800-200-MANDI or email help@shuddhmandi.com')
        }
      />

      {items.length === 0 ? (
        <EmptyCartView onStartShopping={handleStartShopping} />
      ) : (
        <>
          {/* 2. Pinned Savings Banner */}
          <SavingsBanner bill={bill} />

          {/* 3. Scrollable Cart Content */}
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Cart Items Card */}
            <CartItemsCard
              items={items}
              deliveryMins="10 Mins"
              onIncrement={incrementItem}
              onDecrement={decrementItem}
              onMoveToWishlist={handleMoveToWishlist}
              onAddMoreItems={handleAddMoreItems}
            />

            {/* Savings Corner Card */}
            <SavingsCornerCard onPress={handleCouponsPress} />

            {/* Did you forget? Horizontal Products Carousel */}
            <DidYouForgetCard onProductPress={handleProductPress} />

            {/* Ordering for someone else? */}
            <OrderForSomeoneCard
              receiver={receiver}
              onSaveReceiver={setReceiver}
            />

            {/* No Bag Delivery Option */}
            <NoBagCard
              noBagSelected={noBagSelected}
              onToggleNoBag={setNoBagSelected}
              noBagAvailable={true}
            />

            {/* Delivery Partner Tip Card */}
            <DeliveryTipCard
              selectedTip={selectedTip}
              onSelectTip={setSelectedTip}
            />

            {/* Add GSTIN Card */}
            <GstinCard gstin={gstin} onSaveGstin={setGstin} />

            {/* Bill Details Card */}
            <BillDetailsCard
              bill={bill}
              onAddTipPress={() => {
                scrollRef.current?.scrollTo({ y: 550, animated: true });
              }}
            />

            {/* Cancellation Note Card */}
            <CancellationNoteCard />

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
    backgroundColor: '#F1F2F6',
  },
  scrollContent: {
    paddingBottom: 20,
  },
});

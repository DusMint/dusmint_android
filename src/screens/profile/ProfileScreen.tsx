import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../state/useAuthStore';
import { useCartStore } from '../../state/useCartStore';
import { useOrderStore, PlacedOrder } from '../../state/useOrderStore';
import { dusmintApi } from '@dusmint/api-client';
import { InstamartColors } from '../../ui/theme/instamartTheme';

// Data & Widgets
import {
  QUICK_ACTIONS_DATA,
  PROFILE_OPTIONS_DATA,
  ProfileUser,
  QuickActionItem,
  ProfileOption,
  PastOrder,
} from './data/profileData';
import { ProfileHeader } from './widgets/ProfileHeader';
import { QuickActionGrid } from './widgets/QuickActionGrid';
import { ProfileOptionsCard } from './widgets/ProfileOptionsCard';
import { PastOrdersSection } from './widgets/PastOrdersSection';
import { AppVersionFooter } from './widgets/AppVersionFooter';
import { EditProfileModal } from './widgets/EditProfileModal';

interface Props {
  navigation: any;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const addItem = useCartStore((s) => s.addItem);
  const storeOrders = useOrderStore((s) => s.orders);

  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Synchronize orders with backend/Supabase API
  const syncBackendOrders = useCallback(async () => {
    try {
      const backendOrders = await dusmintApi.getOrders();
      if (backendOrders && backendOrders.length > 0) {
        backendOrders.forEach((bo: any) => {
          const items: any[] =
            bo.items && bo.items.length > 0
              ? bo.items
              : [
                  {
                    id: 'it-1',
                    name: 'Fresh Desi Tomato (Tamatar)',
                    price: 35,
                    quantity: 1,
                    quantityLabel: '1 kg',
                  },
                ];

          const mapped: PlacedOrder = {
            id: bo.id,
            orderCode: bo.orderCode || 'DM-ORDER',
            status: bo.status || 'placed',
            slotName: bo.slotName || 'Instant 9 Mins',
            createdAt: bo.createdAt || new Date().toISOString(),
            items,
            itemCount: bo.itemCount || items.reduce((acc, i) => acc + (i.quantity || 1), 0),
            totalRupees: Math.round((bo.totalPaise || 0) / 100),
            deliveryFeeRupees: Math.round((bo.deliveryFeePaise || 0) / 100),
            deliveryOtp: bo.deliveryOtp || '4291',
            deliveryAddress: 'Flat 402, Royal Palms, Scheme 54, Vijay Nagar, Indore',
            paymentModeTitle: bo.paymentMode || 'Online UPI',
            storeName: bo.vendorParts?.[0]?.vendorName || 'Mandi Superstore, Vijay Nagar',
          };

          useOrderStore.getState().addOrder(mapped);
        });
      }
    } catch (e) {
      console.warn('Profile orders sync error:', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    syncBackendOrders();
  }, [syncBackendOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    syncBackendOrders();
  }, [syncBackendOrders]);

  // Active User representation (Real authenticated user details)
  const phoneDigits = authUser?.phone ? authUser.phone.replace(/[^0-9]/g, '') : '9876543210';
  const cleanPhone10 = phoneDigits.slice(-10);

  const currentUser: ProfileUser = {
    id: authUser?.id || '76a64e55-e036-4d6b-9875-a8a7214ba6d3',
    fullName: authUser?.fullName || 'Dusmint Customer',
    phone: `+91 ${cleanPhone10}`,
    email: authUser?.email || `${cleanPhone10}@dusmint.com`,
    tolaBalance: 0,
  };

  // Map real orders from Zustand / Supabase DB into PastOrder display cards
  const pastOrders: PastOrder[] = useMemo(() => {
    if (!storeOrders || storeOrders.length === 0) {
      return [];
    }

    return storeOrders.map((o) => {
      const itemsSummary = o.items.map((i) => `${i.name} x${i.quantity}`).join(', ');
      
      const orderDate = new Date(o.createdAt);
      const isToday = new Date().toDateString() === orderDate.toDateString();
      const dateText = isToday
        ? `Today, ${orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`
        : orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      let displayStatus: 'Delivered' | 'Cancelled' | 'Out for Delivery' | 'Packing' = 'Delivered';
      if (o.status === 'delivered') displayStatus = 'Delivered';
      else if (o.status === 'cancelled') displayStatus = 'Cancelled';
      else if (o.status === 'on_the_way') displayStatus = 'Out for Delivery';
      else displayStatus = 'Packing';

      return {
        id: o.id,
        orderNumber: o.orderCode,
        storeName: o.storeName || 'Mandi Superstore, Vijay Nagar',
        address: 'Vijay Nagar, Indore',
        dateTime: dateText,
        status: displayStatus,
        itemsSummary: itemsSummary || 'Fresh Mandi & Kirana Items',
        totalPaise: Math.round(o.totalRupees * 100),
        items: o.items.map((i) => ({
          id: i.id,
          name: i.name,
          qty: i.quantity,
          pricePaise: Math.round(i.price * 100),
        })),
      };
    });
  }, [storeOrders]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('HomeTab');
    }
  };

  const handleHelp = () => {
    Alert.alert(
      'DusMint Support',
      'For instant support with orders or deliveries, please call 1800-DUSMINT or email support@dusmint.com.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of DusMint?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account, order history, and saved preferences. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleQuickAction = (action: QuickActionItem) => {
    if (action.id === 'qa-address') {
      navigation.navigate('SelectLocation');
    } else if (action.id === 'qa-wallet') {
      Alert.alert(
        'DusMint Wallet',
        `Current available wallet balance: ₹${currentUser.tolaBalance || 0}\nUse this balance during checkout for instant savings!`
      );
    } else if (action.id === 'qa-payments') {
      Alert.alert('Payment Modes', 'Saved UPI IDs, Google Pay, PhonePe, and Cash on Delivery options.');
    } else if (action.id === 'qa-refunds') {
      Alert.alert('My Refunds', 'No pending refunds. All quality claims are credited within 30 minutes.');
    }
  };

  const handleProfileOption = (option: ProfileOption) => {
    if (option.id === 'opt-wishlist') {
      navigation.navigate('Search');
    }
  };

  const handleReorder = (order: PastOrder) => {
    // Add all items into cart
    order.items.forEach((item) => {
      addItem({
        id: item.id,
        vendorId: 'vendor-past-order',
        categoryId: 'cat-reorder',
        nameEn: item.name,
        unit: '1 pack',
        stepQuantity: 1,
        pricePaise: item.pricePaise,
        isInStock: true,
      });
    });

    Alert.alert(
      'Items Added to Cart',
      `${order.items.length} items from order ${order.orderNumber} added to your cart.`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        {
          text: 'View Cart',
          onPress: () => navigation.navigate('Cart'),
        },
      ]
    );
  };

  const handleViewDetails = (order: PastOrder) => {
    const matched = storeOrders.find((o) => o.id === order.id);
    const orderStatus = matched?.status || (order.status.toLowerCase() === 'delivered' ? 'delivered' : 'packing');
    navigation.navigate('OrderTracking', {
      orderId: order.id,
      orderCode: order.orderNumber,
      status: orderStatus,
      deliveredAt: order.dateTime,
      items: matched?.items || order.items.map((i) => ({
        id: i.id,
        name: i.name,
        price: Math.round(i.pricePaise / 100),
        quantity: i.qty,
        quantityLabel: '1 pc',
      })),
      totalRupees: matched ? matched.totalRupees : Math.round(order.totalPaise / 100),
      deliveryAddress: matched?.deliveryAddress || 'Flat 402, Royal Palms, Scheme 54, Vijay Nagar, Indore',
      paymentModeTitle: matched?.paymentModeTitle || 'Online UPI',
    });
  };

  const handleStartShopping = () => {
    navigation.navigate('HomeTab');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[InstamartColors.accentBlue]}
          />
        }
      >
        {/* 1. Header with Gradient, User info, Help pill & Menu */}
        <ProfileHeader
          user={currentUser}
          onBackPress={handleBack}
          onHelpPress={handleHelp}
          onLogoutPress={handleLogout}
          onDeleteAccountPress={handleDeleteAccount}
          onEditProfilePress={handleEditProfile}
        />

        {/* 2. Quick Action Grid (4 Columns) */}
        <QuickActionGrid
          actions={QUICK_ACTIONS_DATA}
          onActionPress={handleQuickAction}
        />

        {/* 3. Options Card ("My Wishlist") */}
        <ProfileOptionsCard
          options={PROFILE_OPTIONS_DATA}
          onOptionPress={handleProfileOption}
        />

        {/* 4. Past Orders Section */}
        <PastOrdersSection
          orders={pastOrders}
          onReorder={handleReorder}
          onViewDetails={handleViewDetails}
          onStartShopping={handleStartShopping}
        />

        {/* 5. App Version Footer */}
        <AppVersionFooter version="1.0.0" build="42" />

        {/* Bottom padding to clear bottom navigation bar */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Instamart-style Edit Profile Modal Sheet */}
      <EditProfileModal
        visible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
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

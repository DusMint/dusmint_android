import React, { useState } from 'react';
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
import { InstamartColors } from '../../ui/theme/instamartTheme';

// Data & Widgets
import {
  DUMMY_PROFILE_USER,
  QUICK_ACTIONS_DATA,
  PROFILE_OPTIONS_DATA,
  DUMMY_PAST_ORDERS,
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

interface Props {
  navigation: any;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const addItem = useCartStore((s) => s.addItem);

  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<PastOrder[]>(DUMMY_PAST_ORDERS);

  // Active User representation
  const currentUser: ProfileUser = {
    id: authUser?.id || DUMMY_PROFILE_USER.id,
    fullName: authUser?.fullName || DUMMY_PROFILE_USER.fullName,
    phone: authUser?.phone ? `+91 - ${authUser.phone}` : DUMMY_PROFILE_USER.phone,
    email: DUMMY_PROFILE_USER.email,
    tolaBalance: DUMMY_PROFILE_USER.tolaBalance,
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setOrders(DUMMY_PAST_ORDERS);
      setRefreshing(false);
    }, 700);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('HomeTab');
    }
  };

  const handleHelp = () => {
    Alert.alert(
      'Shuddh Mandi Support',
      'For immediate assistance, please call our support team at 1800-200-MANDI or email help@shuddhmandi.com.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of Shuddh Mandi?',
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
    Alert.alert('Edit Profile', 'Profile details can be managed with your registered mobile OTP.');
  };

  const handleQuickAction = (action: QuickActionItem) => {
    if (action.id === 'qa-address') {
      navigation.navigate('SelectLocation');
    } else if (action.id === 'qa-wallet') {
      Alert.alert(
        'TOLA Mandi Wallet',
        `Current available wallet balance: ₹${currentUser.tolaBalance || 0}\nUse this balance during checkout for instant savings!`
      );
    } else if (action.id === 'qa-payments') {
      Alert.alert('Payment Modes', 'Saved UPI IDs, Credit/Debit cards, and Net Banking details.');
    } else if (action.id === 'qa-refunds') {
      Alert.alert('My Refunds', 'No pending refunds. All previous refunds have been credited to source.');
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
    navigation.navigate('OrderTracking', { orderId: order.id });
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
          orders={orders}
          onReorder={handleReorder}
          onViewDetails={handleViewDetails}
          onStartShopping={handleStartShopping}
        />

        {/* 5. App Version Footer */}
        <AppVersionFooter version="1.0.0" build="42" />

        {/* Bottom padding to clear bottom navigation bar */}
        <View style={{ height: 90 }} />
      </ScrollView>
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

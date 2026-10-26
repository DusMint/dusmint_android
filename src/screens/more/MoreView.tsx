import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Colors } from '@dusmint/ui';
import { useAuthStore } from '../../state/useAuthStore';

interface Props {
  navigation: any;
}

export const MoreView: React.FC<Props> = ({ navigation }) => {
  const logout = useAuthStore((s) => s.logout);

  const moreArr = [
    {
      name: 'Payment Details',
      image: require('../../../assets/img/more_payment.png'),
      action: () => {},
    },
    {
      name: 'My Orders',
      image: require('../../../assets/img/more_my_order.png'),
      action: () => navigation.navigate('Cart'),
    },
    {
      name: 'Notifications',
      image: require('../../../assets/img/more_notification.png'),
      action: () => {},
    },
    {
      name: 'Inbox',
      image: require('../../../assets/img/more_inbox.png'),
      action: () => {},
    },
    {
      name: 'About Us',
      image: require('../../../assets/img/more_info.png'),
      action: () => {},
    },
    {
      name: 'Logout',
      image: require('../../../assets/img/btn_next.png'),
      action: () => {
        logout();
        navigation.replace('Welcome');
      },
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>More</Text>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Image
              source={require('../../../assets/img/shopping_cart.png')}
              style={styles.cartIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {moreArr.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.itemRow}
              onPress={item.action}
            >
              <View style={styles.itemLeft}>
                <View style={styles.iconCircle}>
                  <Image source={item.image} style={styles.itemIcon} />
                </View>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
              <Image
                source={require('../../../assets/img/btn_next.png')}
                style={styles.nextIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primaryText,
  },
  cartBtn: {
    padding: 6,
  },
  cartIcon: {
    width: 25,
    height: 25,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primaryText,
  },
  nextIcon: {
    width: 28,
    height: 28,
  },
});

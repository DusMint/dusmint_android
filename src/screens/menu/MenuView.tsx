import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { Colors } from '@dusmint/ui';

export const MenuView: React.FC = () => {
  const [search, setSearch] = useState('');

  const menuArr = [
    {
      name: 'Food',
      image: require('../../../assets/img/menu_1.png'),
      items_count: '120 items',
    },
    {
      name: 'Beverages',
      image: require('../../../assets/img/menu_2.png'),
      items_count: '220 items',
    },
    {
      name: 'Desserts',
      image: require('../../../assets/img/menu_3.png'),
      items_count: '155 items',
    },
    {
      name: 'Promotions',
      image: require('../../../assets/img/menu_4.png'),
      items_count: '25 items',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Menu</Text>
          <TouchableOpacity style={styles.cartBtn}>
            <Image
              source={require('../../../assets/img/shopping_cart.png')}
              style={styles.cartIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Image
            source={require('../../../assets/img/search.png')}
            style={styles.searchIcon}
            resizeMode="contain"
          />
          <TextInput
            placeholder="Search food"
            placeholderTextColor={Colors.placeholder}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.menuList}>
          {menuArr.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.menuCard}>
              <View style={styles.menuLeft}>
                <Image source={item.image} style={styles.menuImg} />
                <View>
                  <Text style={styles.menuName}>{item.name}</Text>
                  <Text style={styles.menuCount}>{item.items_count}</Text>
                </View>
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
  searchBar: {
    height: 48,
    backgroundColor: Colors.textfield,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.primaryText,
  },
  menuList: {
    paddingHorizontal: 20,
  },
  menuCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 35,
    marginBottom: 25,
    paddingRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  menuName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primaryText,
    marginBottom: 4,
  },
  menuCount: {
    fontSize: 12,
    color: Colors.secondaryText,
  },
  nextIcon: {
    width: 32,
    height: 32,
  },
});

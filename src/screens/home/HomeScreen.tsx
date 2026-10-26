import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Colors } from '@dusmint/ui';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [search, setSearch] = useState('');

  const catArr = [
    { image: require('../../../assets/img/cat_offer.png'), name: 'Offers' },
    { image: require('../../../assets/img/cat_sri.png'), name: 'Sri Lankan' },
    { image: require('../../../assets/img/cat_3.png'), name: 'Italian' },
    { image: require('../../../assets/img/cat_4.png'), name: 'Indian' },
  ];

  const popArr = [
    {
      image: require('../../../assets/img/res_1.png'),
      name: 'Minute by tuk tuk',
      rate: '4.9',
      rating: '124',
      type: 'Café',
      food_type: 'Western Food',
    },
    {
      image: require('../../../assets/img/res_2.png'),
      name: 'Café de Noir',
      rate: '4.9',
      rating: '124',
      type: 'Café',
      food_type: 'Western Food',
    },
    {
      image: require('../../../assets/img/res_3.png'),
      name: 'Bakes by Tella',
      rate: '4.9',
      rating: '124',
      type: 'Café',
      food_type: 'Western Food',
    },
  ];

  const mostPopArr = [
    {
      image: require('../../../assets/img/m_res_1.png'),
      name: 'Minute by tuk tuk',
      rate: '4.9',
      rating: '124',
      type: 'Café',
      food_type: 'Western Food',
    },
    {
      image: require('../../../assets/img/m_res_2.png'),
      name: 'Café de Noir',
      rate: '4.9',
      rating: '124',
      type: 'Café',
      food_type: 'Western Food',
    },
  ];

  const recentArr = [
    {
      image: require('../../../assets/img/item_1.png'),
      name: 'Mulberry Pizza by Josh',
      rate: '4.9',
      rating: '124',
      type: 'Café',
      food_type: 'Western Food',
    },
    {
      image: require('../../../assets/img/item_2.png'),
      name: 'Barita',
      rate: '4.9',
      rating: '124',
      type: 'Café',
      food_type: 'Western Food',
    },
    {
      image: require('../../../assets/img/item_3.png'),
      name: 'Pizza Rush Hour',
      rate: '4.9',
      rating: '124',
      type: 'Café',
      food_type: 'Western Food',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning Akila!</Text>
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

        {/* Location Selector */}
        <View style={styles.locationContainer}>
          <Text style={styles.deliveringTo}>Delivering to</Text>
          <TouchableOpacity style={styles.locationRow}>
            <Text style={styles.locationText}>Current Location</Text>
            <Image
              source={require('../../../assets/img/dropdown.png')}
              style={styles.dropdownIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
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

        {/* Categories Horizontal */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {catArr.map((cat, idx) => (
            <TouchableOpacity key={idx} style={styles.categoryCell}>
              <Image source={cat.image} style={styles.categoryImg} />
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Restaurants */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Restaurants</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {popArr.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.restaurantCard}
            onPress={() =>
              navigation.navigate('ItemList', { title: item.name })
            }
          >
            <Image source={item.image} style={styles.restaurantImg} />
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{item.name}</Text>
              <View style={styles.ratingRow}>
                <Image
                  source={require('../../../assets/img/rate.png')}
                  style={styles.rateIcon}
                />
                <Text style={styles.rateText}>{item.rate}</Text>
                <Text style={styles.ratingCount}>({item.rating} ratings)</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.foodType}>
                  {item.type} {item.food_type}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Most Popular */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Most Popular</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {mostPopArr.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.mostPopCard}>
              <Image source={item.image} style={styles.mostPopImg} />
              <Text style={styles.mostPopName}>{item.name}</Text>
              <View style={styles.ratingRow}>
                <Image
                  source={require('../../../assets/img/rate.png')}
                  style={styles.rateIcon}
                />
                <Text style={styles.rateText}>{item.rate}</Text>
                <Text style={styles.foodType}>{item.food_type}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recent Items */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Items</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        {recentArr.map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.recentRow}>
            <Image source={item.image} style={styles.recentImg} />
            <View style={styles.recentInfo}>
              <Text style={styles.recentName}>{item.name}</Text>
              <Text style={styles.foodType}>
                {item.type} {item.food_type}
              </Text>
              <View style={styles.ratingRow}>
                <Image
                  source={require('../../../assets/img/rate.png')}
                  style={styles.rateIcon}
                />
                <Text style={styles.rateText}>{item.rate}</Text>
                <Text style={styles.ratingCount}>({item.rating} ratings)</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpacer} />
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
  greeting: {
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
  locationContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  deliveringTo: {
    fontSize: 11,
    color: Colors.secondaryText,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondaryText,
    marginRight: 8,
  },
  dropdownIcon: {
    width: 12,
    height: 12,
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
  categoryScroll: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  categoryCell: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  categoryImg: {
    width: 85,
    height: 85,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryText,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primaryText,
  },
  viewAll: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  restaurantCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  restaurantImg: {
    width: '100%',
    height: 190,
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primaryText,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateIcon: {
    width: 12,
    height: 12,
    marginRight: 4,
  },
  rateText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: Colors.secondaryText,
  },
  dot: {
    marginHorizontal: 6,
    color: Colors.secondaryText,
  },
  foodType: {
    fontSize: 12,
    color: Colors.secondaryText,
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 10,
    marginBottom: 20,
  },
  mostPopCard: {
    width: 220,
    marginRight: 15,
  },
  mostPopImg: {
    width: 220,
    height: 130,
    borderRadius: 10,
    marginBottom: 6,
  },
  mostPopName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryText,
    marginBottom: 2,
  },
  recentRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  recentImg: {
    width: 75,
    height: 75,
    borderRadius: 10,
    marginRight: 15,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryText,
    marginBottom: 4,
  },
  bottomSpacer: {
    height: 80,
  },
});

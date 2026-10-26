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

export const OfferView: React.FC = () => {
  const offerArr = [
    {
      image: require('../../../assets/img/offer_1.png'),
      name: 'Café de Noires',
      rate: '4.9',
      rating: '124',
      type: 'Café',
      food_type: 'Western Food',
    },
    {
      image: require('../../../assets/img/offer_2.png'),
      name: 'Isso',
      rate: '4.9',
      rating: '124',
      type: 'Café',
      food_type: 'Western Food',
    },
    {
      image: require('../../../assets/img/offer_3.png'),
      name: 'Cafe Beans',
      rate: '4.9',
      rating: '124',
      type: 'Café',
      food_type: 'Western Food',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Latest Offers</Text>
          <TouchableOpacity style={styles.cartBtn}>
            <Image
              source={require('../../../assets/img/shopping_cart.png')}
              style={styles.cartIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Find discounts, Offers special meals and more!
        </Text>

        <View style={styles.checkBtnContainer}>
          <TouchableOpacity style={styles.checkBtn}>
            <Text style={styles.checkBtnText}>Check Offers</Text>
          </TouchableOpacity>
        </View>

        {offerArr.map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.card}>
            <Image source={item.image} style={styles.cardImg} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
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
  subtitle: {
    fontSize: 14,
    color: Colors.secondaryText,
    paddingHorizontal: 20,
    marginTop: 15,
  },
  checkBtnContainer: {
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  checkBtn: {
    backgroundColor: Colors.primary,
    height: 35,
    width: 140,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
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
  cardImg: {
    width: '100%',
    height: 190,
  },
  cardInfo: {
    padding: 12,
  },
  cardName: {
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
});

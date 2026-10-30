import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { useCartStore } from '../../../state/useCartStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.82;
const CARD_GAP = 12;

export const HeroCarousel: React.FC = () => {
  const flatListRef = useRef<FlatList>(null);
  const addItem = useCartStore((s) => s.addItem);

  const CARDS = [
    { id: 'card-1', type: 'navy' },
    { id: 'card-2', type: 'mint' },
    { id: 'card-3', type: 'blue' },
  ];

  const MINT_ITEMS = [
    {
      id: 'm1',
      name: 'Coca-Cola Diet Coke',
      weight: '330 ml x 6',
      price: 255,
      mrp: 300,
      img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=120',
    },
    {
      id: 'm2',
      name: 'Bingo Tedhe Medhe',
      weight: '70 g',
      price: 15,
      mrp: 20,
      img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=120',
    },
    {
      id: 'm3',
      name: 'Maggi Double Masala',
      weight: '95 g x 3',
      price: 58,
      mrp: 60,
      img: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=120',
    },
    {
      id: 'm4',
      name: 'Sunfeast Dark Fantasy',
      weight: '21.6 g x 3',
      price: 27,
      mrp: 30,
      img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=120',
    },
  ];

  const handleAdd = (item: typeof MINT_ITEMS[0]) => {
    addItem({
      id: item.id,
      vendorId: 'vendor-1',
      categoryId: 'cat-staples',
      nameEn: item.name,
      unit: item.weight,
      stepQuantity: 1,
      pricePaise: item.price * 100,
      photoUrl: item.img,
      isInStock: true,
    });
  };

  // 1. Navy Card (Deals & Offers)
  const renderNavyCard = () => (
    <View style={[styles.card, styles.navyCard]}>
      <View style={styles.cardHeaderRow}>
        <View>
          <Text style={styles.navySubTitle}>FESTIVAL DEALS</Text>
          <Text style={styles.navyTitle}>MANDI WEEK</Text>
        </View>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png' }}
          style={styles.heroBagImg}
        />
      </View>

      <View style={styles.navyGrid}>
        <View style={styles.navyTile}>
          <Text style={styles.navyTileText}>Sabzi & Fruits</Text>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100' }}
            style={styles.navyTileImg}
          />
        </View>
        <View style={styles.navyTile}>
          <Text style={styles.navyTileText}>Milk & Dairy</Text>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100' }}
            style={styles.navyTileImg}
          />
        </View>
        <View style={styles.navyTile}>
          <Text style={styles.navyTileText}>Fresh Meat</Text>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=100' }}
            style={styles.navyTileImg}
          />
        </View>
        <View style={styles.navyTile}>
          <Text style={styles.navyTileText}>Eggs & Staples</Text>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=100' }}
            style={styles.navyTileImg}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.navyFooter}>
        <Text style={styles.navyFooterText}>Beat the price & win deals &gt;</Text>
      </TouchableOpacity>
    </View>
  );

  // 2. Mint Card (Exact Match to Image 3 - Instamart "Most shopped near you")
  const renderMintCard = () => (
    <View style={[styles.card, styles.mintCard]}>
      {/* Top Header: Title on Left + Grocery Bag Graphic on Right */}
      <View style={styles.mintHeaderRow}>
        <Text style={styles.mintTitle}>Most shopped{'\n'}near you</Text>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/372/372627.png' }}
          style={styles.groceryBagIllustration}
          resizeMode="contain"
        />
      </View>

      {/* 4 White Product Rows */}
      <View style={styles.itemsContainer}>
        {MINT_ITEMS.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            {/* Left: Product Thumbnail */}
            <View style={styles.imgWrapper}>
              <Image source={{ uri: item.img }} style={styles.productImg} resizeMode="contain" />
            </View>

            {/* Middle: Title & Volume */}
            <View style={styles.titleCol}>
              <Text style={styles.productTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.productWeight}>{item.weight}</Text>
            </View>

            {/* Middle-Right: ADD Button */}
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => handleAdd(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>

            {/* Far Right: Strikethrough MRP on top + Bold Price on bottom */}
            <View style={styles.priceCol}>
              <Text style={styles.mrpText}>₹{item.mrp}</Text>
              <Text style={styles.priceText}>₹{item.price}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Bottom Footer: See all >> */}
      <TouchableOpacity style={styles.mintFooter} activeOpacity={0.7}>
        <Text style={styles.seeAllText}>See all &gt;&gt;</Text>
      </TouchableOpacity>
    </View>
  );

  // 3. Blue Card (Snacks & Cookies)
  const renderBlueCard = () => (
    <View style={[styles.card, styles.blueCard]}>
      <View style={styles.mintHeaderRow}>
        <Text style={[styles.mintTitle, { color: '#0F3C6A' }]}>Snacks &{'\n'}Munchies</Text>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png' }}
          style={styles.groceryBagIllustration}
          resizeMode="contain"
        />
      </View>

      <View style={styles.itemsContainer}>
        {MINT_ITEMS.slice(0, 4).map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.imgWrapper}>
              <Image source={{ uri: item.img }} style={styles.productImg} resizeMode="contain" />
            </View>
            <View style={styles.titleCol}>
              <Text style={styles.productTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.productWeight}>{item.weight}</Text>
            </View>
            <TouchableOpacity
              style={[styles.addBtn, { borderColor: '#165BAA' }]}
              onPress={() => handleAdd(item)}
              activeOpacity={0.8}
            >
              <Text style={[styles.addBtnText, { color: '#165BAA' }]}>ADD</Text>
            </TouchableOpacity>
            <View style={styles.priceCol}>
              <Text style={styles.mrpText}>₹{item.mrp}</Text>
              <Text style={styles.priceText}>₹{item.price}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.mintFooter} activeOpacity={0.7}>
        <Text style={[styles.seeAllText, { color: '#0F3C6A' }]}>See all &gt;&gt;</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.carouselWrapper}>
      <FlatList
        ref={flatListRef}
        data={CARDS}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.type === 'navy') return renderNavyCard();
          if (item.type === 'mint') return renderMintCard();
          return renderBlueCard();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  carouselWrapper: {
    marginVertical: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 22,
    padding: 12,
    justifyContent: 'space-between',
  },
  mintCard: {
    backgroundColor: '#D7ECE1', // Soft Instamart Mint Green
  },
  navyCard: {
    backgroundColor: '#091238',
  },
  blueCard: {
    backgroundColor: '#D1E6F9',
  },

  // Mint Card Specifics (Image 3 match)
  mintHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  mintTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 18,
    fontWeight: '800',
    color: '#13402B',
    lineHeight: 22,
  },
  groceryBagIllustration: {
    width: 62,
    height: 46,
  },

  // Item Rows (Image 3 match)
  itemsContainer: {
    gap: 7,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  imgWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  productImg: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  titleCol: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
  },
  productTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1C1C',
    lineHeight: 16,
  },
  productWeight: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    fontWeight: '500',
    color: '#777777',
    marginTop: 1,
  },
  addBtn: {
    borderWidth: 1.5,
    borderColor: '#3868E0',
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginRight: 10,
    shadowColor: '#3868E0',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  addBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    fontWeight: '700',
    color: '#3868E0',
  },
  priceCol: {
    alignItems: 'flex-end',
    minWidth: 42,
  },
  mrpText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#8E8E8E',
    textDecorationLine: 'line-through',
    lineHeight: 12,
  },
  priceText: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 16,
  },

  // Mint Footer
  mintFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 2,
  },
  seeAllText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#1B5E3C',
  },

  // Navy Card specifics
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  navySubTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#FFB36B',
    letterSpacing: 0.5,
  },
  navyTitle: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  heroBagImg: {
    width: 44,
    height: 44,
  },
  navyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  navyTile: {
    width: (CARD_WIDTH - 36) / 2,
    height: 68,
    backgroundColor: '#F77B1B',
    borderRadius: 12,
    padding: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  navyTileText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
    maxWidth: '70%',
    lineHeight: 14,
  },
  navyTileImg: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  navyFooter: {
    alignItems: 'flex-start',
    marginTop: 6,
  },
  navyFooterText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
});

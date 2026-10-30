import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Image } from 'react-native';
import { InstamartColors, InstamartRadii } from '../../../ui/theme/instamartTheme';
import { useCartStore } from '../../../state/useCartStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

export const HeroCarousel: React.FC = () => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % 2;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 4000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const renderCard1 = () => (
    <View style={[styles.card, styles.navyCard]}>
      <Text style={styles.card1Sub}>MAKE THIS</Text>
      <Text style={styles.card1Title}>MANDI WEEK</Text>

      <View style={styles.card1Grid}>
        <TouchableOpacity style={styles.gridTile} activeOpacity={0.8}>
          <Text style={styles.gridTileText}>Sabzi & fruits</Text>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=150' }}
            style={styles.gridTileImg}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridTile} activeOpacity={0.8}>
          <Text style={styles.gridTileText}>Milk, dahi & paneer</Text>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150' }}
            style={styles.gridTileImg}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridTile} activeOpacity={0.8}>
          <Text style={styles.gridTileText}>Fresh meat</Text>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=150' }}
            style={styles.gridTileImg}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridTile} activeOpacity={0.8}>
          <Text style={styles.gridTileText}>Eggs & staples</Text>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=150' }}
            style={styles.gridTileImg}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.card1Footer}>Beat the price & win deals &gt;</Text>
    </View>
  );

  const renderCard2 = () => (
    <View style={[styles.card, styles.mintCard]}>
      <Text style={styles.card2Title}>Most shopped near you</Text>

      <View style={styles.card2List}>
        {[
          { id: 'h1', name: 'Desi Hybrid Tomato', weight: '500 g', price: 22, mrp: 26, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100' },
          { id: 'h2', name: 'Fresh Farm Milk', weight: '1 L', price: 56, mrp: 62, img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100' },
          { id: 'h3', name: 'Nashik Red Onion', weight: '1 kg', price: 34, mrp: 38, img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=100' },
        ].map((item) => (
          <View key={item.id} style={styles.card2Row}>
            <Image source={{ uri: item.img }} style={styles.card2RowImg} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.card2ItemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.card2ItemWeight}>{item.weight}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
              <Text style={styles.card2ItemPrice}>₹{item.price}</Text>
              <Text style={styles.card2ItemMrp}>₹{item.mrp}</Text>
            </View>
            <TouchableOpacity
              style={styles.card2AddBtn}
              onPress={() => addItem({
                id: item.id,
                vendorId: 'vendor-1',
                categoryId: 'cat-veg',
                nameEn: item.name,
                unit: item.weight,
                stepQuantity: 1,
                pricePaise: item.price * 100,
                photoUrl: item.img,
                isInStock: true,
              })}
            >
              <Text style={styles.card2AddText}>ADD</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Text style={styles.card2Footer}>See all &gt;&gt;</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={[1, 2]}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (item === 1 ? renderCard1() : renderCard2())}
        keyExtractor={(item) => item.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: InstamartRadii.hero,
    padding: 14,
    height: 260,
    justifyContent: 'space-between',
  },
  navyCard: {
    backgroundColor: InstamartColors.navy,
  },
  mintCard: {
    backgroundColor: '#DCEFE4',
  },
  card1Sub: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: InstamartColors.orangeText,
    letterSpacing: 0.5,
  },
  card1Title: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 22,
    color: '#FFFFFF',
    marginTop: -2,
    marginBottom: 8,
  },
  card1Grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  gridTile: {
    width: (CARD_WIDTH - 36) / 2,
    height: 72,
    backgroundColor: InstamartColors.orange,
    borderRadius: 12,
    padding: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  gridTileText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
    maxWidth: '70%',
    lineHeight: 14,
  },
  gridTileImg: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  card1Footer: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 6,
  },
  card2Title: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 17,
    color: '#1A1A1A',
    marginBottom: 6,
  },
  card2List: {
    gap: 8,
  },
  card2Row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 10,
  },
  card2RowImg: {
    width: 38,
    height: 38,
    borderRadius: 6,
  },
  card2ItemName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#1A1A1A',
  },
  card2ItemWeight: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#666666',
  },
  card2ItemPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#1A1A1A',
  },
  card2ItemMrp: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  card2AddBtn: {
    borderWidth: 1.5,
    borderColor: InstamartColors.accentBlue,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  card2AddText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: InstamartColors.accentBlue,
  },
  card2Footer: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: InstamartColors.accentBlue,
    textAlign: 'right',
  },
});

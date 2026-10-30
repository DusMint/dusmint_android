import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors, InstamartRadii } from '../../../ui/theme/instamartTheme';
import { ProductItem } from '../data/homeData';
import { ProductCard } from './ProductCard';

interface Props {
  products: ProductItem[];
  onArrowPress?: () => void;
  onProductPress?: (p: ProductItem) => void;
}

export const BlueWrapperCarousel: React.FC<Props> = ({ products, onArrowPress, onProductPress }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sparkles" size={16} color={InstamartColors.wrapperBlueTitle} />
          <Text style={styles.title}>LOWEST PRICES ONLY FOR YOU</Text>
        </View>

        <TouchableOpacity style={styles.arrowButton} onPress={onArrowPress} activeOpacity={0.7}>
          <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Products */}
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => onProductPress?.(item)} />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 12,
    backgroundColor: InstamartColors.wrapperBlue,
    borderRadius: InstamartRadii.promoBlock,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: InstamartColors.wrapperBlueTitle,
    letterSpacing: 0.3,
  },
  arrowButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: InstamartColors.wrapperBlueTitle,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


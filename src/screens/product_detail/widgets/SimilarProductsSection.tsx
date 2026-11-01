import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { ProductItem } from '../../home/data/homeData';
import { ProductCard } from '../../home/widgets/ProductCard';

interface Props {
  products: ProductItem[];
  onProductPress: (product: ProductItem) => void;
}

export const SimilarProductsSection: React.FC<Props> = ({
  products,
  onProductPress,
}) => {
  if (!products || products.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Similar Products</Text>

      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => onProductPress(item)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    fontWeight: '700',
    color: InstamartColors.ink,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingLeft: 12,
    paddingRight: 16,
  },
});

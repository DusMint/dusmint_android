import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { InstamartColors, InstamartTypography, InstamartRadii } from '../../../ui/theme/instamartTheme';
import { ProductItem } from '../data/homeData';
import { ProductCard } from './ProductCard';

interface Props {
  title: string;
  products: ProductItem[];
  showSeeAll?: boolean;
  showBottomSeeAllButton?: boolean;
  onSeeAllPress?: () => void;
  onProductPress?: (product: ProductItem) => void;
}

export const ProductCarousel: React.FC<Props> = ({
  title,
  products,
  showSeeAll = true,
  showBottomSeeAllButton = false,
  onSeeAllPress,
  onProductPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={InstamartTypography.sectionTitle}>{title}</Text>
        {showSeeAll && (
          <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
            <Text style={InstamartTypography.seeAll}>See all &gt;&gt;</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal List */}
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => onProductPress?.(item)} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      {/* Bottom See All Button */}
      {showBottomSeeAllButton && (
        <TouchableOpacity style={styles.bottomSeeAllBtn} onPress={onSeeAllPress} activeOpacity={0.8}>
          <Text style={styles.bottomSeeAllText}>See All &gt;&gt;</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  bottomSeeAllBtn: {
    backgroundColor: InstamartColors.tileBlue,
    borderRadius: InstamartRadii.card,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSeeAllText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: InstamartColors.accentBlue,
  },
});


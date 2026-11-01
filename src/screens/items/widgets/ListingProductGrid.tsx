import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { ListingProduct } from '../data/listingData';
import { ListingProductCard } from './ListingProductCard';

interface Props {
  products: ListingProduct[];
  cardWidth: number;
  onClearFilters?: () => void;
  onProductPress?: (product: ListingProduct) => void;
}

export const ListingProductGrid: React.FC<Props> = ({
  products,
  cardWidth,
  onClearFilters,
  onProductPress,
}) => {
  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="search-outline" size={36} color="#8FB6E8" />
        </View>
        <Text style={styles.emptyTitle}>No products found</Text>
        <Text style={styles.emptySubtitle}>
          Try changing your filters or searching for another item.
        </Text>
        {onClearFilters && (
          <TouchableOpacity style={styles.clearBtn} onPress={onClearFilters} activeOpacity={0.8}>
            <Text style={styles.clearBtnText}>Clear all filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.gridContent}
      columnWrapperStyle={styles.columnWrapper}
      renderItem={({ item }) => (
        <ListingProductCard
          product={item}
          cardWidth={cardWidth}
          onPress={() => onProductPress && onProductPress(item)}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  gridContent: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 160, // Clear floating strips & cart
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E3EEFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: InstamartColors.ink,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  clearBtn: {
    backgroundColor: InstamartColors.accentBlue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  clearBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

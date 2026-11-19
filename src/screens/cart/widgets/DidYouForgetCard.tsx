import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ProductItem } from '../../home/data/homeData';
import { FORGET_PRODUCTS } from '../data/cartData';
import { MiniProductCard } from './MiniProductCard';
import { AppTypography } from '../../../ui/theme/appTypography';

interface Props {
  onProductPress: (product: ProductItem) => void;
}

export const DidYouForgetCard: React.FC<Props> = ({ onProductPress }) => {
  const products = FORGET_PRODUCTS['Did you forget?'] || [];

  return (
    <View style={styles.card}>
      {/* Clean Single Section Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Did you forget?</Text>
      </View>

      {/* Horizontal Mini Products List */}
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MiniProductCard
            product={item}
            onPress={onProductPress}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingTop: 14,
    paddingBottom: 16,
    marginHorizontal: 12,
    marginTop: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
    headerRow: {
      paddingHorizontal: 16,
      marginBottom: 12,
    },
      sectionTitle: {
        ...AppTypography.cardTitle,
        fontSize: 16,
      },
      listContent: {
        paddingHorizontal: 14,
        gap: 10,
      },
    });

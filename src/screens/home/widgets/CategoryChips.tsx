import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { CATEGORY_QUICK_CHIPS, CategoryQuickChip } from '../data/homeData';
import { AppTypography } from '../../../ui/theme/appTypography';

interface Props {
  selectedCategoryId?: string;
  onSelectCategory?: (id: string) => void;
}

export const CategoryChips: React.FC<Props> = ({
  selectedCategoryId = 'all',
  onSelectCategory,
}) => {
  const renderItem = ({ item }: { item: CategoryQuickChip }) => {
    const isSelected = selectedCategoryId === item.id;
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => onSelectCategory?.(item.id)}
        activeOpacity={0.78}
      >
        <View
          style={[
            styles.plateContainer,
            isSelected ? styles.plateSelected : styles.plateDefault,
          ]}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.foodImage}
            resizeMode="cover"
          />
          {item.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.label,
            isSelected && styles.labelSelected,
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Text>

        {isSelected && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* "What's On Your Mind?" Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>What's On Your Mind?</Text>
      </View>

      <FlatList
        data={CATEGORY_QUICK_CHIPS || []}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 8,
  },
  headerRow: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    ...AppTypography.cardTitle,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  itemContainer: {
    width: 74,
    alignItems: 'center',
  },
  plateContainer: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateDefault: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  plateSelected: {
    borderWidth: 2.5,
    borderColor: '#15803D',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
  },
  newBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#15803D',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  newBadgeText: {
    ...AppTypography.badgeText,
    fontSize: 8,
    color: '#FFFFFF',
  },
  label: {
    ...AppTypography.categoryLabel,
    marginTop: 7,
  },
  labelSelected: {
    ...AppTypography.categoryLabelActive,
  },
  activeIndicator: {
    marginTop: 3,
    width: 18,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#15803D',
  },
});

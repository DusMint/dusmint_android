import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors, InstamartRadii, InstamartTypography } from '../../../ui/theme/instamartTheme';
import { CATEGORY_QUICK_CHIPS, CategoryQuickChip } from '../data/homeData';

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
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.tile,
            isSelected && styles.selectedTile,
          ]}
        >
          <Ionicons
            name={item.icon as any}
            size={28}
            color={isSelected ? '#FFFFFF' : InstamartColors.accentBlue}
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
            isSelected && styles.selectedLabel,
          ]}
          numberOfLines={2}
        >
          {item.label}
        </Text>
        {isSelected && <View style={styles.activeBar} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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
    marginVertical: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  itemContainer: {
    width: 74,
    alignItems: 'center',
  },
  tile: {
    width: 68,
    height: 68,
    backgroundColor: InstamartColors.tileBlue,
    borderRadius: InstamartRadii.tileLarge,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: InstamartColors.successGreen,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  newBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8,
    color: '#FFFFFF',
  },
  label: {
    ...InstamartTypography.tileLabel,
    marginTop: 6,
  },
  selectedTile: {
    backgroundColor: InstamartColors.accentBlue,
  },
  selectedLabel: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: InstamartColors.accentBlue,
  },
  activeBar: {
    marginTop: 4,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: InstamartColors.accentBlue,
  },
});


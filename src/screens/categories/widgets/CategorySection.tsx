import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { CategorySectionModel, CategoryItem } from '../data/categoriesData';
import { CategoryTile } from './CategoryTile';

interface Props {
  section: CategorySectionModel;
  onTilePress?: (item: CategoryItem) => void;
}

const { width } = Dimensions.get('window');
// Screen horizontal padding: 16 on each side (32) + 3 gaps of 10 (30) = 62
const TILE_WIDTH = Math.floor((width - 32 - 30) / 4);

export const CategorySection: React.FC<Props> = ({ section, onTilePress }) => {
  if (!section.items || section.items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{section.title}</Text>

      <View style={styles.grid}>
        {section.items.map((item) => (
          <CategoryTile
            key={item.id}
            item={item}
            width={TILE_WIDTH}
            onPress={() => onTilePress?.(item)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: InstamartColors.ink,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});


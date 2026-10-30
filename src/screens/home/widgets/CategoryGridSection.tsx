import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { InstamartColors, InstamartRadii, InstamartTypography } from '../../../ui/theme/instamartTheme';

interface GridItem {
  id: string;
  name: string;
  img: string;
}

interface Props {
  title: string;
  items: GridItem[];
  onItemPress?: (item: GridItem) => void;
}

export const CategoryGridSection: React.FC<Props> = ({ title, items, onItemPress }) => {
  return (
    <View style={styles.container}>
      <Text style={InstamartTypography.gridSectionTitle}>{title}</Text>

      <View style={styles.grid}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => onItemPress?.(item)}
            activeOpacity={0.8}
          >
            <View style={styles.tile}>
              <Image source={{ uri: item.img }} style={styles.image} resizeMode="cover" />
            </View>
            <Text style={InstamartTypography.tileLabel} numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  item: {
    width: '23%',
    alignItems: 'center',
  },
  tile: {
    width: '100%',
    height: 74,
    backgroundColor: InstamartColors.tileBlue,
    borderRadius: InstamartRadii.tile,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 6,
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
});


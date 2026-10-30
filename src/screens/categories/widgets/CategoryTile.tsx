import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { CategoryItem } from '../data/categoriesData';

interface Props {
  item: CategoryItem;
  width: number;
  onPress?: () => void;
}

export const CategoryTile: React.FC<Props> = ({ item, width, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={item.name}
    >
      {/* 82px Tall Rounded Container */}
      <View style={[styles.tileBox, { width }]}>
        <Image source={{ uri: item.imageUrl }} style={styles.tileImage} resizeMode="contain" />
      </View>

      {/* Label Below */}
      <Text style={styles.label} numberOfLines={3}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 6,
  },
  tileBox: {
    height: 82,
    backgroundColor: InstamartColors.tileBlue, // #E3EEFB
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    overflow: 'hidden',
  },
  tileImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    fontWeight: '500',
    color: InstamartColors.ink,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 14,
  },
});


import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { SubcategoryItem } from '../data/listingData';

interface Props {
  subcategories: SubcategoryItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const SubcategorySidebar: React.FC<Props> = ({
  subcategories,
  selectedId,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={subcategories}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = item.id === selectedId;
          return (
            <TouchableOpacity
              style={[styles.item, isSelected && styles.selectedItem]}
              onPress={() => onSelect(item.id)}
              activeOpacity={0.7}
              accessibilityLabel={item.name}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.icon} resizeMode="cover" />
              <Text
                style={[styles.label, isSelected && styles.selectedLabel]}
                numberOfLines={3}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 78,
    backgroundColor: '#FAFAFA',
    borderRightWidth: 1,
    borderRightColor: '#EEEEEE',
  },
  listContent: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 8,
  },
  item: {
    width: 70,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  selectedItem: {
    backgroundColor: InstamartColors.tileBlue, // #E3EEFB
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAEAEA',
    marginBottom: 4,
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    fontWeight: '500',
    color: '#444444',
    textAlign: 'center',
    lineHeight: 12,
  },
  selectedLabel: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: InstamartColors.ink,
  },
});


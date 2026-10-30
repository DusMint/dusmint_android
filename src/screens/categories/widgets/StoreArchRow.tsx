import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { STORE_ARCH_DATA, StoreArchItem } from '../data/categoriesData';

interface Props {
  onStorePress?: (store: StoreArchItem) => void;
}

export const StoreArchRow: React.FC<Props> = ({ onStorePress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Shop by Store</Text>

      <FlatList
        data={STORE_ARCH_DATA}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => onStorePress?.(item)}
            activeOpacity={0.8}
            accessibilityLabel={item.name}
          >
            {/* 82x98 Arch Top Shape */}
            <View style={[styles.archShape, { backgroundColor: item.bgColor }]}>
              <Image source={{ uri: item.imageUrl }} style={styles.storeImage} resizeMode="contain" />
            </View>

            {/* Label Below */}
            <Text style={styles.storeLabel} numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: InstamartColors.ink,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  listContent: {
    paddingLeft: 16,
    paddingRight: 10,
    gap: 10,
  },
  item: {
    width: 82,
    alignItems: 'center',
  },
  archShape: {
    width: 82,
    height: 98,
    borderTopLeftRadius: 41,
    borderTopRightRadius: 41,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  storeImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  storeLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    fontWeight: '600',
    color: InstamartColors.ink,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 14,
  },
});


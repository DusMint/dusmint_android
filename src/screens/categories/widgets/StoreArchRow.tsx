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
              <Image source={{ uri: item.imageUrl }} style={styles.storeImage} resizeMode="cover" />
            </View>

            {/* Label Below */}
            <Text style={styles.storeLabel} numberOfLines={2}>
              {item.name}
            </Text>
            {item.distance ? (
              <Text style={styles.storeSubLabel} numberOfLines={1}>
                {item.distance}
              </Text>
            ) : null}
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
    gap: 12,
  },
  item: {
    width: 90,
    alignItems: 'center',
  },
  archShape: {
    width: 86,
    height: 98,
    borderTopLeftRadius: 43,
    borderTopRightRadius: 43,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  storeImage: {
    width: 74,
    height: 84,
    borderTopLeftRadius: 37,
    borderTopRightRadius: 37,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  storeLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    fontWeight: '600',
    color: InstamartColors.ink,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },
  storeSubLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
});


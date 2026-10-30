import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { InstamartColors, InstamartTypography } from '../../../ui/theme/instamartTheme';
import { STORES_ARCH, StoreArchItem } from '../data/homeData';

interface Props {
  onStorePress?: (store: StoreArchItem) => void;
}

export const StoreArchCards: React.FC<Props> = ({ onStorePress }) => {
  return (
    <View style={styles.container}>
      <Text style={InstamartTypography.sectionTitle}>Shop by Store</Text>

      <FlatList
        data={STORES_ARCH}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onStorePress?.(item)}
            activeOpacity={0.8}
          >
            {/* Arch Top Container */}
            <View style={[styles.archShape, { backgroundColor: item.bgColor }]}>
              <Image source={{ uri: item.imageUrl }} style={styles.storeImage} resizeMode="cover" />
            </View>

            {/* Store Name & Meta */}
            <Text style={styles.storeName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.subText}>
              {item.distance} &bull; {item.rating}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 12,
  },
  card: {
    width: 112,
  },
  archShape: {
    width: 112,
    height: 112,
    borderTopLeftRadius: 56,
    borderTopRightRadius: 56,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  storeImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  storeName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: InstamartColors.ink,
    marginTop: 6,
    lineHeight: 14,
  },
  subText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: InstamartColors.inkSoft,
    marginTop: 2,
  },
});


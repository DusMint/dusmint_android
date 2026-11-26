import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { AppTypography } from '../../../ui/theme/appTypography';
import { VendorShop } from '../../../api-client/types';

interface Props {
  shops?: VendorShop[];
  onStorePress?: (store: VendorShop) => void;
}

export const StoreArchCards: React.FC<Props> = ({ shops = [], onStorePress }) => {
  if (!shops || shops.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[AppTypography.cardTitle, styles.sectionTitle]}>Shop by Store</Text>

      <FlatList
        data={shops}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onStorePress?.(item)}
            activeOpacity={0.8}
          >
            {/* Arch Top Container */}
            <View style={[styles.archShape, { backgroundColor: '#F0FDF4' }]}>
              <Image
                source={{
                  uri:
                    item.bannerPhotoUrl ||
                    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
                }}
                style={styles.storeImage}
                resizeMode="cover"
              />
            </View>

            {/* Store Name */}
            <Text style={styles.storeName} numberOfLines={1}>
              {item.shopName}
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
  sectionTitle: {
    paddingHorizontal: 16,
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
    ...AppTypography.cardTitle,
    fontSize: 12.5,
    lineHeight: 16,
    marginTop: 6,
  },
});


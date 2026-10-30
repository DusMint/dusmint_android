import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { InstamartColors, InstamartRadii, InstamartTypography } from '../../../ui/theme/instamartTheme';
import { BRAND_FAVOURITES } from '../data/homeData';

export const FeaturedFavourites: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={InstamartTypography.sectionTitle}>Featured Favourites</Text>

      <FlatList
        data={BRAND_FAVOURITES}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.tile} activeOpacity={0.8}>
            <Image source={{ uri: item.logo }} style={styles.logo} resizeMode="contain" />
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
  tile: {
    width: 68,
    height: 68,
    backgroundColor: '#FFFFFF',
    borderRadius: InstamartRadii.tileLarge,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});


import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { InstamartColors, InstamartRadii, InstamartTypography } from '../../../ui/theme/instamartTheme';
import { BRAND_FAVOURITES, BrandFavourite } from '../data/homeData';

interface Props {
  onBrandPress?: (brand: BrandFavourite) => void;
}

export const FeaturedFavourites: React.FC<Props> = ({ onBrandPress }) => {
  return (
    <View style={styles.container}>
      <Text style={InstamartTypography.sectionTitle}>Featured Favourites</Text>

      <FlatList
        data={BRAND_FAVOURITES || []}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.75}
            onPress={() => onBrandPress?.(item)}
          >
            <View style={styles.logoBox}>
              <Image source={{ uri: item.logo }} style={styles.logo} resizeMode="cover" />
            </View>
            <Text style={styles.brandName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.tagline} numberOfLines={1}>
              {item.tagline}
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
    paddingBottom: 4,
    gap: 12,
  },
  card: {
    width: 82,
    alignItems: 'center',
  },
  logoBox: {
    width: 72,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: InstamartRadii.tileLarge,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ECECEC',
    overflow: 'hidden',
    marginBottom: 6,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  brandName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: InstamartColors.ink,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    color: InstamartColors.inkMuted,
    textAlign: 'center',
    marginTop: 1,
  },
});

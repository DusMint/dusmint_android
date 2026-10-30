import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { InstamartColors, InstamartRadii } from '../../../ui/theme/instamartTheme';
import { FESTIVE_TILES } from '../data/homeData';

interface Props {
  onTilePress?: (id: string) => void;
}

export const FestivePromoBlock: React.FC<Props> = ({ onTilePress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Co-Powered by Mandi Direct &bull; Festival Deals</Text>
      </View>

      <View style={styles.grid}>
        {FESTIVE_TILES.map((tile) => (
          <TouchableOpacity
            key={tile.id}
            style={styles.tile}
            onPress={() => onTilePress?.(tile.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.tileTitle} numberOfLines={2}>
              {tile.title}
            </Text>

            <Image source={{ uri: tile.img }} style={styles.tileImg} />

            <View style={styles.offerStrip}>
              <Text style={styles.offerText}>{tile.offer}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: InstamartColors.maroon,
    borderRadius: InstamartRadii.promoBlock,
    padding: 12,
  },
  headerRow: {
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  tile: {
    width: '31%',
    height: 98,
    backgroundColor: InstamartColors.maroonTile,
    borderRadius: 12,
    padding: 6,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  tileTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#FFFFFF',
    lineHeight: 13,
  },
  tileImg: {
    position: 'absolute',
    right: -4,
    bottom: 18,
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  offerStrip: {
    backgroundColor: InstamartColors.offerStrip,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },
  offerText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8,
    color: InstamartColors.offerStripText,
  },
});


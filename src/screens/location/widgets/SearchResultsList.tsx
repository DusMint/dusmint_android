import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlaceSuggestion } from '../data/locationData';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  results: PlaceSuggestion[];
  query: string;
  onSelectPlace: (place: PlaceSuggestion) => void;
}

export const SearchResultsList: React.FC<Props> = ({
  results,
  query,
  onSelectPlace,
}) => {
  if (results.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={36} color="#8FB6E8" style={{ marginBottom: 8 }} />
        <Text style={styles.emptyTitle}>No places found</Text>
        <Text style={styles.emptySubtitle}>
          We couldn't find any results for "{query}". Try checking for spelling or searching with a landmark.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.caption}>SEARCH RESULTS</Text>

      <View style={styles.card}>
        {results.map((place, index) => {
          const isLast = index === results.length - 1;
          return (
            <TouchableOpacity
              key={place.id}
              style={[styles.row, !isLast && styles.bottomDivider]}
              onPress={() => onSelectPlace(place)}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="location-outline" size={18} color={InstamartColors.accentBlue} />
              </View>

              <View style={styles.textColumn}>
                <Text style={styles.mainText}>{place.mainText}</Text>
                <Text style={styles.secondaryText} numberOfLines={1}>
                  {place.secondaryText}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  caption: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: '#777777',
    fontWeight: '600',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  bottomDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3EEFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
  },
  mainText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: InstamartColors.ink,
  },
  secondaryText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: InstamartColors.ink,
  },
  emptySubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
});


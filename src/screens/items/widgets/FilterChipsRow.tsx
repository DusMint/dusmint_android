import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  activeSort: string;
  isPriceDropActive: boolean;
  isVegOnlyActive: boolean;
  onFilterPress: () => void;
  onSortPress: () => void;
  onPriceDropToggle: () => void;
  onVegOnlyToggle: () => void;
}

export const FilterChipsRow: React.FC<Props> = ({
  activeSort,
  isPriceDropActive,
  isVegOnlyActive,
  onFilterPress,
  onSortPress,
  onPriceDropToggle,
  onVegOnlyToggle,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Filter Icon Button */}
        <TouchableOpacity style={styles.iconChip} onPress={onFilterPress} activeOpacity={0.7}>
          <Ionicons name="options-outline" size={16} color={InstamartColors.ink} />
        </TouchableOpacity>

        {/* 2. Sort By Button */}
        <TouchableOpacity
          style={[styles.chip, activeSort !== 'Relevance' && styles.activeChip]}
          onPress={onSortPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, activeSort !== 'Relevance' && styles.activeChipText]}>
            {activeSort === 'Relevance' ? 'Sort By' : activeSort}
          </Text>
          <Ionicons
            name="chevron-down"
            size={12}
            color={activeSort !== 'Relevance' ? '#2563C9' : InstamartColors.ink}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>

        {/* 3. Price Drop Toggle */}
        <TouchableOpacity
          style={[styles.chip, isPriceDropActive && styles.activeChip]}
          onPress={onPriceDropToggle}
          activeOpacity={0.7}
        >
          <Ionicons
            name="trending-down"
            size={13}
            color={isPriceDropActive ? '#2563C9' : '#B4410A'}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.chipText,
              { color: isPriceDropActive ? '#2563C9' : '#B4410A' },
            ]}
          >
            Price Drop
          </Text>
        </TouchableOpacity>

        {/* 4. Type / Veg Only */}
        <TouchableOpacity
          style={[styles.chip, isVegOnlyActive && styles.activeChip]}
          onPress={onVegOnlyToggle}
          activeOpacity={0.7}
        >
          <View style={styles.vegDot} />
          <Text style={[styles.chipText, isVegOnlyActive && styles.activeChipText]}>
            Veg Only
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 8,
    gap: 8,
    alignItems: 'center',
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9D9E6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9D9E6',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeChip: {
    backgroundColor: '#DCEBFF',
    borderColor: '#2563C9',
  },
  chipText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
    color: InstamartColors.ink,
  },
  activeChipText: {
    color: '#2563C9',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1B9A5B',
    marginRight: 6,
  },
});

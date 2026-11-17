import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { StoreCategoryItem } from '../data/categoriesData';

interface Props {
  category: StoreCategoryItem;
  storeCount: number;
  isSelected: boolean;
  onPress: (category: StoreCategoryItem) => void;
}

export const StoreCategoryCard: React.FC<Props> = ({
  category,
  storeCount,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: category.accentColor },
        isSelected && styles.selectedCard,
      ]}
      onPress={() => onPress(category)}
      activeOpacity={0.85}
    >
      <View style={styles.leftContent}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Ionicons name={category.iconName as any} size={22} color="#0F172A" />
          </View>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>
              {storeCount} {storeCount === 1 ? 'Store' : 'Stores'} Nearby
            </Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {category.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {category.subtitle}
        </Text>

        <View style={styles.actionRow}>
          <Text style={[styles.viewStoresText, isSelected && styles.activeText]}>
            {isSelected ? 'Viewing Stores' : 'Explore Stores'}
          </Text>
          <Ionicons
            name={isSelected ? 'chevron-down' : 'chevron-forward'}
            size={14}
            color={isSelected ? InstamartColors.accentBlue : '#0F172A'}
          />
        </View>
      </View>

      <Image
        source={{ uri: category.bannerUrl }}
        style={styles.bannerImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'transparent',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  selectedCard: {
    borderColor: InstamartColors.accentBlue,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowOpacity: 0.1,
  },
  leftContent: {
    flex: 1,
    paddingRight: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  badgePill: {
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    fontWeight: '600',
    color: '#0F172A',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewStoresText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  activeText: {
    color: InstamartColors.accentBlue,
  },
  bannerImage: {
    width: 86,
    height: 86,
    borderRadius: 16,
  },
});

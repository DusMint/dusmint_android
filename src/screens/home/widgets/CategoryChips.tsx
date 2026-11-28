import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ProduceCategoryItem,
  getDashboardHeroCategories,
} from '../data/produceCategories';
import { AppTypography, AppTextColors } from '../../../ui/theme/appTypography';

type ChipEntry =
  | { kind: 'produce'; item: ProduceCategoryItem }
  | { kind: 'view-all'; id: 'view-all' };

interface Props {
  title?: string;
  selectedCategoryId?: string;
  isVegOnly?: boolean;
  showViewAllTile?: boolean;
  onSelectCategory?: (id: string) => void;
  onSelectProduceItem?: (item: ProduceCategoryItem) => void;
  onViewAllPress?: () => void;
}

export const CategoryChips: React.FC<Props> = ({
  title = "What's On Your Mind?",
  selectedCategoryId,
  isVegOnly = false,
  showViewAllTile = true,
  onSelectCategory,
  onSelectProduceItem,
  onViewAllPress,
}) => {
  const entries = useMemo<ChipEntry[]>(() => {
    const heroItems = getDashboardHeroCategories(isVegOnly).map<ChipEntry>(
      (item) => ({ kind: 'produce', item })
    );
    if (showViewAllTile) {
      heroItems.push({ kind: 'view-all', id: 'view-all' });
    }
    return heroItems;
  }, [isVegOnly, showViewAllTile]);

  const handlePressItem = (item: ProduceCategoryItem) => {
    onSelectProduceItem?.(item);
    onSelectCategory?.(item.id);
  };

  const renderEntry = ({ item: entry }: { item: ChipEntry }) => {
    if (entry.kind === 'view-all') {
      return (
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => onViewAllPress?.()}
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel="View all categories"
        >
          <View style={styles.viewAllCircle}>
            <Ionicons name="grid-outline" size={24} color="#15803D" />
          </View>
          <Text style={styles.viewAllLabel} numberOfLines={2}>
            View All
          </Text>
        </TouchableOpacity>
      );
    }

    const { item } = entry;
    const isSelected = Boolean(
      selectedCategoryId && selectedCategoryId === item.id
    );

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handlePressItem(item)}
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel={item.label}
      >
        <View style={styles.cutoutBox}>
          <Image
            source={item.image}
            style={styles.foodImage}
            resizeMode="contain"
          />
        </View>

        <Text
          style={[styles.label, isSelected && styles.labelSelected]}
          numberOfLines={2}
        >
          {item.shortLabel || item.label}
        </Text>

        {isSelected && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showViewAllTile && onViewAllPress ? (
          <TouchableOpacity
            onPress={onViewAllPress}
            activeOpacity={0.7}
            style={styles.headerAction}
          >
            <Text style={styles.headerActionText}>View All</Text>
            <Ionicons name="chevron-forward" size={14} color="#15803D" />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={entries}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderEntry}
        keyExtractor={(entry) =>
          entry.kind === 'view-all' ? 'view-all' : entry.item.id
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...AppTypography.cardTitle,
  },
  headerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingLeft: 8,
  },
  headerActionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#15803D',
    marginRight: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingVertical: 2,
  },
  itemContainer: {
    width: 76,
    alignItems: 'center',
  },
  cutoutBox: {
    width: 68,
    height: 68,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodImage: {
    width: 66,
    height: 66,
    backgroundColor: '#FFFFFF',
  },
  viewAllCircle: {
    width: 64,
    height: 64,
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 32,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllLabel: {
    ...AppTypography.categoryLabelActive,
    color: '#15803D',
    marginTop: 5,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    height: 32,
  },
  label: {
    ...AppTypography.categoryLabel,
    color: AppTextColors.primary,
    marginTop: 5,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    height: 32,
  },
  labelSelected: {
    ...AppTypography.categoryLabelActive,
    color: '#15803D',
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
  },
  activeIndicator: {
    marginTop: 2,
    width: 18,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#15803D',
  },
});

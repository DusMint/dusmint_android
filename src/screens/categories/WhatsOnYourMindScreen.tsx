import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import {
  PRODUCE_CATEGORIES,
  PRODUCE_GROUP_TABS,
  ProduceCategoryItem,
  ProduceGroup,
} from '../home/data/produceCategories';
import { useAuthStore } from '../../state/useAuthStore';
import { useCartStore } from '../../state/useCartStore';
import { CartStickyBar } from '../../ui/components/CartStickyBar';
import { AppTypography, AppTextColors } from '../../ui/theme/appTypography';

type Props = NativeStackScreenProps<RootStackParamList, 'WhatsOnYourMind'>;

export const WhatsOnYourMindScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
  );

  const isVegOnly = useAuthStore((s) => s.isVegOnly);
  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());

  const [selectedGroup, setSelectedGroup] = useState<'all' | ProduceGroup>('all');

  useEffect(() => {
    if (
      isVegOnly &&
      selectedGroup !== 'all' &&
      selectedGroup !== 'vegetables' &&
      selectedGroup !== 'fruits'
    ) {
      setSelectedGroup('all');
    }
  }, [isVegOnly, selectedGroup]);

  const availableTabs = useMemo(
    () =>
      isVegOnly
        ? PRODUCE_GROUP_TABS.filter((tab) => tab.isVegSafe)
        : PRODUCE_GROUP_TABS,
    [isVegOnly]
  );

  const visibleItems = useMemo(() => {
    const basePool = isVegOnly
      ? PRODUCE_CATEGORIES.filter((item) => item.isVeg)
      : PRODUCE_CATEGORIES;
    if (selectedGroup === 'all') {
      return basePool;
    }
    return basePool.filter((item) => item.group === selectedGroup);
  }, [isVegOnly, selectedGroup]);

  const tileWidth = Math.floor((width - 32 - 20) / 3);
  const imgSize = Math.min(86, Math.max(68, tileWidth - 18));

  const handleSelectItem = (item: ProduceCategoryItem) => {
    navigation.navigate('CategoryShops', {
      categoryId: item.id,
      title: item.label,
    });
  };

  const renderTile = ({ item }: { item: ProduceCategoryItem }) => (
    <TouchableOpacity
      style={[styles.tileContainer, { width: tileWidth }]}
      onPress={() => handleSelectItem(item)}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={item.label}
    >
      <View style={[styles.imageStage, { width: imgSize + 6, height: imgSize + 6 }]}>
        <Image
          source={item.image}
          style={{ width: imgSize, height: imgSize, backgroundColor: '#FFFFFF' }}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.tileLabel} numberOfLines={2}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Sticky Header */}
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          WHAT&apos;S ON YOUR MIND?
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Search')}
          style={styles.iconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Search produce and stores"
        >
          <Ionicons name="search-outline" size={21} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Filter Pills Row */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {availableTabs.map((tab) => {
            const active = selectedGroup === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setSelectedGroup(tab.id)}
                activeOpacity={0.78}
                style={[styles.tabPill, active && styles.tabPillActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Pure White 3-Column Produce & Meat Grid */}
      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={renderTile}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[
          styles.gridContent,
          { paddingBottom: totalItemsCount > 0 ? 115 : Math.max(insets.bottom, 28) },
        ]}
        showsVerticalScrollIndicator={false}
      />

      {totalItemsCount > 0 && (
        <View
          style={[
            styles.floatingCartContainer,
            { bottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <CartStickyBar
            totalItems={totalItemsCount}
            totalPaise={totalPaise}
            onPressViewCart={() => navigation.navigate('Cart')}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#0F172A',
  },
  tabsWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  tabPillActive: {
    borderColor: '#15803D',
    backgroundColor: '#F0FDF4',
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  tabTextActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: '#FFFFFF',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  tileContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  imageStage: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    ...AppTypography.categoryLabel,
    color: AppTextColors.primary,
    fontSize: 12.5,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 2,
  },
  floatingCartContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
});

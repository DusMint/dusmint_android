import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { useCartStore } from '../../state/useCartStore';
import { CartStickyBar } from '../../ui/components/CartStickyBar';
import { FreeDeliveryStrip } from '../home/widgets/FreeDeliveryStrip';

// Categories Widgets & Data
import { CategoriesAppBar } from './widgets/CategoriesAppBar';
import { StoreArchRow } from './widgets/StoreArchRow';
import { CategorySection } from './widgets/CategorySection';
import {
  CATEGORY_SECTIONS_DATA,
  CategoryItem,
  StoreArchItem,
} from './data/categoriesData';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'BrowseTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const CategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Cart Store State
  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsScrolled(offsetY > 8);
  };

  const handleTilePress = (item: CategoryItem) => {
    navigation.navigate('ItemList', {
      categoryId: item.id,
      title: item.name,
    });
  };

  const handleStorePress = (store: StoreArchItem) => {
    navigation.navigate('ItemList', {
      vendorId: store.id,
      title: store.name,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* 1. Pinned Categories App Bar */}
      <CategoriesAppBar
        isScrolled={isScrolled}
        onSearchPress={() => navigation.navigate('Search')}
      />

      {/* 2. Scrollable Categories Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Shop by Store Row */}
        <StoreArchRow onStorePress={handleStorePress} />

        {/* 4 Categorized Sections */}
        {CATEGORY_SECTIONS_DATA.map((section) => (
          <CategorySection
            key={section.id}
            section={section}
            onTilePress={handleTilePress}
          />
        ))}

        {/* Bottom padding to clear strips & bottom nav */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* 3. Bottom Pinned Strips */}
      <View style={styles.bottomStripsContainer}>
        <FreeDeliveryStrip />

        {totalItemsCount > 0 && (
          <CartStickyBar
            totalItems={totalItemsCount}
            totalPaise={totalPaise}
            onPressViewCart={() => navigation.navigate('Cart')}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bottomStripsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

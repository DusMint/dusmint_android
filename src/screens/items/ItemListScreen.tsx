import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, ItemCard, CartStickyBar, TrustBadge } from '@dusmint/ui';
import { useCartStore } from '../../state/useCartStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ItemList'>;

const sampleCategoryItems = [
  {
    id: 'item-101',
    vendorId: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    categoryId: 'cat-veg',
    nameEn: 'Fresh Desi Tomato (Hybrid)',
    unit: '1 kg',
    stepQuantity: 1,
    pricePaise: 3200,
    mandiBandMinPaise: 2500,
    mandiBandMaxPaise: 3800,
    isInStock: true,
  },
  {
    id: 'item-102',
    vendorId: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    categoryId: 'cat-veg',
    nameEn: 'Indore Jyoti Potato (Aloo)',
    unit: '1 kg',
    stepQuantity: 1,
    pricePaise: 2800,
    mandiBandMinPaise: 2200,
    mandiBandMaxPaise: 3400,
    isInStock: true,
  },
  {
    id: 'item-103',
    vendorId: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    categoryId: 'cat-veg',
    nameEn: 'Nashik Red Onion (Pyaaz)',
    unit: '1 kg',
    stepQuantity: 1,
    pricePaise: 3500,
    mandiBandMinPaise: 3000,
    mandiBandMaxPaise: 4200,
    isInStock: true,
  },
  {
    id: 'item-104',
    vendorId: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    categoryId: 'cat-veg',
    nameEn: 'Fresh Palak (Spinach Bunch)',
    unit: '250 g',
    stepQuantity: 1,
    pricePaise: 1500,
    mandiBandMinPaise: 1200,
    mandiBandMaxPaise: 2000,
    isInStock: true,
  },
  {
    id: 'item-105',
    vendorId: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    categoryId: 'cat-veg',
    nameEn: 'Green Coriander (Dhaniya)',
    unit: '100 g',
    stepQuantity: 1,
    pricePaise: 1000,
    mandiBandMinPaise: 800,
    mandiBandMaxPaise: 1500,
    isInStock: true,
  },
  {
    id: 'item-106',
    vendorId: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    categoryId: 'cat-veg',
    nameEn: 'Fresh Ginger (Adrak)',
    unit: '250 g',
    stepQuantity: 1,
    pricePaise: 2500,
    mandiBandMinPaise: 2000,
    mandiBandMaxPaise: 3200,
    isInStock: true,
  },
];

export const ItemListScreen: React.FC<Props> = ({ route, navigation }) => {
  const { title } = route.params;

  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());
  const addItem = useCartStore((s) => s.addItem);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const getItemQuantity = useCartStore((s) => s.getItemQuantity);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={require('../../../assets/img/btn_back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.titleCol}>
          <Text style={styles.titleText}>{title}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.grid}>
          {sampleCategoryItems.map((item) => (
            <View key={item.id} style={styles.itemWrapper}>
              <ItemCard
                id={item.id}
                nameEn={item.nameEn}
                nameHi={item.nameHi}
                unit={item.unit}
                pricePaise={item.pricePaise}
                mandiBandMinPaise={item.mandiBandMinPaise}
                mandiBandMaxPaise={item.mandiBandMaxPaise}
                quantityInCart={getItemQuantity(item.id)}
                onAdd={() => addItem(item)}
                onIncrement={() => incrementItem(item.id)}
                onDecrement={() => decrementItem(item.id)}
              />
            </View>
          ))}
        </View>
        <View style={{ height: 90 }} />
      </ScrollView>

      <CartStickyBar
        totalItems={totalItemsCount}
        totalPaise={totalPaise}
        onPressViewCart={() => navigation.navigate('Cart')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: {
    paddingRight: Spacing.sm,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  titleCol: {
    flex: 1,
  },
  titleText: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },
  subText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.secondary,
    marginTop: 2,
  },
  scroll: {
    padding: Spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemWrapper: {
    width: '50%',
  },
});

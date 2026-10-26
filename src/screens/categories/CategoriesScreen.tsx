import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius, Shadows, CartStickyBar } from '@dusmint/ui';
import { useCartStore } from '../../state/useCartStore';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'CategoriesTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

const fullCategories = [
  {
    id: 'cat-veg',
    title: 'Fresh Vegetables',
    titleHi: 'ताजा सब्जियां',
    icon: '🥦',
    desc: 'Desi tomatoes, aloo, pyaaz, leafy palak, dhaniya & more',
    itemCount: '45+ Items',
    bgColor: '#DCFCE7',
  },
  {
    id: 'cat-fruit',
    title: 'Fresh Fruits',
    titleHi: 'ताजे फल',
    icon: '🍎',
    desc: 'Bananas, Shimla apples, papaya, citrus mosambi',
    itemCount: '30+ Items',
    bgColor: '#FEE2E2',
  },
  {
    id: 'cat-dairy',
    title: 'Milk & Dairy',
    titleHi: 'शुद्ध दूध व डेयरी',
    icon: '🥛',
    desc: 'Pure cow milk, fresh malai paneer, fresh dahi & chaas',
    itemCount: '20+ Items',
    bgColor: '#E0F2FE',
  },
  {
    id: 'cat-meat',
    title: 'Fresh Meat & Eggs',
    titleHi: 'ताजा मांस व अंडे',
    icon: '🍗',
    desc: 'Insulated pack chicken, farm-fresh desi eggs',
    itemCount: '15+ Items',
    bgColor: '#FFEDD5',
  },
  {
    id: 'cat-staple',
    title: 'Daily Staples & Dal',
    titleHi: 'दाल, आटा व चावल',
    icon: '🌾',
    desc: 'Chakki fresh atta, unpolished toor dal, basmati',
    itemCount: '50+ Items',
    bgColor: '#FEF3C7',
  },
];

export const CategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const totalItemsCount = useCartStore((s) => s.getTotalItemsCount());
  const totalPaise = useCartStore((s) => s.getTotalPaise());

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Categories</Text>
        <Text style={styles.headerSubtitle}>
          Choose a category to browse full-weight items from anchor vendors
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {fullCategories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('ItemList', {
                categoryId: cat.id,
                title: cat.title,
              })
            }
            style={styles.card}
          >
            <View style={[styles.iconBox, { backgroundColor: cat.bgColor }]}>
              <Text style={styles.icon}>{cat.icon}</Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.catTitle}>{cat.title}</Text>
              <Text style={styles.catVernacular}>{cat.titleHi}</Text>
              <Text style={styles.catDesc} numberOfLines={2}>
                {cat.desc}
              </Text>
              <Text style={styles.itemCount}>{cat.itemCount}</Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

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
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  list: {
    padding: Spacing.base,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.light,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 32,
  },
  info: {
    flex: 1,
  },
  catTitle: {
    fontFamily: Typography.fontFamily.headingBold,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  catVernacular: {
    fontFamily: Typography.fontFamily.bodyMedium,
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    marginTop: 1,
  },
  catDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 15,
  },
  itemCount: {
    fontFamily: Typography.fontFamily.bodyBold,
    fontSize: 10,
    color: Colors.secondary,
    marginTop: 4,
  },
  arrow: {
    fontSize: 24,
    color: Colors.placeholder,
    marginLeft: 8,
  },
});

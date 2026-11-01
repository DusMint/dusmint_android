import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { ProductItem } from '../../home/data/homeData';
import { DID_YOU_FORGET_TABS, FORGET_PRODUCTS } from '../data/cartData';
import { MiniProductCard } from './MiniProductCard';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  onProductPress: (product: ProductItem) => void;
}

export const DidYouForgetCard: React.FC<Props> = ({ onProductPress }) => {
  const [activeTab, setActiveTab] = useState(DID_YOU_FORGET_TABS[0]);
  const currentProducts = FORGET_PRODUCTS[activeTab] || FORGET_PRODUCTS[DID_YOU_FORGET_TABS[0]];

  return (
    <View style={styles.card}>
      {/* 1. Scrollable Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {DID_YOU_FORGET_TABS.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, isActive && styles.activeTabBtn]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 2. Horizontal Mini Products List */}
      <FlatList
        data={currentProducts}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MiniProductCard
            product={item}
            onPress={onProductPress}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingTop: 14,
    paddingBottom: 16,
    marginHorizontal: 12,
    marginTop: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    gap: 16,
    paddingBottom: 2,
  },
  tabBtn: {
    paddingBottom: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabBtn: {
    borderBottomColor: '#222222',
  },
  tabText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#666666',
  },
  activeTabText: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    gap: 10,
  },
});

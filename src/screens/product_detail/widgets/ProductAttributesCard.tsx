import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { ProductAttributeTab } from '../data/productDetailData';

interface Props {
  tabs: ProductAttributeTab[];
}

export const ProductAttributesCard: React.FC<Props> = ({ tabs }) => {
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || '');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  if (!activeTab) return null;

  return (
    <View style={styles.card}>
      {/* 1. Horizontal Tab Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {tabs.map((tab) => {
          const isSelected = tab.id === activeTabId;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.pill, isSelected ? styles.activePill : styles.inactivePill]}
              onPress={() => {
                setActiveTabId(tab.id);
                setIsExpanded(false);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  isSelected ? styles.activePillText : styles.inactivePillText,
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 2. Tab Content */}
      <View style={styles.contentContainer}>
        {/* Key-Value Highlights */}
        {activeTab.rows && (
          <View>
            {(isExpanded ? activeTab.rows : activeTab.rows.slice(0, 4)).map((row, index) => (
              <View key={index} style={styles.kvRow}>
                <Text style={styles.kvLabel}>{row.label}</Text>
                <Text style={styles.kvValue}>{row.value}</Text>
              </View>
            ))}

            {activeTab.rows.length > 4 && (
              <TouchableOpacity
                style={styles.showMoreBtn}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.showMoreText}>
                  {isExpanded ? 'Show less' : 'Show more'}
                </Text>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={InstamartColors.accentBlue}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Body Text */}
        {activeTab.bodyText && (
          <Text style={styles.bodyText}>{activeTab.bodyText}</Text>
        )}

        {/* Bullets List */}
        {activeTab.bullets && (
          <View style={styles.bulletsList}>
            {activeTab.bullets.map((b, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  pill: {
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    backgroundColor: '#111111',
  },
  inactivePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9D9E6',
  },
  pillText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
  },
  activePillText: {
    color: '#FFFFFF',
  },
  inactivePillText: {
    color: '#444444',
  },
  contentContainer: {
    marginTop: 6,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  kvLabel: {
    maxWidth: 130,
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#444444',
  },
  kvValue: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    gap: 4,
  },
  showMoreText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: InstamartColors.accentBlue,
  },
  bodyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#444444',
    paddingVertical: 6,
  },
  bulletsList: {
    gap: 8,
    paddingVertical: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: InstamartColors.accentBlue,
    marginTop: 6,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#444444',
  },
});


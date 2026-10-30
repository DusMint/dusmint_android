import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  isScrolled?: boolean;
  onSearchPress?: () => void;
}

export const CategoriesAppBar: React.FC<Props> = ({ isScrolled = false, onSearchPress }) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topInset + 6 },
        isScrolled && styles.scrolledShadow,
      ]}
    >
      <View style={styles.contentRow}>
        <Text style={styles.title}>Categories</Text>

        <TouchableOpacity
          style={styles.searchBtn}
          onPress={onSearchPress}
          activeOpacity={0.7}
          accessibilityLabel="Search categories"
        >
          <Ionicons name="search" size={22} color={InstamartColors.ink} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  scrolledShadow: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderBottomColor: '#EAEAEA',
  },
  contentRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  searchBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});


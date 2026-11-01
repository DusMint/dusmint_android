import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

export interface FilterState {
  onlyInStock: boolean;
  onlyPriceDrop: boolean;
  onlyVeg: boolean;
  maxPrice?: number;
}

interface Props {
  visible: boolean;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onClose: () => void;
}

type TabType = 'Preference' | 'Availability' | 'Price';

export const FilterBottomSheet: React.FC<Props> = ({
  visible,
  filters,
  onApply,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('Preference');
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Sync state when opened
  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);

  const handleClearAll = () => {
    setLocalFilters({
      onlyInStock: false,
      onlyPriceDrop: false,
      onlyVeg: false,
      maxPrice: undefined,
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Filter Products</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={22} color={InstamartColors.ink} />
                </TouchableOpacity>
              </View>

              {/* Body: Left Tabs + Right Options */}
              <View style={styles.body}>
                {/* Left Tabs */}
                <View style={styles.tabColumn}>
                  {(['Preference', 'Availability', 'Price'] as TabType[]).map((tab) => {
                    const isSelected = activeTab === tab;
                    return (
                      <TouchableOpacity
                        key={tab}
                        style={[styles.tabItem, isSelected && styles.tabItemSelected]}
                        onPress={() => setActiveTab(tab)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.tabItemText,
                            isSelected && styles.tabItemTextSelected,
                          ]}
                        >
                          {tab}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Right Options Content */}
                <View style={styles.contentColumn}>
                  {activeTab === 'Preference' && (
                    <View style={styles.optionSection}>
                      <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() =>
                          setLocalFilters((prev) => ({ ...prev, onlyVeg: !prev.onlyVeg }))
                        }
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            localFilters.onlyVeg && styles.checkboxActive,
                          ]}
                        >
                          {localFilters.onlyVeg && (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          )}
                        </View>
                        <Text style={styles.checkboxLabel}>Pure Veg Only</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            onlyPriceDrop: !prev.onlyPriceDrop,
                          }))
                        }
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            localFilters.onlyPriceDrop && styles.checkboxActive,
                          ]}
                        >
                          {localFilters.onlyPriceDrop && (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          )}
                        </View>
                        <Text style={styles.checkboxLabel}>Price Drop Deals</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {activeTab === 'Availability' && (
                    <View style={styles.optionSection}>
                      <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            onlyInStock: !prev.onlyInStock,
                          }))
                        }
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            localFilters.onlyInStock && styles.checkboxActive,
                          ]}
                        >
                          {localFilters.onlyInStock && (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          )}
                        </View>
                        <Text style={styles.checkboxLabel}>In Stock Only</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {activeTab === 'Price' && (
                    <View style={styles.optionSection}>
                      {[30, 50, 100].map((price) => {
                        const isChosen = localFilters.maxPrice === price;
                        return (
                          <TouchableOpacity
                            key={price}
                            style={styles.checkboxRow}
                            onPress={() =>
                              setLocalFilters((prev) => ({
                                ...prev,
                                maxPrice: isChosen ? undefined : price,
                              }))
                            }
                            activeOpacity={0.7}
                          >
                            <View
                              style={[
                                styles.checkbox,
                                isChosen && styles.checkboxActive,
                              ]}
                            >
                              {isChosen && (
                                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                              )}
                            </View>
                            <Text style={styles.checkboxLabel}>Under ₹{price}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              </View>

              {/* Bottom Actions */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={handleClearAll}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearBtnText}>Clear all</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={handleApply}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 380,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  tabColumn: {
    width: 120,
    backgroundColor: '#F8F9FA',
    borderRightWidth: 1,
    borderRightColor: '#EEEEEE',
  },
  tabItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  tabItemSelected: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 3,
    borderLeftColor: InstamartColors.accentBlue,
  },
  tabItemText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#666666',
  },
  tabItemTextSelected: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    color: InstamartColors.ink,
  },
  contentColumn: {
    flex: 1,
    padding: 16,
  },
  optionSection: {
    gap: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: InstamartColors.accentBlue,
    borderColor: InstamartColors.accentBlue,
  },
  checkboxLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#333333',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  clearBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  clearBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#666666',
  },
  applyBtn: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: InstamartColors.accentBlue,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});


import React from 'react';
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

export type SortOption =
  | 'Relevance'
  | 'Price: Low to High'
  | 'Price: High to Low'
  | 'Discount'
  | 'Delivery Time';

interface Props {
  visible: boolean;
  activeSort: SortOption;
  onSelect: (option: SortOption) => void;
  onClose: () => void;
}

const SORT_OPTIONS: SortOption[] = [
  'Relevance',
  'Price: Low to High',
  'Price: High to Low',
  'Discount',
  'Delivery Time',
];

export const SortBottomSheet: React.FC<Props> = ({
  visible,
  activeSort,
  onSelect,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Drag Handle */}
              <View style={styles.dragHandle} />

              {/* Title & Close */}
              <View style={styles.header}>
                <Text style={styles.title}>Sort by</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={22} color={InstamartColors.ink} />
                </TouchableOpacity>
              </View>

              {/* Options */}
              <View style={styles.optionsList}>
                {SORT_OPTIONS.map((option) => {
                  const isSelected = activeSort === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={styles.optionRow}
                      onPress={() => {
                        onSelect(option);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.selectedOptionText,
                        ]}
                      >
                        {option}
                      </Text>
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioCircleSelected,
                        ]}
                      >
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
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
    paddingTop: 10,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  optionsList: {
    gap: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  optionText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#333333',
  },
  selectedOptionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    color: InstamartColors.accentBlue, // #2F4FD8
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: InstamartColors.accentBlue,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: InstamartColors.accentBlue,
  },
});

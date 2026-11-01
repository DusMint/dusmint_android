import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onFocus?: () => void;
}

export const LocationSearchField: React.FC<Props> = ({
  value,
  onChangeText,
  onClear,
  onFocus,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search an area or address"
        placeholderTextColor="#888888"
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        autoCorrect={false}
      />

      {value.length > 0 ? (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle" size={19} color="#888888" />
        </TouchableOpacity>
      ) : (
        <View style={styles.actionBtn}>
          <Ionicons name="search-outline" size={20} color="#555555" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1E4EA',
    marginHorizontal: 16,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: InstamartColors.ink,
    paddingVertical: 0,
  },
  actionBtn: {
    marginLeft: 8,
  },
});

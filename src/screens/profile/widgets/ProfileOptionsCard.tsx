import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { ProfileOption } from '../data/profileData';

interface Props {
  options: ProfileOption[];
  onOptionPress: (option: ProfileOption) => void;
}

export const ProfileOptionsCard: React.FC<Props> = ({ options, onOptionPress }) => {
  return (
    <View style={styles.card}>
      {options.map((option, index) => {
        const isLast = index === options.length - 1;
        return (
          <React.Fragment key={option.id}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => onOptionPress(option)}
              activeOpacity={0.7}
            >
              <View style={styles.left}>
                <Ionicons
                  name={option.iconName as any}
                  size={20}
                  color="#333333"
                  style={styles.icon}
                />
                <Text style={styles.label}>{option.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999999" />
            </TouchableOpacity>
            {!isLast && <View style={styles.divider} />}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E4EA',
    borderRadius: 20,
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  row: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    fontWeight: '500',
    color: InstamartColors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },
});


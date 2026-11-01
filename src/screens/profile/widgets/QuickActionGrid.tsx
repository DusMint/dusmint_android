import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';
import { QuickActionItem } from '../data/profileData';

interface Props {
  actions: QuickActionItem[];
  onActionPress: (action: QuickActionItem) => void;
}

export const QuickActionGrid: React.FC<Props> = ({ actions, onActionPress }) => {
  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={styles.tile}
          onPress={() => onActionPress(action)}
          activeOpacity={0.7}
        >
          <View style={styles.iconRow}>
            <Ionicons
              name={action.iconName as any}
              size={22}
              color="#333333"
            />
            {action.badgeText && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{action.badgeText}</Text>
              </View>
            )}
          </View>
          <Text style={styles.label} numberOfLines={2}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: 16,
    gap: 8,
  },
  tile: {
    flex: 1,
    height: 82,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E4EA',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: '#E4F7F1',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    fontWeight: '700',
    color: '#1B9A5B',
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    fontWeight: '500',
    color: '#333333',
    lineHeight: 13,
  },
});

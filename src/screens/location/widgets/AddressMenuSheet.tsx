import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SavedAddressItem } from '../data/locationData';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  visible: boolean;
  address: SavedAddressItem | null;
  onClose: () => void;
  onEdit: (address: SavedAddressItem) => void;
  onSetDefault: (address: SavedAddressItem) => void;
  onDelete: (address: SavedAddressItem) => void;
}

export const AddressMenuSheet: React.FC<Props> = ({
  visible,
  address,
  onClose,
  onEdit,
  onSetDefault,
  onDelete,
}) => {
  if (!address) return null;

  const handleDelete = () => {
    onClose();
    if (address.isSelected) {
      Alert.alert(
        'Cannot Delete',
        'This is your currently active delivery address. Please select another address first.'
      );
      return;
    }

    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${address.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(address),
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.header}>
                <Text style={styles.title}>{address.name}</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={20} color={InstamartColors.ink} />
                </TouchableOpacity>
              </View>

              {/* Set Default */}
              {!address.isDefault && (
                <TouchableOpacity
                  style={styles.actionRow}
                  onPress={() => {
                    onClose();
                    onSetDefault(address);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="star-outline" size={18} color={InstamartColors.ink} style={styles.icon} />
                  <Text style={styles.actionText}>Set as default</Text>
                </TouchableOpacity>
              )}

              {/* Edit */}
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => {
                  onClose();
                  onEdit(address);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={18} color={InstamartColors.ink} style={styles.icon} />
                <Text style={styles.actionText}>Edit address</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Delete */}
              <TouchableOpacity
                style={styles.actionRow}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="#D32F2F" style={styles.icon} />
                <Text style={styles.deleteText}>Delete address</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginBottom: 6,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: InstamartColors.ink,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  icon: {
    marginRight: 14,
  },
  actionText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: InstamartColors.ink,
  },
  deleteText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#D32F2F',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
});

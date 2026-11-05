import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Typography } from '@dusmint/ui';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
}) => {
  const isInteractive = !disabled && !loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={isInteractive ? onPress : undefined}
      activeOpacity={0.85}
      disabled={!isInteractive}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{
        disabled,
        busy: loading,
      }}
    >
      {loading ? (
        <ActivityIndicator size={22} color="#FFFFFF" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.primaryGreen || '#047A36',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonDisabled: {
    backgroundColor: Colors.primaryGreenDisabled || 'rgba(4, 122, 54, 0.45)',
  },
  text: {
    fontSize: 17,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.onPrimary || '#FFFFFF',
    textTransform: 'uppercase',
  },
});

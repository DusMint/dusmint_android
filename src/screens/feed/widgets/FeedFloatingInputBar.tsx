import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '../../../state/useCartStore';
import { AppTypography, AppTextColors } from '../../../ui/theme/appTypography';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitText: () => void;
  onMicPress: () => void;
  isListening: boolean;
  onCartPress: () => void;
  onNewPress?: () => void;
}

export const FeedFloatingInputBar: React.FC<Props> = ({
  value,
  onChangeText,
  onSubmitText,
  onMicPress,
  isListening,
  onCartPress,
  onNewPress,
}) => {
  const insets = useSafeAreaInsets();
  const cartItemCount = useCartStore((s) => s.getTotalItemsCount());
  const hasText = value.trim().length > 0;

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.container}>
        {/* Left Action: New / Plus Button */}
        <TouchableOpacity
          style={styles.circleIconButton}
          onPress={onNewPress}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color="#374151" />
        </TouchableOpacity>

        {/* Left Action: Cart Shortcut Pill */}
        <TouchableOpacity
          style={styles.cartButton}
          onPress={onCartPress}
          activeOpacity={0.7}
        >
          <Ionicons name="cart-outline" size={20} color="#374151" />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Center: Interactive Text Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={onChangeText}
            placeholder={isListening ? "Listening... boliyen" : "Boliyen ya likhein... e.g. 1kg Tamatar"}
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            onSubmitEditing={onSubmitText}
            autoCorrect={false}
          />
          {hasText && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => onChangeText('')}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={17} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Right Action: Glowing Purple Mic OR Send Arrow */}
        {hasText ? (
          <TouchableOpacity
            style={[styles.primaryActionBtn, styles.sendBtnBg]}
            onPress={onSubmitText}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.primaryActionBtn,
              isListening ? styles.listeningMicBtnBg : styles.micBtnBg,
            ]}
            onPress={onMicPress}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isListening ? "mic" : "mic-outline"}
              size={21}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Subtle Disclaimer Note below bar (Matching Zomato UI) */}
      <Text style={styles.disclaimerText}>
        AI-powered lowest price comparison. Real-time rates from local stores.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.8)',
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  circleIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#059669',
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 9.5,
    color: '#FFFFFF',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  textInput: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: AppTextColors.primary,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  clearBtn: {
    padding: 4,
  },
  primaryActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  micBtnBg: {
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
  },
  listeningMicBtnBg: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  sendBtnBg: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
  },
  disclaimerText: {
    ...AppTypography.badgeText,
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.2,
  },
});

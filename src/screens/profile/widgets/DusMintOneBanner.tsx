import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onPress?: () => void;
}

export const DusMintOneBanner: React.FC<Props> = ({ onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      Alert.alert(
        'DusMint Fresh Membership',
        'Save on every daily purchase with zero delivery fees, exclusive discounts on farm-fresh vegetables and daily essentials, plus priority 10-minute dispatch from your local mandi!',
        [{ text: 'Got It' }]
      );
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="DusMint Fresh Membership"
    >
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          {/* Typographic "fresh" brand logo in rich green */}
          <Image
            source={require('../../../../assets/images/fresh_club_logo.png')}
            style={styles.freshLogo}
            resizeMode="contain"
          />
          <View style={styles.joinBadge}>
            <Text style={styles.joinBadgeText}>JOIN NOW</Text>
          </View>
        </View>
        <Ionicons name="chevron-down" size={18} color="#94A3B8" />
      </View>

      <Text style={styles.title}>
        Zero delivery fees & extra mandi savings on every order
      </Text>
      <Text style={styles.subtitle}>
        Unlock VIP farm-fresh benefits on your daily essentials
      </Text>
    </TouchableOpacity>
  );
};

// Aliased export for clarity
export const DusMintFreshBanner = DusMintOneBanner;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  freshLogo: {
    width: 82,
    height: 28,
  },
  joinBadge: {
    backgroundColor: '#047A36',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  joinBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans-SemiBold',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#0F172A',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'PlusJakartaSans-Regular',
  },
});

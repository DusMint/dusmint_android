import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  storeUrl?: string;
  onPress?: () => void;
}

const DEFAULT_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.dusmint.customer&pcampaignid=web_share';

export const RateAppFeedbackCard: React.FC<Props> = ({
  storeUrl = DEFAULT_PLAY_STORE_URL,
  onPress,
}) => {
  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(storeUrl);
      if (canOpen) {
        await Linking.openURL(storeUrl);
      } else {
        await Linking.openURL(storeUrl);
      }
    } catch (err) {
      console.warn('Error opening Play Store link:', err);
      Alert.alert(
        'Rate Us on Play Store',
        'Could not open Play Store directly. Please search for DusMint on the Google Play Store.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Got feedback? Let us know. Rate us on Play Store"
    >
      {/* Left text column */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Got feedback? Let us know</Text>
        <Text style={styles.sublink}>Rate us on Play Store</Text>
      </View>

      {/* Right playful illustration matching Play Store rating badge */}
      <View style={styles.illustrationContainer}>
        {/* Floating Heart Speech Bubble */}
        <View style={styles.heartBubble}>
          <Ionicons name="heart" size={14} color="#E11D48" />
        </View>

        {/* Floating Gold Sparkle */}
        <Ionicons
          name="sparkles"
          size={12}
          color="#FBBF24"
          style={styles.sparkle}
        />

        {/* Slanted Green Rating Plate */}
        <View style={styles.ratingPlate}>
          <Ionicons name="star" size={13} color="#E11D48" />
          <Ionicons name="star" size={13} color="#E11D48" />
          <Ionicons name="star" size={13} color="#E11D48" />
          <Ionicons name="star" size={13} color="#E11D48" />
          <Ionicons name="star" size={13} color="#E11D48" />
        </View>

        {/* Hand pointer indicator */}
        <View style={styles.handIndicator}>
          <Ionicons
            name="hand-left"
            size={16}
            color="#FDBA74"
            style={{ transform: [{ rotate: '45deg' }] }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 12,
  },
  title: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 15.5,
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sublink: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13.5,
    color: '#E11D48',
    letterSpacing: -0.1,
  },
  illustrationContainer: {
    width: 104,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heartBubble: {
    position: 'absolute',
    top: -4,
    left: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 3,
  },
  sparkle: {
    position: 'absolute',
    top: -2,
    right: 8,
    zIndex: 2,
  },
  ratingPlate: {
    backgroundColor: '#22C55E',
    borderColor: '#16A34A',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
    transform: [{ rotate: '-14deg' }],
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  handIndicator: {
    position: 'absolute',
    bottom: -5,
    right: 4,
    zIndex: 4,
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
} from 'react-native';

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

      {/* Right clean graphic sticker illustration */}
      <View style={styles.illustrationWrapper}>
        <Image
          source={require('../../../../assets/images/feedback_rate_card.png')}
          style={styles.illustrationImage}
          resizeMode="contain"
        />
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
    paddingVertical: 14,
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
  illustrationWrapper: {
    width: 90,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
});

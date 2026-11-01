import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  visible: boolean;
  productName: string;
  isWishlisted: boolean;
  onBackPress: () => void;
  onWishlistToggle: () => void;
}

export const DetailCollapsedAppBar: React.FC<Props> = ({
  visible,
  productName,
  isWishlisted,
  onBackPress,
  onWishlistToggle,
}) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;

  if (!visible) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${productName} on Shuddh Mandi!`,
      });
    } catch {
      // ignore
    }
  };

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight + 6 }]}>
      <View style={styles.bar}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onBackPress}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={InstamartColors.ink} />
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {productName}
        </Text>

        <View style={styles.rightGroup}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onWishlistToggle}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={18}
              color={isWishlisted ? '#D32F2F' : '#333333'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={18} color="#333333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    zIndex: 100,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  bar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  rightGroup: {
    flexDirection: 'row',
    gap: 8,
  },
});

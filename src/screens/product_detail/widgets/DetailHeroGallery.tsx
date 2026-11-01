import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InstamartColors } from '../../../ui/theme/instamartTheme';

interface Props {
  images: string[];
  deliveryMins: string;
  productName: string;
  isWishlisted: boolean;
  onBackPress: () => void;
  onWishlistToggle: () => void;
}

export const DetailHeroGallery: React.FC<Props> = ({
  images,
  deliveryMins,
  productName,
  isWishlisted,
  onBackPress,
  onWishlistToggle,
}) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;
  const screenWidth = Dimensions.get('window').width;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (slide !== activeIndex) {
      setActiveIndex(slide);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${productName} on Shuddh Mandi!\nDelivered fresh in ${deliveryMins}.`,
      });
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Horizontal Paged Image Carousel */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {images.map((imgUri, index) => (
          <View key={index} style={[styles.imageSlide, { width: screenWidth }]}>
            <Image
              source={{ uri: imgUri }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        ))}
      </ScrollView>

      {/* 2. Floating Circular Top Action Buttons */}
      <View style={[styles.topActions, { top: statusBarHeight + 10 }]}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={onBackPress}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-down" size={22} color={InstamartColors.ink} />
        </TouchableOpacity>

        <View style={styles.rightGroup}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onWishlistToggle}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={20}
              color={isWishlisted ? '#D32F2F' : '#333333'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleBtn}
            onPress={handleShare}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="share-social-outline" size={19} color="#333333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Centered Pagination Dots */}
      <View style={styles.dotsContainer}>
        {images.map((_, i) => {
          const isActive = i === activeIndex;
          return (
            <View
              key={i}
              style={[
                styles.dot,
                isActive ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          );
        })}
      </View>

      {/* 4. Delivery Time Label (Bottom-Right) */}
      <View style={styles.deliveryBadge}>
        <Ionicons name="flash" size={11} color="#FF8C00" style={{ marginRight: 2 }} />
        <Text style={styles.deliveryText}>{deliveryMins}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 292,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  imageSlide: {
    height: 292,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 28,
    paddingTop: 48,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  topActions: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  rightGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 18,
    backgroundColor: InstamartColors.accentBlue,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#BBBBBB',
  },
  deliveryBadge: {
    position: 'absolute',
    right: 16,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deliveryText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    fontWeight: '700',
    color: '#666666',
  },
});

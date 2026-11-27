import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { InstamartRadii } from '../../../ui/theme/instamartTheme';
import { PROMO_BANNERS, PromoBanner } from '../data/homeData';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32; // 16px horizontal margins
const BANNER_HEIGHT = 152;

interface Props {
  onBannerPress?: (banner: PromoBanner) => void;
}

export const BrandBannerCarousel: React.FC<Props> = ({ onBannerPress }) => {
  const [activePage, setActivePage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isInteracting = useRef(false);

  // Auto-slide every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isInteracting.current && flatListRef.current) {
        const nextPage = (activePage + 1) % PROMO_BANNERS.length;
        flatListRef.current.scrollToIndex({
          index: nextPage,
          animated: true,
        });
        setActivePage(nextPage);
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [activePage]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const page = Math.round(offsetX / BANNER_WIDTH);
      if (page >= 0 && page < PROMO_BANNERS.length && page !== activePage) {
        setActivePage(page);
      }
    },
    [activePage]
  );

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    setActivePage(index);
  };

  return (
    <View style={styles.container}>
      {/* 1. Swipeable Paged Banners */}
      <FlatList
        ref={flatListRef}
        data={PROMO_BANNERS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH}
        decelerationRate="fast"
        snapToAlignment="center"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onTouchStart={() => {
          isInteracting.current = true;
        }}
        onTouchEnd={() => {
          setTimeout(() => {
            isInteracting.current = false;
          }, 2000);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.banner, { backgroundColor: item.bgColor }]}
            activeOpacity={0.9}
            onPress={() => onBannerPress?.(item)}
          >
            {/* 1. Photorealistic Full Banner Image */}
            {item.image && (
              <Image
                source={item.image}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
            )}

            {/* 2. Soft horizontal scrim to guarantee pristine text legibility */}
            <Svg
              style={StyleSheet.absoluteFillObject}
              width={BANNER_WIDTH}
              height={BANNER_HEIGHT}
            >
              <Defs>
                <SvgGradient id={`bannerGrad-${index}`} x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#031A10" stopOpacity={0.9} />
                  <Stop offset="42%" stopColor="#031A10" stopOpacity={0.65} />
                  <Stop offset="72%" stopColor="#031A10" stopOpacity={0.15} />
                  <Stop offset="100%" stopColor="#031A10" stopOpacity={0} />
                </SvgGradient>
              </Defs>
              <Rect
                width={BANNER_WIDTH}
                height={BANNER_HEIGHT}
                fill={`url(#bannerGrad-${index})`}
              />
            </Svg>

            {/* 3. Sleek minimal overlay content */}
            <View style={styles.content}>
              <View
                style={[
                  styles.subTitleBadge,
                  { backgroundColor: item.subColor || '#6EE7B7' },
                ]}
              >
                <Text
                  style={[
                    styles.subTitle,
                    { color: item.btnTextColor || '#0F3827' },
                  ]}
                >
                  {item.subTitle}
                </Text>
              </View>

              <Text style={styles.headline} numberOfLines={2}>
                {item.headline}
              </Text>
              <Text style={styles.body} numberOfLines={1}>
                {item.body}
              </Text>

              <View
                style={[
                  styles.shopNowBtn,
                  { backgroundColor: item.subColor || '#FFFFFF' },
                ]}
              >
                <Text
                  style={[
                    styles.shopNowText,
                    { color: item.btnTextColor || '#111111' },
                  ]}
                >
                  {item.btnText}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={12}
                  color={item.btnTextColor || '#111111'}
                  style={{ marginLeft: 2 }}
                />
              </View>
            </View>

            {/* 4. Sleek Counter Chip */}
            <View style={styles.counterChip}>
              <Text style={styles.counterText}>
                {index + 1}/{PROMO_BANNERS.length}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* 2. Interactive Dots Indicator */}
      <View style={styles.dotsRow}>
        {PROMO_BANNERS.map((_, idx) => (
          <TouchableOpacity
            key={`dot-${idx}`}
            onPress={() => scrollToIndex(idx)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          >
            <View
              style={[
                styles.dot,
                activePage === idx ? styles.activeDot : null,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  banner: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: InstamartRadii.hero,
    padding: 16,
    marginHorizontal: 16,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    maxWidth: '62%',
    zIndex: 2,
  },
  subTitleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  subTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 2,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  body: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shopNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginTop: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  shopNowText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10,
    letterSpacing: 0.3,
  },
  counterChip: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 2,
  },
  counterText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    width: 20,
    borderRadius: 4,
    backgroundColor: '#374151',
  },
});

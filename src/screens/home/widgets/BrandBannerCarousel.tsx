import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { InstamartRadii } from '../../../ui/theme/instamartTheme';
import { PROMO_BANNERS, PromoBanner } from '../data/homeData';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32; // 16px horizontal margins

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
            <View style={styles.content}>
              <Text style={[styles.subTitle, { color: item.subColor }]}>
                {item.subTitle}
              </Text>
              <Text style={styles.headline}>{item.headline}</Text>
              <Text style={styles.body}>{item.body}</Text>

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
              </View>
            </View>

            {/* Dynamic Counter Chip */}
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
    height: 144,
    borderRadius: InstamartRadii.hero,
    padding: 16,
    marginHorizontal: 16,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  content: {
    maxWidth: '75%',
  },
  subTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headline: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 3,
    lineHeight: 21,
  },
  body: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#E2E8F0',
    marginTop: 3,
  },
  shopNowBtn: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  shopNowText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    letterSpacing: 0.3,
  },
  counterChip: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  counterText: {
    fontFamily: 'Poppins_600SemiBold',
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

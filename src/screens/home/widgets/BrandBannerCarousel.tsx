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
import { InstamartRadii } from '../../../ui/theme/instamartTheme';
import { PROMO_BANNERS, PromoBanner } from '../data/homeData';

const { width } = Dimensions.get('window');
const BANNER_SPACING = 12;
const BANNER_WIDTH = width - 32; // 16px horizontal margins
const BANNER_HEIGHT = Math.round(BANNER_WIDTH * (9 / 16));

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
        flatListRef.current.scrollToOffset({
          offset: nextPage * (BANNER_WIDTH + BANNER_SPACING),
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
      const page = Math.round(offsetX / (BANNER_WIDTH + BANNER_SPACING));
      if (page >= 0 && page < PROMO_BANNERS.length && page !== activePage) {
        setActivePage(page);
      }
    },
    [activePage]
  );

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * (BANNER_WIDTH + BANNER_SPACING),
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
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH + BANNER_SPACING}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: BANNER_SPACING }} />}
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
            style={styles.banner}
            activeOpacity={0.92}
            onPress={() => onBannerPress?.(item)}
          >
            {/* Complete Full-Bleed Marketing Banner Image (with integrated typography) */}
            {item.image && (
              <Image
                source={item.image}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            )}

            {/* Subtle Counter Chip */}
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
  listContent: {
    paddingHorizontal: 16,
  },
  banner: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: InstamartRadii.hero,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  counterChip: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
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

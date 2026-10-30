import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { InstamartColors, InstamartRadii } from '../../../ui/theme/instamartTheme';

const { width } = Dimensions.get('window');

export const BrandBannerCarousel: React.FC = () => {
  const [activePage, setActivePage] = useState(0);

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <View style={styles.content}>
          <Text style={styles.subTitle}>EXCLUSIVE OFFERS</Text>
          <Text style={styles.headline}>Up to 50% Off on Staples</Text>
          <Text style={styles.body}>Aashirvaad, Tata, Fortune & more</Text>

          <TouchableOpacity style={styles.shopNowBtn} activeOpacity={0.8}>
            <Text style={styles.shopNowText}>SHOP NOW</Text>
          </TouchableOpacity>
        </View>

        {/* Counter chip */}
        <View style={styles.counterChip}>
          <Text style={styles.counterText}>1/5</Text>
        </View>
      </View>

      {/* Dots Indicator */}
      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  banner: {
    height: 140,
    backgroundColor: '#3A2A1A',
    borderRadius: InstamartRadii.hero,
    padding: 16,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    maxWidth: '75%',
  },
  subTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#FFB36B',
    letterSpacing: 0.5,
  },
  headline: {
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 2,
    lineHeight: 20,
  },
  body: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#DDDDDD',
    marginTop: 2,
  },
  shopNowBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  shopNowText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#3A2A1A',
  },
  counterChip: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  counterText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CCCCCC',
  },
  activeDot: {
    width: 18,
    borderRadius: 3,
    backgroundColor: '#555555',
  },
});


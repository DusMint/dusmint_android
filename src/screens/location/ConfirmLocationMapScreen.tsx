import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  Dimensions,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import Svg, { Rect, Path, Circle, Text as SvgText, G } from 'react-native-svg';
import { InstamartColors } from '../../ui/theme/instamartTheme';
import { useLocationStore } from '../../state/useLocationStore';

type Props = NativeStackScreenProps<RootStackParamList, any>;

export const ConfirmLocationMapScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;
  const screenWidth = Dimensions.get('window').width;

  const currentAddress = useLocationStore((s) => s.currentAddress);
  const userAddress = useLocationStore((s) => s.userAddress);
  const shortAddress = useLocationStore((s) => s.shortAddress);

  const [locality, setLocality] = useState(
    route.params?.initialLocality || shortAddress || 'Monin Pura'
  );
  const [fullAddress, setFullAddress] = useState(
    route.params?.initialAddress ||
      userAddress ||
      'Khairati Bazar, Monin Pura, Burhanpur, Madhya Pradesh 450331, India'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [pinOffset, setPinOffset] = useState({ x: 0, y: 0 });

  // PanResponder to allow dragging/moving on map canvas
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      setPinOffset({
        x: Math.min(60, Math.max(-60, gestureState.dx * 0.4)),
        y: Math.min(60, Math.max(-60, gestureState.dy * 0.4)),
      });
    },
    onPanResponderRelease: () => {
      // Simulate snapping to current pin coordinate
      setTimeout(() => {
        setPinOffset({ x: 0, y: 0 });
      }, 300);
    },
  });

  const handleCurrentLocation = () => {
    setLocality('Monin Pura');
    setFullAddress('Khairati Bazar, Monin Pura, Burhanpur, Madhya Pradesh 450331, India');
  };

  const handleConfirmAndProceed = () => {
    navigation.navigate('LocationDetails', {
      locality,
      fullAddress,
      latitude: 22.7533,
      longitude: 75.8937,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* 1. Interactive Map Simulation Area */}
      <View style={styles.mapCanvas} {...panResponder.panHandlers}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${screenWidth} 700`}>
          {/* Map Base Surface */}
          <Rect width={screenWidth} height="700" fill="#F4F4F6" />

          {/* Road Network Grids & Polygons */}
          <Path
            d="M -20,180 Q 150,160 220,300 T 420,440"
            stroke="#FFFFFF"
            strokeWidth="38"
            fill="none"
          />
          <Path
            d="M 60,-20 L 160,260 L 320,520 L 420,720"
            stroke="#FFFFFF"
            strokeWidth="28"
            fill="none"
          />
          <Path
            d="M -20,420 Q 180,380 340,320 L 440,300"
            stroke="#FFFFFF"
            strokeWidth="24"
            fill="none"
          />
          <Path
            d="M 120,600 L 260,200"
            stroke="#E7E9ED"
            strokeWidth="12"
            fill="none"
          />

          {/* Urban Landmark Blocks */}
          <Rect x="40" y="210" width="100" height="75" fill="#EAECEF" rx="4" />
          <Rect x="230" y="140" width="110" height="90" fill="#E8EBEE" rx="4" />
          <Rect x="180" y="440" width="130" height="95" fill="#EAECEF" rx="4" />

          {/* Landmark Text Labels */}
          <SvgText x="140" y="240" fill="#757B88" fontSize="11" fontFamily="Poppins_600SemiBold">
            AL HAMD Clinic
          </SvgText>
          <SvgText x="230" y="340" fill="#757B88" fontSize="11" fontFamily="Poppins_600SemiBold">
            Khatri Samaj Gurudwara
          </SvgText>
          <SvgText x="40" y="400" fill="#757B88" fontSize="11" fontFamily="Poppins_600SemiBold">
            Akbari Saray
          </SvgText>
          <SvgText x="20" y="580" fill="#757B88" fontSize="10" fontFamily="Poppins_500Medium">
            Unique Public High School
          </SvgText>
          <SvgText x="20" y="596" fill="#888E99" fontSize="9" fontFamily="Poppins_400Regular">
            Burhanpur
          </SvgText>

          {/* Google / Map Watermark */}
          <SvgText x="30" y="650" fill="#A8ADB6" fontSize="14" fontFamily="Poppins_700Bold">
            Google
          </SvgText>
        </Svg>

        {/* Center Blue Location Pin with Pulsing Glow Indicator */}
        <View
          style={[
            styles.pinWrapper,
            {
              transform: [
                { translateX: pinOffset.x },
                { translateY: pinOffset.y },
              ],
            },
          ]}
          pointerEvents="none"
        >
          {/* Outer Pulsing Aura Circle */}
          <View style={styles.pulseCircle} />
          {/* Instamart Blue Location Pin Head */}
          <View style={styles.pinHead}>
            <View style={styles.pinInnerDot} />
          </View>
          <View style={styles.pinStem} />
          <View style={styles.pinShadow} />
        </View>

        {/* Floating "Current location" Target Pill Button */}
        <TouchableOpacity
          style={styles.floatingCurrentLocBtn}
          onPress={handleCurrentLocation}
          activeOpacity={0.85}
        >
          <Ionicons name="locate" size={18} color="#0055FF" style={{ marginRight: 6 }} />
          <Text style={styles.currentLocText}>Current location</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Top Header with Back Button & Search Field */}
      <View style={[styles.topHeader, { top: statusBarHeight + 6 }]}>
        <TouchableOpacity
          style={styles.backCircleBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={InstamartColors.ink} />
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search an area or address"
            placeholderTextColor="#777777"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={20} color="#555555" />
        </View>
      </View>

      {/* 3. Bottom Pinned Confirmation Sheet */}
      <View style={styles.bottomSheet}>
        {/* Locality Header with Blue Location Pin */}
        <View style={styles.addressHeaderRow}>
          <View style={styles.pinIconBox}>
            <Ionicons name="location-sharp" size={24} color="#0055FF" />
          </View>
          <View style={styles.addressTextCol}>
            <Text style={styles.localityTitle}>{locality}</Text>
            <Text style={styles.fullAddressText} numberOfLines={2}>
              {fullAddress}
            </Text>
          </View>
        </View>

        {/* Big Blue "Confirm & proceed" CTA Button */}
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirmAndProceed}
          activeOpacity={0.88}
        >
          <Text style={styles.confirmBtnText}>Confirm &amp; proceed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F6',
  },
  mapCanvas: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  pulseCircle: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 85, 255, 0.16)',
  },
  pinHead: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0055FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  pinInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  pinStem: {
    width: 4,
    height: 10,
    backgroundColor: '#0055FF',
    marginTop: -2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  pinShadow: {
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: 2,
  },
  floatingCurrentLocBtn: {
    position: 'absolute',
    bottom: 195,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  currentLocText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12.5,
    color: '#333333',
  },
  topHeader: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  backCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBar: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: InstamartColors.ink,
    paddingVertical: 0,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 32 : 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  addressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pinIconBox: {
    marginTop: 1,
    marginRight: 10,
  },
  addressTextCol: {
    flex: 1,
  },
  localityTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  fullAddressText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
    lineHeight: 17,
  },
  confirmBtn: {
    height: 50,
    backgroundColor: '#0055FF', // Instamart vibrant blue
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});


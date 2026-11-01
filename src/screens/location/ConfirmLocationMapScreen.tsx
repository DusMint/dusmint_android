import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import Svg, { Rect, Path, Circle, Text as SvgText, G } from 'react-native-svg';
import { InstamartColors } from '../../ui/theme/instamartTheme';
import { useLocationStore } from '../../state/useLocationStore';
import {
  searchPlacesAutocomplete,
  reverseGeocodeCoordinates,
} from '../../services/locationService';

type Props = NativeStackScreenProps<RootStackParamList, any>;

interface MapLandmark {
  x: number;
  y: number;
  locality: string;
  address: string;
  latitude: number;
  longitude: number;
}

// Map landmarks with relative canvas offsets
const LANDMARKS: MapLandmark[] = [
  {
    x: 0,
    y: 0,
    locality: 'Mominpura',
    address: 'Khairati Bazar, Monin Pura, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.3125,
    longitude: 76.2238,
  },
  {
    x: 180,
    y: -180,
    locality: 'Shahi Qila',
    address: 'Tapti River Bank, Shahi Qila Road, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.3168,
    longitude: 76.2285,
  },
  {
    x: -180,
    y: -190,
    locality: 'Akbari Saray',
    address: 'Historical Quarter, Akbari Saray, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.3155,
    longitude: 76.2192,
  },
  {
    x: 220,
    y: 0,
    locality: 'Khatri Samaj Gurudwara',
    address: 'Main Market, Khatri Samaj Road, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.313,
    longitude: 76.229,
  },
  {
    x: -180,
    y: 180,
    locality: 'AL HAMD Clinic',
    address: 'Station Road, Near AL HAMD Clinic, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.309,
    longitude: 76.2195,
  },
  {
    x: 0,
    y: 220,
    locality: 'Unique Public High School',
    address: 'School Campus, Monin Pura South, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.3075,
    longitude: 76.2235,
  },
  {
    x: 190,
    y: 170,
    locality: 'Rastipura Market',
    address: 'Cloth Market, Rastipura, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.3095,
    longitude: 76.227,
  },
  {
    x: 0,
    y: -340,
    locality: 'Shanwara Gate',
    address: 'Shanwara Circle, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.321,
    longitude: 76.224,
  },
  {
    x: 0,
    y: 380,
    locality: 'Burhanpur Railway Station',
    address: 'Station Road, Lalbagh, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.298,
    longitude: 76.225,
  },
  {
    x: -280,
    y: 0,
    locality: 'Dawoodi Bohra Colony',
    address: 'Hakimi Mohalla, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.312,
    longitude: 76.216,
  },
  {
    x: 0,
    y: -120,
    locality: 'Subhash Chowk',
    address: 'City Center, Subhash Chowk, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.315,
    longitude: 76.2238,
  },
];

// Rich searchable places database
const SEARCHABLE_PLACES = [
  ...LANDMARKS.map((l, i) => ({
    id: `burh-${i}`,
    mainText: l.locality,
    secondaryText: l.address,
    latitude: l.latitude,
    longitude: l.longitude,
    canvasX: l.x,
    canvasY: l.y,
  })),
  {
    id: 'ind-1',
    mainText: 'Vijay Nagar',
    secondaryText: 'Scheme 54, Indore, Madhya Pradesh 452010',
    latitude: 22.7533,
    longitude: 75.8937,
    canvasX: 0,
    canvasY: 0,
  },
  {
    id: 'ind-2',
    mainText: 'Mahalaxmi Nagar',
    secondaryText: '1 Floor, 754, Indore, Madhya Pradesh 452010',
    latitude: 22.7631,
    longitude: 75.9022,
    canvasX: 100,
    canvasY: -80,
  },
  {
    id: 'ind-3',
    mainText: 'Palasia (Old & New)',
    secondaryText: 'Indore, Madhya Pradesh 452001',
    latitude: 22.7244,
    longitude: 75.8839,
    canvasX: -80,
    canvasY: 100,
  },
  {
    id: 'ind-4',
    mainText: 'Rajwada Palace Area',
    secondaryText: 'MG Road, Indore, Madhya Pradesh 452002',
    latitude: 22.7186,
    longitude: 75.8553,
    canvasX: 0,
    canvasY: 160,
  },
];

export const ConfirmLocationMapScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;
  const screenDimensions = Dimensions.get('window');
  const screenWidth = screenDimensions.width;
  const screenHeight = screenDimensions.height;

  const searchInputRef = useRef<TextInput>(null);

  const userLatitude = useLocationStore((s) => s.userLatitude);
  const userLongitude = useLocationStore((s) => s.userLongitude);
  const userAddress = useLocationStore((s) => s.userAddress);
  const shortAddress = useLocationStore((s) => s.shortAddress);
  const fetchUserLocation = useLocationStore((s) => s.fetchUserLocation);

  const [locality, setLocality] = useState(
    route.params?.initialLocality || shortAddress || 'Monin Pura'
  );
  const [fullAddress, setFullAddress] = useState(
    route.params?.initialAddress ||
      userAddress ||
      'Khairati Bazar, Monin Pura, Burhanpur, Madhya Pradesh 450331, India'
  );
  const [coords, setCoords] = useState({
    latitude: userLatitude || 21.3125,
    longitude: userLongitude || 76.2238,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof SEARCHABLE_PLACES>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Map 2D Pan Position
  const mapPan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const currentOffset = useRef({ x: 0, y: 0 });

  // Pin Lift & Drop physics
  const pinLift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listenerId = mapPan.addListener((val) => {
      currentOffset.current = val;
    });
    return () => mapPan.removeListener(listenerId);
  }, [mapPan]);

  // Handle Search Input Changes
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const filtered = SEARCHABLE_PLACES.filter(
      (p) =>
        p.mainText.toLowerCase().includes(q) ||
        p.secondaryText.toLowerCase().includes(q)
    );
    setSearchResults(filtered);
    setShowSearchResults(true);
  }, [searchQuery]);

  // Calculate matching landmark from Pan Offset
  const updateLocationFromOffset = (panX: number, panY: number) => {
    // When the map moves by (panX, panY), the world coordinate under the pin is (-panX, -panY)
    const worldX = -panX;
    const worldY = -panY;

    let closest = LANDMARKS[0];
    let minDistance = Number.MAX_VALUE;

    for (const lm of LANDMARKS) {
      const dist = Math.hypot(lm.x - worldX, lm.y - worldY);
      if (dist < minDistance) {
        minDistance = dist;
        closest = lm;
      }
    }

    if (closest) {
      setLocality(closest.locality);
      setFullAddress(closest.address);
      setCoords({ latitude: closest.latitude, longitude: closest.longitude });
    }
  };

  // PanResponder to pan the map freely
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4;
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderGrant: () => {
        Keyboard.dismiss();
        setShowSearchResults(false);

        mapPan.setOffset({
          x: currentOffset.current.x,
          y: currentOffset.current.y,
        });
        mapPan.setValue({ x: 0, y: 0 });

        // Lift pin up
        Animated.spring(pinLift, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: Animated.event([null, { dx: mapPan.x, dy: mapPan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        mapPan.flattenOffset();

        // Drop pin with authentic spring bounce
        Animated.spring(pinLift, {
          toValue: 0,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }).start();

        updateLocationFromOffset(currentOffset.current.x, currentOffset.current.y);
      },
    })
  ).current;

  // Center on Selected Place from Search
  const handleSelectPlace = (place: (typeof SEARCHABLE_PLACES)[0]) => {
    Keyboard.dismiss();
    setShowSearchResults(false);
    setSearchQuery('');

    setLocality(place.mainText);
    setFullAddress(place.secondaryText);
    setCoords({ latitude: place.latitude, longitude: place.longitude });

    // Smoothly animate map to center on selected place
    const targetX = -place.canvasX;
    const targetY = -place.canvasY;

    // Lift pin
    Animated.spring(pinLift, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();

    Animated.spring(mapPan, {
      toValue: { x: targetX, y: targetY },
      friction: 7,
      tension: 60,
      useNativeDriver: false,
    }).start(() => {
      // Drop pin
      Animated.spring(pinLift, {
        toValue: 0,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }).start();
    });
  };

  // Re-center on Current GPS Location
  const handleCurrentLocation = async () => {
    Keyboard.dismiss();
    setShowSearchResults(false);

    // Animate map back to origin
    Animated.spring(pinLift, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    Animated.spring(mapPan, {
      toValue: { x: 0, y: 0 },
      friction: 7,
      tension: 60,
      useNativeDriver: false,
    }).start(() => {
      Animated.spring(pinLift, { toValue: 0, friction: 5, useNativeDriver: true }).start();
    });

    try {
      const res = await fetchUserLocation();
      if (res) {
        setLocality(res.shortAddress || res.locality || 'Current Location');
        setFullAddress(res.fullAddress);
        setCoords({ latitude: res.latitude, longitude: res.longitude });
      } else {
        setLocality('Monin Pura');
        setFullAddress('Khairati Bazar, Monin Pura, Burhanpur, Madhya Pradesh 450331, India');
        setCoords({ latitude: 21.3125, longitude: 76.2238 });
      }
    } catch {
      setLocality('Monin Pura');
      setFullAddress('Khairati Bazar, Monin Pura, Burhanpur, Madhya Pradesh 450331, India');
      setCoords({ latitude: 21.3125, longitude: 76.2238 });
    }
  };

  const handleConfirmAndProceed = () => {
    console.log('[ConfirmLocationMap] Proceeding to LocationDetails with:', {
      locality,
      fullAddress,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
    navigation.navigate('LocationDetails', {
      locality: locality || 'Monin Pura',
      fullAddress: fullAddress || 'Khairati Bazar, Monin Pura, Burhanpur',
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  };

  // Pin lift transforms
  const pinTranslateY = pinLift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });
  const pinScale = pinLift.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });
  const shadowScale = pinLift.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.55],
  });
  const shadowOpacity = pinLift.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.15],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* 1. Large Interactive Pannable Map Canvas */}
      <View style={styles.mapCanvas} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.animatedMapLayer,
            {
              transform: [{ translateX: mapPan.x }, { translateY: mapPan.y }],
            },
          ]}
        >
          <Svg width="1500" height="1500" viewBox="0 0 1500 1500">
            {/* Map Base Canvas */}
            <Rect width="1500" height="1500" fill="#F4F4F6" />

            {/* River Tapti Water Body (Flowing curve in North-East) */}
            <Path
              d="M 600,0 C 720,250 820,380 1100,520 T 1500,700"
              stroke="#D6E8FC"
              strokeWidth="56"
              fill="none"
            />
            <Path
              d="M 600,0 C 720,250 820,380 1100,520 T 1500,700"
              stroke="#E2EFFE"
              strokeWidth="40"
              fill="none"
            />

            {/* Primary Highway / Ring Road */}
            <Path
              d="M 0,750 Q 400,720 750,750 T 1500,750"
              stroke="#FFFFFF"
              strokeWidth="48"
              fill="none"
            />
            <Path
              d="M 750,0 Q 720,400 750,750 T 750,1500"
              stroke="#FFFFFF"
              strokeWidth="48"
              fill="none"
            />

            {/* Secondary Avenue Streets */}
            <Path
              d="M 200,200 L 1300,1300"
              stroke="#FFFFFF"
              strokeWidth="32"
              fill="none"
            />
            <Path
              d="M 1300,200 L 200,1300"
              stroke="#FFFFFF"
              strokeWidth="32"
              fill="none"
            />
            <Path
              d="M 100,500 L 1400,500"
              stroke="#FFFFFF"
              strokeWidth="28"
              fill="none"
            />
            <Path
              d="M 100,1000 L 1400,1000"
              stroke="#FFFFFF"
              strokeWidth="28"
              fill="none"
            />
            <Path
              d="M 500,100 L 500,1400"
              stroke="#FFFFFF"
              strokeWidth="28"
              fill="none"
            />
            <Path
              d="M 1000,100 L 1000,1400"
              stroke="#FFFFFF"
              strokeWidth="28"
              fill="none"
            />

            {/* Connecting Inner Alleys */}
            <Path d="M 600,600 L 900,900" stroke="#E6E8EC" strokeWidth="16" fill="none" />
            <Path d="M 900,600 L 600,900" stroke="#E6E8EC" strokeWidth="16" fill="none" />
            <Path d="M 680,520 L 820,520" stroke="#E6E8EC" strokeWidth="14" fill="none" />
            <Path d="M 680,980 L 820,980" stroke="#E6E8EC" strokeWidth="14" fill="none" />

            {/* Urban Landmark Blocks */}
            <Rect x="540" y="560" width="110" height="85" fill="#EAECEF" rx="8" />
            <Rect x="900" y="550" width="125" height="95" fill="#E8EBEE" rx="8" />
            <Rect x="550" y="910" width="120" height="90" fill="#EAECEF" rx="8" />
            <Rect x="910" y="910" width="115" height="85" fill="#EAECEF" rx="8" />
            <Rect x="700" y="380" width="110" height="75" fill="#E8EBEE" rx="8" />
            <Rect x="700" y="1080" width="120" height="80" fill="#E8EBEE" rx="8" />

            {/* Public Gardens / Green Belts */}
            <Rect x="350" y="350" width="90" height="80" fill="#E5F3E8" rx="6" />
            <Rect x="1050" y="1050" width="90" height="80" fill="#E5F3E8" rx="6" />

            {/* Landmark Labels (Placed relative to (750, 750) Center) */}
            {LANDMARKS.map((lm, idx) => (
              <G key={idx}>
                <Circle cx={750 + lm.x} cy={750 + lm.y} r="4" fill="#0055FF" opacity="0.6" />
                <SvgText
                  x={750 + lm.x}
                  y={750 + lm.y - 12}
                  fill="#4A5260"
                  fontSize="12"
                  fontFamily="Poppins_600SemiBold"
                  textAnchor="middle"
                >
                  {lm.locality}
                </SvgText>
              </G>
            ))}

            {/* Google Watermark */}
            <SvgText
              x="50"
              y="1450"
              fill="#A8ADB6"
              fontSize="16"
              fontFamily="Poppins_700Bold"
            >
              Google
            </SvgText>
          </Svg>
        </Animated.View>

        {/* Center Pinned Picker Indicator (Fixed at Screen Center with Physics) */}
        <View style={styles.centerPinContainer} pointerEvents="none">
          {/* Animated Pin Shadow on Ground */}
          <Animated.View
            style={[
              styles.pinGroundShadow,
              {
                transform: [{ scale: shadowScale }],
                opacity: shadowOpacity,
              },
            ]}
          />

          {/* Animated Blue Pin Body */}
          <Animated.View
            style={[
              styles.pinLiftBody,
              {
                transform: [{ translateY: pinTranslateY }, { scale: pinScale }],
              },
            ]}
          >
            {/* Pulsing Aura Circle */}
            <View style={styles.pulseCircle} />

            {/* Instamart Blue Location Pin Head */}
            <View style={styles.pinHead}>
              <View style={styles.pinInnerDot} />
            </View>

            {/* Pin Needle Stem */}
            <View style={styles.pinStem} />
          </Animated.View>
        </View>
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
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search an area or address"
            placeholderTextColor="#777777"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => {
              if (searchQuery.trim().length > 0) setShowSearchResults(true);
            }}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color="#888888" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="search" size={20} color="#555555" />
          )}
        </View>
      </View>

      {/* Instant Search Suggestions Dropdown Overlay */}
      {showSearchResults && searchResults.length > 0 && (
        <View style={[styles.searchDropdownCard, { top: statusBarHeight + 62 }]}>
          <ScrollView
            style={{ maxHeight: 240 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {searchResults.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.searchResultRow,
                  idx !== searchResults.length - 1 && styles.rowDivider,
                ]}
                onPress={() => handleSelectPlace(item)}
                activeOpacity={0.75}
              >
                <View style={styles.searchIconBox}>
                  <Ionicons name="location-outline" size={18} color="#0055FF" />
                </View>
                <View style={styles.searchCol}>
                  <Text style={styles.searchMainText}>{item.mainText}</Text>
                  <Text style={styles.searchSubText} numberOfLines={1}>
                    {item.secondaryText}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 3. Bottom Pinned Confirmation Sheet */}
      <View style={styles.bottomSheet}>
        {/* Locality Header with Blue Location Pin & Change Option */}
        <View style={styles.addressHeaderRow}>
          <View style={styles.pinIconBox}>
            <Ionicons name="location-sharp" size={24} color="#0055FF" />
          </View>
          <View style={styles.addressTextCol}>
            <View style={styles.localityRow}>
              <Text style={styles.localityTitle}>{locality}</Text>
              <TouchableOpacity
                style={styles.changeBadge}
                onPress={() => searchInputRef.current?.focus()}
                activeOpacity={0.7}
              >
                <Text style={styles.changeBadgeText}>Change</Text>
              </TouchableOpacity>
            </View>
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
          <Text style={styles.confirmBtnText}>Confirm & proceed</Text>
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
    overflow: 'hidden',
  },
  animatedMapLayer: {
    position: 'absolute',
    width: 1500,
    height: 1500,
    left: '50%',
    top: '50%',
    marginLeft: -750,
    marginTop: -750,
  },
  centerPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -25,
    marginTop: -55,
    width: 50,
    height: 60,
  },
  pinLiftBody: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 85, 255, 0.15)',
  },
  pinHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0055FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 6,
  },
  pinInnerDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#FFFFFF',
  },
  pinStem: {
    width: 4,
    height: 12,
    backgroundColor: '#0055FF',
    marginTop: -2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  pinGroundShadow: {
    position: 'absolute',
    bottom: 2,
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E293B',
  },
  floatingCurrentLocBtn: {
    position: 'absolute',
    bottom: 195,
    alignSelf: 'center',
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
    elevation: 6,
    zIndex: 50,
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
    zIndex: 100,
    elevation: 6,
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
  searchDropdownCard: {
    position: 'absolute',
    left: 14,
    right: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 16,
    zIndex: 150,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  searchIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCol: {
    flex: 1,
  },
  searchMainText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: InstamartColors.ink,
  },
  searchSubText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#777777',
    marginTop: 1,
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
    elevation: 12,
    zIndex: 100,
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
  localityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  localityTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    fontWeight: '700',
    color: InstamartColors.ink,
  },
  changeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#EEF4FF',
  },
  changeBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
    color: '#0055FF',
    fontWeight: '600',
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
    backgroundColor: '#0055FF',
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

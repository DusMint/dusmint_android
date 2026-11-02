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
  Animated,
  Keyboard,
  ScrollView,
  Image,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { InstamartColors } from '../../ui/theme/instamartTheme';
import { useLocationStore } from '../../state/useLocationStore';
import {
  searchPlacesAutocomplete,
  reverseGeocodeCoordinates,
} from '../../services/locationService';

type Props = NativeStackScreenProps<RootStackParamList, any>;

interface SearchPlaceItem {
  id: string;
  mainText: string;
  secondaryText: string;
  latitude: number;
  longitude: number;
}

const PRESET_PLACES: SearchPlaceItem[] = [
  {
    id: 'b-1',
    mainText: 'Mominpura',
    secondaryText: 'Khairati Bazar, Monin Pura, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.3125,
    longitude: 76.2238,
  },
  {
    id: 'b-2',
    mainText: 'Shahi Qila',
    secondaryText: 'Tapti River Bank, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.3168,
    longitude: 76.2285,
  },
  {
    id: 'b-3',
    mainText: 'Akbari Saray',
    secondaryText: 'Historical Quarter, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.3155,
    longitude: 76.2192,
  },
  {
    id: 'b-4',
    mainText: 'Khatri Samaj Gurudwara',
    secondaryText: 'Main Market, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.313,
    longitude: 76.229,
  },
  {
    id: 'b-5',
    mainText: 'Shanwara Gate',
    secondaryText: 'Shanwara Circle, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.321,
    longitude: 76.224,
  },
  {
    id: 'b-6',
    mainText: 'Burhanpur Railway Station',
    secondaryText: 'Station Road, Lalbagh, Burhanpur, Madhya Pradesh 450331',
    latitude: 21.298,
    longitude: 76.225,
  },
  {
    id: 'ind-1',
    mainText: 'Vijay Nagar',
    secondaryText: 'Scheme 54, Indore, Madhya Pradesh 452010',
    latitude: 22.7533,
    longitude: 75.8937,
  },
  {
    id: 'ind-2',
    mainText: 'Mahalaxmi Nagar',
    secondaryText: '1 Floor, 754, Indore, Madhya Pradesh 452010',
    latitude: 22.7631,
    longitude: 75.9022,
  },
];

// Map Zoom Level & Tile Dimensions
const ZOOM = 16;
const TILE_SIZE = 256;
const WORLD_SIZE = TILE_SIZE * Math.pow(2, ZOOM);

// Spherical Mercator Math (Lat/Lng <-> World Pixels)
function latLngToWorldPixel(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * WORLD_SIZE;
  const latRad = (lat * Math.PI) / 180;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * WORLD_SIZE;
  return { x, y };
}

function worldPixelToLatLng(x: number, y: number) {
  const lng = (x / WORLD_SIZE) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / WORLD_SIZE;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lng };
}

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

  const initialLat = userLatitude || 21.3125;
  const initialLng = userLongitude || 76.2238;

  // Active Map Center State
  const [centerCoord, setCenterCoord] = useState({
    latitude: initialLat,
    longitude: initialLng,
  });

  const [locality, setLocality] = useState(
    route.params?.initialLocality || shortAddress || 'Monin Pura'
  );
  const [fullAddress, setFullAddress] = useState(
    route.params?.initialAddress ||
      userAddress ||
      'Khairati Bazar, Monin Pura, Burhanpur, Madhya Pradesh 450331, India'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchPlaceItem[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Animated Pan Values
  const mapPan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const currentOffset = useRef({ x: 0, y: 0 });
  const pinLift = useRef(new Animated.Value(0)).current;
  const geocodeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const listenerId = mapPan.addListener((val) => {
      currentOffset.current = val;
    });
    return () => mapPan.removeListener(listenerId);
  }, [mapPan]);

  // Center Tile Coordinates
  const centerPixel = latLngToWorldPixel(centerCoord.latitude, centerCoord.longitude);
  const centerTileX = Math.floor(centerPixel.x / TILE_SIZE);
  const centerTileY = Math.floor(centerPixel.y / TILE_SIZE);

  // Pixel offset of center coordinate within the center tile
  const subPixelX = centerPixel.x - centerTileX * TILE_SIZE;
  const subPixelY = centerPixel.y - centerTileY * TILE_SIZE;

  // 5x5 grid of surrounding tiles
  const tileOffsets = [-2, -1, 0, 1, 2];
  const tiles: { col: number; row: number; tileX: number; tileY: number }[] = [];
  for (const row of tileOffsets) {
    for (const col of tileOffsets) {
      tiles.push({
        col,
        row,
        tileX: centerTileX + col,
        tileY: centerTileY + row,
      });
    }
  }

  // PanResponder to pan the real Google map
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        return Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4;
      },
      onMoveShouldSetPanResponderCapture: (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
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
          tension: 120,
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
          tension: 140,
          useNativeDriver: true,
        }).start();

        // Calculate new Lat/Lng from pan offset
        const finalWorldX = centerPixel.x - currentOffset.current.x;
        const finalWorldY = centerPixel.y - currentOffset.current.y;
        const newCoords = worldPixelToLatLng(finalWorldX, finalWorldY);

        // Debounce reverse geocoding with Ola Maps
        if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
        geocodeTimeout.current = setTimeout(async () => {
          setIsGeocoding(true);
          try {
            const resolved = await reverseGeocodeCoordinates(newCoords.lat, newCoords.lng);
            if (resolved && resolved.fullAddress) {
              setLocality(resolved.shortAddress || resolved.locality || 'Selected Location');
              setFullAddress(resolved.fullAddress);
            }
          } catch (e) {
            console.warn('[ConfirmLocationMap] Reverse geocode error:', e);
          } finally {
            setIsGeocoding(false);
          }
        }, 350);
      },
    })
  ).current;

  // Search input handler
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const localMatches = PRESET_PLACES.filter(
      (p) =>
        p.mainText.toLowerCase().includes(q) ||
        p.secondaryText.toLowerCase().includes(q)
    );
    setSearchResults(localMatches);
    setShowSearchResults(true);

    if (q.length >= 2) {
      searchPlacesAutocomplete(q, centerCoord.latitude, centerCoord.longitude)
        .then((remote) => {
          if (remote && remote.length > 0) {
            const mapped: SearchPlaceItem[] = remote.map((r) => ({
              id: r.id,
              mainText: r.title,
              secondaryText: r.address || r.subtitle,
              latitude: r.lat,
              longitude: r.lng,
            }));
            setSearchResults((prev) => {
              const ids = new Set(prev.map((p) => p.id));
              const combined = [...prev];
              for (const m of mapped) {
                if (!ids.has(m.id)) combined.push(m);
              }
              return combined;
            });
          }
        })
        .catch(() => {});
    }
  }, [searchQuery, centerCoord.latitude, centerCoord.longitude]);

  // Center on Selected Place
  const handleSelectPlace = (place: SearchPlaceItem) => {
    Keyboard.dismiss();
    setShowSearchResults(false);
    setSearchQuery('');

    setLocality(place.mainText);
    setFullAddress(place.secondaryText);

    // Reset pan offset and center map on new location
    mapPan.setValue({ x: 0, y: 0 });
    currentOffset.current = { x: 0, y: 0 };
    setCenterCoord({ latitude: place.latitude, longitude: place.longitude });

    // Joyful pin bounce
    Animated.sequence([
      Animated.spring(pinLift, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.spring(pinLift, { toValue: 0, friction: 5, tension: 130, useNativeDriver: true }),
    ]).start();
  };

  // Re-center on Current Device GPS
  const handleCurrentLocation = async () => {
    Keyboard.dismiss();
    setShowSearchResults(false);

    try {
      const res = await fetchUserLocation();
      if (res) {
        setLocality(res.shortAddress || res.locality || 'Current Location');
        setFullAddress(res.fullAddress);

        mapPan.setValue({ x: 0, y: 0 });
        currentOffset.current = { x: 0, y: 0 };
        setCenterCoord({ latitude: res.latitude, longitude: res.longitude });

        Animated.sequence([
          Animated.spring(pinLift, { toValue: 1, friction: 6, useNativeDriver: true }),
          Animated.spring(pinLift, { toValue: 0, friction: 5, tension: 130, useNativeDriver: true }),
        ]).start();
      }
    } catch {
      // fallback
    }
  };

  const handleConfirmAndProceed = () => {
    const finalWorldX = centerPixel.x - currentOffset.current.x;
    const finalWorldY = centerPixel.y - currentOffset.current.y;
    const finalCoords = worldPixelToLatLng(finalWorldX, finalWorldY);

    console.log('[ConfirmLocationMap] Proceeding to LocationDetails with:', {
      locality,
      fullAddress,
      latitude: finalCoords.lat,
      longitude: finalCoords.lng,
    });

    navigation.navigate('LocationDetails', {
      locality: locality || 'Monin Pura',
      fullAddress: fullAddress || 'Khairati Bazar, Monin Pura, Burhanpur',
      latitude: finalCoords.lat,
      longitude: finalCoords.lng,
    });
  };

  // Pin animation transforms
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

      {/* 1. Official Google Maps High-Definition Interactive Engine */}
      <View style={styles.mapCanvas} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.tileLayerContainer,
            {
              transform: [
                { translateX: mapPan.x },
                { translateY: mapPan.y },
              ],
            },
          ]}
        >
          {tiles.map((t) => {
            const tileLeft = screenWidth / 2 - subPixelX + t.col * TILE_SIZE;
            const tileTop = screenHeight / 2 - subPixelY + t.row * TILE_SIZE;
            const tileUrl = `https://mt1.google.com/vt/lyrs=m&x=${t.tileX}&y=${t.tileY}&z=${ZOOM}`;

            return (
              <Image
                key={`${t.tileX}-${t.tileY}`}
                source={{ uri: tileUrl }}
                style={[
                  styles.tileImage,
                  {
                    left: tileLeft,
                    top: tileTop,
                  },
                ]}
                resizeMode="cover"
              />
            );
          })}
        </Animated.View>

        {/* Center Stationary Blue Pin with Instamart Bounce Physics */}
        <View style={styles.centerPinContainer} pointerEvents="none">
          {/* Ground Shadow */}
          <Animated.View
            style={[
              styles.pinGroundShadow,
              {
                transform: [{ scale: shadowScale }],
                opacity: shadowOpacity,
              },
            ]}
          />

          {/* Lifting Blue Pin */}
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

        {/* Google Maps Watermark */}
        <View style={styles.googleWatermark} pointerEvents="none">
          <Text style={styles.googleWatermarkText}>Google</Text>
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
            {isGeocoding && (
              <Text style={styles.updatingText}>Updating address...</Text>
            )}
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
    backgroundColor: '#E5E3DF', // Google Maps neutral background
  },
  tileLayerContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  tileImage: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: '#E5E3DF',
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
  googleWatermark: {
    position: 'absolute',
    bottom: 195,
    left: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  googleWatermarkText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
    color: '#5F6368',
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
  updatingText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#0055FF',
    marginTop: 2,
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

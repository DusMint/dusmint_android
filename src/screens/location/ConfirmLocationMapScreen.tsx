import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
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

function generateLeafletHtml(lat: number, lng: number) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #E5E3DF; overflow: hidden; }
    .leaflet-control-attribution, .leaflet-control-zoom { display: none !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', {
      center: [${lat}, ${lng}],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    // CartoDB Voyager High-Definition Raster Tiles (Fast, Beautiful, Clean Zomato-style map)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    function notify(type, data) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({ type: type }, data || {})));
      }
    }

    map.on('movestart', function() {
      notify('MOVE_START');
    });

    map.on('moveend', function() {
      var c = map.getCenter();
      notify('MOVE_END', { lat: c.lat, lng: c.lng });
    });

    window.panToLocation = function(targetLat, targetLng) {
      map.setView([targetLat, targetLng], 16, { animate: true, duration: 0.8 });
    };
  </script>
</body>
</html>`;
}

export const ConfirmLocationMapScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : insets.top;

  const searchInputRef = useRef<TextInput>(null);
  const webViewRef = useRef<WebView>(null);

  const userLatitude = useLocationStore((s) => s.userLatitude);
  const userLongitude = useLocationStore((s) => s.userLongitude);
  const userAddress = useLocationStore((s) => s.userAddress);
  const shortAddress = useLocationStore((s) => s.shortAddress);
  const fetchUserLocation = useLocationStore((s) => s.fetchUserLocation);

  const initialLat = userLatitude || 22.7533;
  const initialLng = userLongitude || 75.8937;

  // Active Map Center State
  const [centerCoord, setCenterCoord] = useState({
    latitude: initialLat,
    longitude: initialLng,
  });

  const [locality, setLocality] = useState(
    route.params?.initialLocality || shortAddress || 'Vijay Nagar'
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
  const [isMapReady, setIsMapReady] = useState(false);

  // Animated Pin Physics
  const pinLift = useRef(new Animated.Value(0)).current;
  const geocodeTimeout = useRef<NodeJS.Timeout | null>(null);

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

  const liftPin = useCallback(() => {
    Animated.spring(pinLift, {
      toValue: 1,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [pinLift]);

  const dropPin = useCallback(() => {
    Animated.spring(pinLift, {
      toValue: 0,
      friction: 5,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [pinLift]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MOVE_START') {
        liftPin();
      } else if (data.type === 'MOVE_END' && data.lat && data.lng) {
        dropPin();
        setCenterCoord({ latitude: data.lat, longitude: data.lng });

        // Debounce reverse geocoding
        if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
        geocodeTimeout.current = setTimeout(async () => {
          setIsGeocoding(true);
          try {
            const resolved = await reverseGeocodeCoordinates(data.lat, data.lng);
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
      }
    } catch {
      // ignore parse error
    }
  };

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
    setCenterCoord({ latitude: place.latitude, longitude: place.longitude });

    // Pan Leaflet map
    webViewRef.current?.injectJavaScript(
      `if (window.panToLocation) { window.panToLocation(${place.latitude}, ${place.longitude}); } true;`
    );

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
        setCenterCoord({ latitude: res.latitude, longitude: res.longitude });

        webViewRef.current?.injectJavaScript(
          `if (window.panToLocation) { window.panToLocation(${res.latitude}, ${res.longitude}); } true;`
        );

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
    console.log('[ConfirmLocationMap] Proceeding to LocationDetails with:', {
      locality,
      fullAddress,
      latitude: centerCoord.latitude,
      longitude: centerCoord.longitude,
    });

    navigation.navigate('LocationDetails', {
      locality: locality || 'Vijay Nagar',
      fullAddress: fullAddress || 'Scheme 54, Vijay Nagar, Indore',
      latitude: centerCoord.latitude,
      longitude: centerCoord.longitude,
    });
  };

  const leafletHtml = useRef(generateLeafletHtml(initialLat, initialLng)).current;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 1. High-Definition Interactive Leaflet Vector Map via WebView */}
      <View style={styles.mapCanvas}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: leafletHtml }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={handleWebViewMessage}
          onLoadEnd={() => setIsMapReady(true)}
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />

        {!isMapReady && (
          <View style={styles.mapLoadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#0055FF" />
            <Text style={styles.mapLoadingText}>Loading live map...</Text>
          </View>
        )}

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
                activeOpacity={0.7}
              >
                <View style={styles.searchIconBox}>
                  <Ionicons name="location-outline" size={20} color="#0055FF" />
                </View>
                <View style={styles.searchTextCol}>
                  <Text style={styles.searchMainText} numberOfLines={1}>
                    {item.mainText}
                  </Text>
                  <Text style={styles.searchSubText} numberOfLines={1}>
                    {item.secondaryText}
                  </Text>
                </View>
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
    backgroundColor: '#E5E3DF',
  },
  webView: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E5E3DF',
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(229, 227, 223, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  mapLoadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#555555',
    fontWeight: '600',
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
    zIndex: 20,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#0055FF',
  },
  topHeader: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  backCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111111',
    fontWeight: '500',
    paddingVertical: 0,
    paddingRight: 6,
  },
  searchDropdownCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 101,
    overflow: 'hidden',
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  searchIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 85, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchTextCol: {
    flex: 1,
  },
  searchMainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },
  searchSubText: {
    fontSize: 12,
    color: '#777777',
    marginTop: 2,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'android' ? 24 : 36,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
    zIndex: 60,
  },
  addressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pinIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 85, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  addressTextCol: {
    flex: 1,
  },
  localityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  localityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    flex: 1,
  },
  changeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  changeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0055FF',
  },
  fullAddressText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#666666',
  },
  updatingText: {
    fontSize: 11,
    color: '#0055FF',
    fontStyle: 'italic',
    marginTop: 2,
  },
  confirmBtn: {
    backgroundColor: '#0055FF',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0055FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

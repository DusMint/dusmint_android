import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

interface LiveTrackingMapProps {
  originLat?: number;
  originLng?: number;
  storeName?: string;
  destLat?: number;
  destLng?: number;
  destAddress?: string;
  riderName?: string;
  onProgressUpdate?: (distanceKm: string, etaMins: number) => void;
}

function generateLeafletTrackingHtml(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  storeName: string,
  destAddress: string,
  riderName: string
) {
  // Generate intermediate road waypoints between origin and destination to mimic realistic streets
  const dLat = destLat - originLat;
  const dLng = destLng - originLng;

  // 6 curved street waypoints
  const waypoints = [
    [originLat, originLng],
    [originLat + dLat * 0.22 + 0.0008, originLng + dLng * 0.15 - 0.0006],
    [originLat + dLat * 0.45 - 0.0004, originLng + dLng * 0.38 + 0.0009],
    [originLat + dLat * 0.68 + 0.0007, originLng + dLng * 0.65 - 0.0003],
    [originLat + dLat * 0.85 - 0.0003, originLng + dLng * 0.88 + 0.0005],
    [destLat, destLng],
  ];

  const waypointsJson = JSON.stringify(waypoints);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #EBF0F5; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .leaflet-control-attribution, .leaflet-control-zoom { display: none !important; }

    /* Custom Store Marker */
    .store-marker {
      position: relative;
      width: 36px;
      height: 36px;
    }
    .store-pin {
      width: 36px;
      height: 36px;
      border-radius: 18px;
      background: #0055FF;
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 10px rgba(0,85,255,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      position: relative;
      z-index: 2;
    }
    .pulse-ring {
      position: absolute;
      top: -10px;
      left: -10px;
      width: 56px;
      height: 56px;
      border-radius: 28px;
      background: rgba(0, 85, 255, 0.22);
      animation: pulseAnimation 2s infinite ease-out;
      z-index: 1;
    }
    @keyframes pulseAnimation {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.4); opacity: 0; }
    }

    /* Custom Home Marker */
    .home-marker {
      width: 36px;
      height: 36px;
      border-radius: 18px;
      background: #10B981;
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 10px rgba(16,185,129,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    /* Scooter Rider Marker */
    .scooter-marker {
      width: 42px;
      height: 42px;
      border-radius: 21px;
      background: #FFFFFF;
      border: 2.5px solid #0055FF;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      transition: transform 0.2s linear;
    }

    .marker-label {
      position: absolute;
      top: 40px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(17, 24, 39, 0.88);
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var waypoints = ${waypointsJson};
    var origin = [${originLat}, ${originLng}];
    var destination = [${destLat}, ${destLng}];

    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    });

    // CartoDB Voyager High-Performance Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Initial view fitting both store and home
    map.fitBounds([origin, destination], { padding: [55, 55], maxZoom: 16 });

    // 1. Road Route Polyline (Glow + Main Line)
    var routeHalo = L.polyline(waypoints, {
      color: 'rgba(0, 85, 255, 0.22)',
      weight: 9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    var routeLine = L.polyline(waypoints, {
      color: '#0055FF',
      weight: 5,
      opacity: 0.9,
      dashArray: '8, 4',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // 2. Store Marker
    var storeIcon = L.divIcon({
      className: '',
      html: '<div class="store-marker"><div class="pulse-ring"></div><div class="store-pin">🏬</div><div class="marker-label">Store</div></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    L.marker(origin, { icon: storeIcon }).addTo(map);

    // 3. Home Marker
    var homeIcon = L.divIcon({
      className: '',
      html: '<div class="home-marker">🏠<div class="marker-label">Home</div></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    L.marker(destination, { icon: homeIcon }).addTo(map);

    // 4. Moving Scooter Rider Marker
    var scooterDiv = document.createElement('div');
    scooterDiv.className = 'scooter-marker';
    scooterDiv.innerHTML = '🛵';

    var scooterIcon = L.divIcon({
      className: '',
      html: scooterDiv.outerHTML,
      iconSize: [42, 42],
      iconAnchor: [21, 21]
    });

    var riderMarker = L.marker(waypoints[0], { icon: scooterIcon, zIndexOffset: 1000 }).addTo(map);

    function notify(type, data) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({ type: type }, data || {})));
      }
    }

    // Smooth movement interpolation along the waypoints
    var currentSegmentIndex = 0;
    var progressInSegment = 0.0;
    var speed = 0.006; // Smooth gliding speed

    function calculateDistance(lat1, lon1, lat2, lon2) {
      var R = 6371; // km
      var dLat = (lat2 - lat1) * Math.PI / 180;
      var dLon = (lon2 - lon1) * Math.PI / 180;
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    var lastReportTime = 0;

    function animateRider() {
      if (currentSegmentIndex < waypoints.length - 1) {
        progressInSegment += speed;

        if (progressInSegment >= 1.0) {
          progressInSegment = 0.0;
          currentSegmentIndex++;
        }

        if (currentSegmentIndex < waypoints.length - 1) {
          var p1 = waypoints[currentSegmentIndex];
          var p2 = waypoints[currentSegmentIndex + 1];

          var lat = p1[0] + (p2[0] - p1[0]) * progressInSegment;
          var lng = p1[1] + (p2[1] - p1[1]) * progressInSegment;

          riderMarker.setLatLng([lat, lng]);

          // Report progress every 800ms
          var now = Date.now();
          if (now - lastReportTime > 800) {
            lastReportTime = now;
            var distRem = calculateDistance(lat, lng, destination[0], destination[1]);
            var eta = Math.max(1, Math.round(distRem * 3.5));
            notify('RIDER_PROGRESS', {
              distanceKm: distRem < 1 ? (distRem * 1000).toFixed(0) + ' m' : distRem.toFixed(1) + ' km',
              etaMins: eta
            });
          }
        }
      }

      requestAnimationFrame(animateRider);
    }

    // Start simulation after brief delay
    setTimeout(function() {
      animateRider();
    }, 600);

    window.recenterMap = function() {
      map.fitBounds([origin, destination], { padding: [55, 55], maxZoom: 16 });
    };
  </script>
</body>
</html>`;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  originLat = 22.7485,
  originLng = 75.8855,
  storeName = 'Mandi Superstore, Vijay Nagar',
  destLat = 22.7533,
  destLng = 75.8937,
  destAddress = 'Flat 402, Royal Palms, Vijay Nagar',
  riderName = 'Rahul',
  onProgressUpdate,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [distanceText, setDistanceText] = useState('1.1 km');
  const [etaMins, setEtaMins] = useState(4);

  const htmlContent = generateLeafletTrackingHtml(
    originLat,
    originLng,
    destLat,
    destLng,
    storeName,
    destAddress,
    riderName
  );

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'RIDER_PROGRESS') {
        if (data.distanceKm) setDistanceText(data.distanceKm);
        if (data.etaMins) setEtaMins(data.etaMins);
        onProgressUpdate?.(data.distanceKm, data.etaMins);
      }
    } catch {
      // Ignore parse errors
    }
  };

  const handleRecenter = () => {
    webViewRef.current?.injectJavaScript('window.recenterMap && window.recenterMap(); true;');
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        scrollEnabled={false}
      />

      {/* Floating Status Pill over Map (Instamart / Blinkit signature pill) */}
      <View style={styles.floatingPill}>
        <View style={styles.scooterCircle}>
          <Ionicons name="bicycle" size={16} color="#0055FF" />
        </View>
        <View style={styles.pillTextCol}>
          <Text style={styles.pillTitle} numberOfLines={1}>
            Delivery partner {riderName} is on the way
          </Text>
          <Text style={styles.pillSubtitle}>
            {distanceText} away &bull; Arriving soon
          </Text>
        </View>
        <View style={styles.etaBadge}>
          <Text style={styles.etaBadgeText}>{etaMins} MINS</Text>
        </View>
      </View>

      {/* Recenter FAB Button */}
      <TouchableOpacity
        style={styles.recenterBtn}
        onPress={handleRecenter}
        activeOpacity={0.85}
      >
        <Ionicons name="locate" size={18} color="#0055FF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 290,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#EBF0F5',
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  floatingPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EBF0FF',
  },
  scooterCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pillTextCol: {
    flex: 1,
  },
  pillTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  pillSubtitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  etaBadge: {
    backgroundColor: '#0055FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  etaBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  recenterBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});


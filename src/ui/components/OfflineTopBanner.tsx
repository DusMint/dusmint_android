import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNetworkStore } from '../../state/useNetworkStore';

export const OfflineTopBanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isOffline = useNetworkStore((s) => s.isOffline);
  const wasOffline = useNetworkStore((s) => s.wasOffline);
  const resetWasOffline = useNetworkStore((s) => s.resetWasOffline);

  const translateY = useRef(new Animated.Value(-100)).current;
  const topOffset = Math.max(insets.top, Platform.OS === 'android' ? 24 : 0);

  useEffect(() => {
    if (isOffline) {
      // Slide down
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 12,
      }).start();
    } else if (wasOffline) {
      // Show "Back online" green banner for 2.2s then slide up
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 12,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          resetWasOffline();
        });
      }, 2200);

      return () => clearTimeout(timer);
    } else {
      // Keep hidden
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, wasOffline, resetWasOffline, translateY]);

  // If neither offline nor wasOffline, render null for performance
  if (!isOffline && !wasOffline) {
    return null;
  }

  const isRestored = !isOffline && wasOffline;
  const bgColor = isRestored ? '#16A34A' : '#DC2626';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: topOffset,
          backgroundColor: bgColor,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.contentRow}>
        {isRestored ? (
          // Checkmark Icon
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={10} fill="#FFFFFF" />
            <Path
              d="M8 12.5L10.5 15L16 9.5"
              stroke="#16A34A"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        ) : (
          // WiFi Slash Icon
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              d="M1 1L23 23M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M8.53 16.11a6 6 0 016.95 0M12 20h.01"
              stroke="#FFFFFF"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}

        <Text style={styles.bannerText}>
          {isRestored
            ? 'Back online! Reconnected to DusMint'
            : 'No internet connection • Check network'}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999999,
    elevation: 999999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  contentRow: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

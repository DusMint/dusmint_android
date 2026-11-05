import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useNetworkStore } from '../../state/useNetworkStore';
import { Colors } from '../index';

interface Props {
  onRetry?: () => Promise<void> | void;
  title?: string;
  subtitle?: string;
}

export const OfflineFullScreenView: React.FC<Props> = ({
  onRetry,
  title = "You're Offline",
  subtitle = 'Please check your internet connection to explore fresh mandi items & fast delivery slots.',
}) => {
  const [retrying, setRetrying] = useState(false);
  const checkConnectivity = useNetworkStore((s) => s.checkConnectivity);

  const handleRetryPress = async () => {
    if (retrying) return;
    setRetrying(true);

    try {
      const isOnline = await checkConnectivity();
      if (isOnline && onRetry) {
        await onRetry();
      }
    } finally {
      setTimeout(() => {
        setRetrying(false);
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      {/* Visual Offline Graphic Circle */}
      <View style={styles.iconCircle}>
        <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
          <Path
            d="M1 1L23 23M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M8.53 16.11a6 6 0 016.95 0M12 20h.01"
            stroke="#EF4444"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      {/* Texts */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* Retry CTA Button */}
      <TouchableOpacity
        style={styles.retryButton}
        onPress={handleRetryPress}
        activeOpacity={0.8}
        disabled={retrying}
      >
        {retrying ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.retryText}>RETRY</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F1226',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    width: '100%',
    maxWidth: 240,
    height: 48,
    backgroundColor: '#047A36',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#047A36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});


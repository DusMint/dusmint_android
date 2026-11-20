import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onPress: () => void;
  size?: number;
}

export const VoiceAiButton: React.FC<Props> = ({ onPress, size = 52 }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle breathing glow animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.outerContainer}>
      {/* Outer Pulse Halo */}
      <Animated.View
        style={[
          styles.glowHalo,
          {
            width: size + 14,
            height: size + 14,
            borderRadius: (size + 14) / 2,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Main Floating Sparkle Button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* Quad Star / Sparkle Icon matching Zomato's AI feature */}
        <View style={styles.iconContainer}>
          <Ionicons name="sparkles" size={size * 0.46} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowHalo: {
    position: 'absolute',
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
  },
  button: {
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

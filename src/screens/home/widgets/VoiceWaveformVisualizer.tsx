import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface Props {
  isListening: boolean;
  color?: string;
}

export const VoiceWaveformVisualizer: React.FC<Props> = ({
  isListening,
  color = '#8B5CF6',
}) => {
  const barHeights = [
    useRef(new Animated.Value(8)).current,
    useRef(new Animated.Value(14)).current,
    useRef(new Animated.Value(22)).current,
    useRef(new Animated.Value(12)).current,
    useRef(new Animated.Value(6)).current,
  ];

  useEffect(() => {
    if (!isListening) {
      barHeights.forEach((b) => b.setValue(6));
      return;
    }

    const animations = barHeights.map((anim, index) => {
      const minH = 6;
      const maxH = 26 + (index % 3) * 6;
      const duration = 260 + index * 60;

      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: maxH,
            duration,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: minH,
            duration,
            useNativeDriver: false,
          }),
        ])
      );
    });

    animations.forEach((a) => a.start());

    return () => {
      animations.forEach((a) => a.stop());
    };
  }, [isListening]);

  return (
    <View style={styles.container}>
      {barHeights.map((heightVal, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: heightVal,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 40,
  },
  bar: {
    width: 4.5,
    borderRadius: 3,
  },
});

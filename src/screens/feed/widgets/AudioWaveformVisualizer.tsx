import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface Props {
  isListening: boolean;
  barColor?: string;
}

export const AudioWaveformVisualizer: React.FC<Props> = ({
  isListening,
  barColor = '#8B5CF6',
}) => {
  const barHeights = useRef([
    new Animated.Value(8),
    new Animated.Value(14),
    new Animated.Value(22),
    new Animated.Value(30),
    new Animated.Value(22),
    new Animated.Value(14),
    new Animated.Value(8),
  ]).current;

  useEffect(() => {
    if (!isListening) {
      barHeights.forEach((h, i) => {
        Animated.timing(h, {
          toValue: [6, 10, 14, 18, 14, 10, 6][i],
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
      return;
    }

    const animations = barHeights.map((h, i) => {
      const minH = 6 + (i % 3) * 4;
      const maxH = 26 + (i % 4) * 6;
      return Animated.loop(
        Animated.sequence([
          Animated.timing(h, {
            toValue: maxH,
            duration: 180 + i * 40,
            useNativeDriver: false,
          }),
          Animated.timing(h, {
            toValue: minH,
            duration: 180 + i * 40,
            useNativeDriver: false,
          }),
        ])
      );
    });

    Animated.parallel(animations).start();

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [isListening]);

  return (
    <View style={styles.container}>
      {barHeights.map((h, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              height: h,
              backgroundColor: barColor,
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
    height: 48,
    gap: 5,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
});

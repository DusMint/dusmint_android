import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDropAnimationStore, DropItemData } from '../../state/useDropAnimationStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedDropToken: React.FC<{
  item: DropItemData;
  onFinish: () => void;
}> = ({ item, onFinish }) => {
  const anim = useRef(new Animated.Value(0)).current;

  // Center bottom dock target where CartStickyBar is floating
  const targetX = SCREEN_WIDTH / 2 - 17;
  const targetY = SCREEN_HEIGHT - 105;

  const initialX = Math.max(16, Math.min(SCREEN_WIDTH - 50, (item.startX || SCREEN_WIDTH / 2) - 17));
  const initialY = Math.max(80, Math.min(SCREEN_HEIGHT - 180, (item.startY || SCREEN_HEIGHT / 2) - 17));

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 520,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  }, [anim, onFinish]);

  // X travels smoothly from touch point towards the bottom dock center
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [initialX, targetX],
  });

  // Y hops up slightly first (cute pop), then accelerates downward into the cart
  const translateY = anim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [initialY, initialY - 32, targetY],
  });

  // Scale pops to 1.25, stays visible, then shrinks down into the cart
  const scale = anim.interpolate({
    inputRange: [0, 0.2, 0.7, 1],
    outputRange: [0.35, 1.25, 0.9, 0.25],
  });

  // Smooth fade-in at start, fade-out upon dropping inside
  const opacity = anim.interpolate({
    inputRange: [0, 0.1, 0.85, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View
      style={[
        styles.tokenWrapper,
        {
          transform: [{ translateX }, { translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <View style={styles.tokenCircle}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.tokenImage}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="bag-handle" size={16} color="#047A36" />
        )}
      </View>
    </Animated.View>
  );
};

export const CartDropOverlay: React.FC = () => {
  const drops = useDropAnimationStore((s) => s.drops);
  const removeDrop = useDropAnimationStore((s) => s.removeDrop);

  if (drops.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {drops.map((d) => (
        <AnimatedDropToken
          key={d.id}
          item={d}
          onFinish={() => removeDrop(d.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tokenWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 34,
    height: 34,
    zIndex: 99999,
  },
  tokenCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#047A36',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  tokenImage: {
    width: '100%',
    height: '100%',
  },
});

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Animated,
  useWindowDimensions,
  LayoutChangeEvent,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { LoginBackground } from './widgets/LoginBackground';
import { LoginSheet } from './widgets/LoginSheet';
import { useLoginController } from './controllers/useLoginController';
import { useAuthStore } from '../../state/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const canGoBack = Boolean(route?.params?.canGoBack && navigation.canGoBack());
  const { height: windowHeight } = useWindowDimensions();
  const [containerHeight, setContainerHeight] = useState(windowHeight);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const keyboardOffsetAnim = useRef(new Animated.Value(0)).current;

  const {
    phone,
    error,
    loading,
    isValid,
    handlePhoneChange,
    handleBlur,
    handleContinue,
  } = useLoginController((validPhone) => {
    navigation.navigate('Otp', { phone: validPhone });
  });

  const handleSkip = () => {
    useAuthStore.getState().setGuest(true);
    if (canGoBack) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs', { screen: 'HomeTab' });
    }
  };

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerHeight(e.nativeEvent.layout.height);
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setIsKeyboardVisible(true);
      const kbHeight = e.endCoordinates.height;

      // Check whether Android OS already shrunk the container natively
      const isNativeResized =
        Platform.OS === 'android' && windowHeight - containerHeight > 100;

      // Full keyboard height translation ensuring the CONTINUE button and card sit
      // comfortably above the Samsung autofill bar / keyboard with clear headroom.
      const targetOffset = isNativeResized
        ? 0
        : kbHeight + (Platform.OS === 'android' ? 6 : 0);

      Animated.timing(keyboardOffsetAnim, {
        toValue: targetOffset,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 200,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      setIsKeyboardVisible(false);
      Animated.timing(keyboardOffsetAnim, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e.duration || 200) : 160,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [containerHeight, keyboardOffsetAnim, windowHeight]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container} onLayout={onLayout}>
        <StatusBar style="dark" />

        {/* 1. Full-bleed background image with Instamart-style parallax shift, subtle zoom & focus dimming */}
        <LoginBackground animatedOffset={keyboardOffsetAnim} />

        {/* Top Header Bar: Back Button (if canGoBack) + Skip Button */}
        <View style={[styles.topBar, { paddingTop: insets.top + (Platform.OS === 'android' ? 12 : 8) }]}>
          {canGoBack ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.75}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Skip login and browse"
          >
            <Text style={styles.skipText}>Skip</Text>
            <Ionicons name="chevron-forward" size={14} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* 2. Floating bottom sheet pinned cleanly above keyboard */}
        <View style={styles.sheetWrapper}>
          <Animated.View
            style={[
              styles.animatedSheetContainer,
              {
                transform: [
                  { translateY: Animated.multiply(keyboardOffsetAnim, -1) },
                ],
              },
            ]}
          >
            <LoginSheet
              phone={phone}
              onPhoneChange={handlePhoneChange}
              error={error}
              onBlur={handleBlur}
              loading={loading}
              isValid={isValid}
              onContinue={handleContinue}
              isKeyboardVisible={isKeyboardVisible}
            />
          </Animated.View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6EFDD',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    gap: 3,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  animatedSheetContainer: {
    width: '100%',
  },
});

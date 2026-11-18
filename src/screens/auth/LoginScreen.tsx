import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { LoginBackground } from './widgets/LoginBackground';
import { LoginSheet } from './widgets/LoginSheet';
import { useLoginController } from './controllers/useLoginController';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [containerHeight, setContainerHeight] = useState(windowHeight);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;

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

      // In edge-to-edge Android (like Samsung One UI), container does NOT shrink natively.
      // So we slide the bottom sheet up smoothly above the keyboard.
      const targetOffset = isNativeResized
        ? 0
        : Math.max(0, kbHeight - insets.bottom);

      Animated.timing(translateY, {
        toValue: -targetOffset,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 180,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      setIsKeyboardVisible(false);
      Animated.timing(translateY, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e.duration || 200) : 150,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [containerHeight, insets.bottom, translateY, windowHeight]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container} onLayout={onLayout}>
        <StatusBar style="dark" />

        {/* 1. Full-bleed background image with fresh veggies & Dusmint branding */}
        <LoginBackground />

        {/* 2. Floating bottom sheet pinned cleanly above keyboard */}
        <View style={styles.sheetWrapper}>
          <Animated.View
            style={[
              styles.animatedSheetContainer,
              { transform: [{ translateY }] },
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
  sheetWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  animatedSheetContainer: {
    width: '100%',
  },
});

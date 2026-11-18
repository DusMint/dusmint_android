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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { LoginBackground } from './widgets/LoginBackground';
import { LoginSheet } from './widgets/LoginSheet';
import { useLoginController } from './controllers/useLoginController';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
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
  sheetWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  animatedSheetContainer: {
    width: '100%',
  },
});

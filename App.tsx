import React, { useEffect } from 'react';
import { Text as RNText, TextInput as RNTextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OfflineTopBanner } from './src/ui/components/OfflineTopBanner';
import { initNetworkMonitoring } from './src/state/useNetworkStore';

// Clamp system font scale between 0.9 and 1.15 to prevent text overflow breaks on small screens (360px)
// @ts-ignore
if (RNText.defaultProps == null) {
  // @ts-ignore
  RNText.defaultProps = {};
}
// @ts-ignore
RNText.defaultProps.maxFontSizeMultiplier = 1.15;

// @ts-ignore
if (RNTextInput.defaultProps == null) {
  // @ts-ignore
  RNTextInput.defaultProps = {};
}
// @ts-ignore
RNTextInput.defaultProps.maxFontSizeMultiplier = 1.15;

const queryClient = new QueryClient();

export default function App() {
  // Primary Font: Plus Jakarta Sans (Google Fonts) with full weight coverage
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
    'PlusJakartaSans-ExtraBold': PlusJakartaSans_800ExtraBold,

    // Aliased mapping: Ensures every component inherits Plus Jakarta Sans seamlessly
    'Poppins_400Regular': PlusJakartaSans_400Regular,
    'Poppins_500Medium': PlusJakartaSans_500Medium,
    'Poppins_600SemiBold': PlusJakartaSans_600SemiBold,
    'Poppins_700Bold': PlusJakartaSans_700Bold,
    'Poppins_800ExtraBold': PlusJakartaSans_800ExtraBold,
    'Metropolis-Regular': PlusJakartaSans_400Regular,
    'Metropolis-Medium': PlusJakartaSans_500Medium,
    'Metropolis-SemiBold': PlusJakartaSans_600SemiBold,
    'Metropolis-Bold': PlusJakartaSans_700Bold,
    'Metropolis-ExtraBold': PlusJakartaSans_800ExtraBold,
    'Okra-Regular': PlusJakartaSans_400Regular,
    'Okra-Medium': PlusJakartaSans_500Medium,
    'Okra-SemiBold': PlusJakartaSans_600SemiBold,
    'Okra-Bold': PlusJakartaSans_700Bold,
    'Okra-ExtraBold': PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    const cleanup = initNetworkMonitoring();
    return () => cleanup?.();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
          <OfflineTopBanner />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

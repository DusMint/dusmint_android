import React, { useEffect } from 'react';
import { Text as RNText, TextInput as RNTextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OfflineTopBanner } from './src/ui/components/OfflineTopBanner';
import { CartDropOverlay } from './src/ui/components/CartDropOverlay';
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
RNText.defaultProps.style = { fontFamily: 'PlusJakartaSans-Regular' };

// @ts-ignore
if (RNTextInput.defaultProps == null) {
  // @ts-ignore
  RNTextInput.defaultProps = {};
}
// @ts-ignore
RNTextInput.defaultProps.maxFontSizeMultiplier = 1.15;
// @ts-ignore
RNTextInput.defaultProps.style = { fontFamily: 'PlusJakartaSans-Regular' };

const queryClient = new QueryClient();

export default function App() {
  // Load Plus Jakarta Sans (Swiggy Instamart / Ownly geometric style) across all aliases
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('./assets/font/PlusJakartaSans-Regular.ttf'),
    'Inter-Medium': require('./assets/font/PlusJakartaSans-Medium.ttf'),
    'Inter-SemiBold': require('./assets/font/PlusJakartaSans-SemiBold.ttf'),
    'Inter-Bold': require('./assets/font/PlusJakartaSans-Bold.ttf'),

    'Metropolis-Regular': require('./assets/font/PlusJakartaSans-Regular.ttf'),
    'Metropolis-Medium': require('./assets/font/PlusJakartaSans-Medium.ttf'),
    'Metropolis-SemiBold': require('./assets/font/PlusJakartaSans-SemiBold.ttf'),
    'Metropolis-Bold': require('./assets/font/PlusJakartaSans-SemiBold.ttf'),
    'Metropolis-ExtraBold': require('./assets/font/PlusJakartaSans-Bold.ttf'),

    // Plus Jakarta Sans mappings used across instamartTheme and components
    'PlusJakartaSans_400Regular': require('./assets/font/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans_500Medium': require('./assets/font/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans_600SemiBold': require('./assets/font/PlusJakartaSans-SemiBold.ttf'),
    'PlusJakartaSans_700Bold': require('./assets/font/PlusJakartaSans-Bold.ttf'),
    'PlusJakartaSans_800ExtraBold': require('./assets/font/PlusJakartaSans-Bold.ttf'),
    'PlusJakartaSans-Regular': require('./assets/font/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('./assets/font/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('./assets/font/PlusJakartaSans-SemiBold.ttf'),
    'PlusJakartaSans-Bold': require('./assets/font/PlusJakartaSans-Bold.ttf'),
    'PlusJakartaSans-ExtraBold': require('./assets/font/PlusJakartaSans-Bold.ttf'),

    // Aliased mapping: Ensures every legacy or theme reference inherits clean typography seamlessly
    'Poppins_400Regular': require('./assets/font/PlusJakartaSans-Regular.ttf'),
    'Poppins_500Medium': require('./assets/font/PlusJakartaSans-Medium.ttf'),
    'Poppins_600SemiBold': require('./assets/font/PlusJakartaSans-SemiBold.ttf'),
    'Poppins_700Bold': require('./assets/font/PlusJakartaSans-Bold.ttf'),
    'Poppins_800ExtraBold': require('./assets/font/PlusJakartaSans-Bold.ttf'),
    'Okra-Regular': require('./assets/font/PlusJakartaSans-Regular.ttf'),
    'Okra-Medium': require('./assets/font/PlusJakartaSans-Medium.ttf'),
    'Okra-SemiBold': require('./assets/font/PlusJakartaSans-SemiBold.ttf'),
    'Okra-Bold': require('./assets/font/PlusJakartaSans-Bold.ttf'),
    'Okra-ExtraBold': require('./assets/font/PlusJakartaSans-Bold.ttf'),
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
          <CartDropOverlay />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

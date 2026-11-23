import React, { useEffect } from 'react';
import { Text as RNText, TextInput as RNTextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
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
  // Load embedded clean typography with full weight coverage and seamless alias mappings
  const [fontsLoaded] = useFonts({
    'Metropolis-Regular': require('./assets/font/Metropolis-Regular.otf'),
    'Metropolis-Medium': require('./assets/font/Metropolis-Medium.otf'),
    'Metropolis-SemiBold': require('./assets/font/Metropolis-SemiBold.otf'),
    'Metropolis-Bold': require('./assets/font/Metropolis-Bold.otf'),
    'Metropolis-ExtraBold': require('./assets/font/Metropolis-ExtraBold.otf'),

    // Plus Jakarta Sans mappings used across instamartTheme and components
    'PlusJakartaSans_400Regular': require('./assets/font/Metropolis-Regular.otf'),
    'PlusJakartaSans_500Medium': require('./assets/font/Metropolis-Medium.otf'),
    'PlusJakartaSans_600SemiBold': require('./assets/font/Metropolis-SemiBold.otf'),
    'PlusJakartaSans_700Bold': require('./assets/font/Metropolis-Bold.otf'),
    'PlusJakartaSans_800ExtraBold': require('./assets/font/Metropolis-ExtraBold.otf'),
    'PlusJakartaSans-Regular': require('./assets/font/Metropolis-Regular.otf'),
    'PlusJakartaSans-Medium': require('./assets/font/Metropolis-Medium.otf'),
    'PlusJakartaSans-SemiBold': require('./assets/font/Metropolis-SemiBold.otf'),
    'PlusJakartaSans-Bold': require('./assets/font/Metropolis-Bold.otf'),
    'PlusJakartaSans-ExtraBold': require('./assets/font/Metropolis-ExtraBold.otf'),

    // Aliased mapping: Ensures every legacy or theme reference inherits clean typography seamlessly
    'Poppins_400Regular': require('./assets/font/Metropolis-Regular.otf'),
    'Poppins_500Medium': require('./assets/font/Metropolis-Medium.otf'),
    'Poppins_600SemiBold': require('./assets/font/Metropolis-SemiBold.otf'),
    'Poppins_700Bold': require('./assets/font/Metropolis-Bold.otf'),
    'Poppins_800ExtraBold': require('./assets/font/Metropolis-ExtraBold.otf'),
    'Okra-Regular': require('./assets/font/Metropolis-Regular.otf'),
    'Okra-Medium': require('./assets/font/Metropolis-Medium.otf'),
    'Okra-SemiBold': require('./assets/font/Metropolis-SemiBold.otf'),
    'Okra-Bold': require('./assets/font/Metropolis-Bold.otf'),
    'Okra-ExtraBold': require('./assets/font/Metropolis-ExtraBold.otf'),
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

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { RootNavigator } from './src/navigation/RootNavigator';

const queryClient = new QueryClient();

export default function App() {
  // Load Zomato Official Typography (Metropolis / Okra)
  const [fontsLoaded] = useFonts({
    'Metropolis-Regular': require('./assets/font/Metropolis-Regular.otf'),
    'Metropolis-Medium': require('./assets/font/Metropolis-Medium.otf'),
    'Metropolis-SemiBold': require('./assets/font/Metropolis-SemiBold.otf'),
    'Metropolis-Bold': require('./assets/font/Metropolis-Bold.otf'),
    'Metropolis-ExtraBold': require('./assets/font/Metropolis-ExtraBold.otf'),
    'Okra-Regular': require('./assets/font/Metropolis-Regular.otf'),
    'Okra-Medium': require('./assets/font/Metropolis-Medium.otf'),
    'Okra-SemiBold': require('./assets/font/Metropolis-SemiBold.otf'),
    'Okra-Bold': require('./assets/font/Metropolis-Bold.otf'),
    'Okra-ExtraBold': require('./assets/font/Metropolis-ExtraBold.otf'),

    // Aliased mapping: Instantly switches every screen & component across the entire app
    // to Zomato's crisp, modern Metropolis/Okra typography
    'Poppins_400Regular': require('./assets/font/Metropolis-Regular.otf'),
    'Poppins_500Medium': require('./assets/font/Metropolis-Medium.otf'),
    'Poppins_600SemiBold': require('./assets/font/Metropolis-SemiBold.otf'),
    'Poppins_700Bold': require('./assets/font/Metropolis-Bold.otf'),
    'Poppins_800ExtraBold': require('./assets/font/Metropolis-ExtraBold.otf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

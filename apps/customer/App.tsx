import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initI18n } from '@dusmint/i18n';
import { useAuthStore } from './src/state/useAuthStore';

const queryClient = new QueryClient();

export default function App() {
  const preferredLanguage = useAuthStore((s) => s.preferredLanguage);

  useEffect(() => {
    initI18n(preferredLanguage);
  }, [preferredLanguage]);

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

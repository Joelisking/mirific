import { ClerkLoaded, ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AppProvider } from '@/contexts/AppContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { ReduxProvider, setClerkTokenGetter } from '@/lib/redux';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

function AppContent() {
  const colorScheme = useColorScheme();
  const { getToken } = useAuth();

  // Set up Clerk token getter for API calls
  // We do this synchronously in render to ensure it's available
  // before any child components mount and fire their API queries
  setClerkTokenGetter(async () => {
    try {
      return await getToken();
    } catch (error) {
      console.error('Failed to get Clerk token:', error);
      return null;
    }
  });

  return (
    <ReduxProvider>
      <AppProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="create-goal" />
            <Stack.Screen name="commitment" />
            <Stack.Screen name="checkin" />
            <Stack.Screen name="rewards" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AppProvider>
    </ReduxProvider>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ClerkLoaded>
        <AppContent />
      </ClerkLoaded>
    </ClerkProvider>
  );
}

import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '@/constants/theme';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // If signed in, check if onboarding is complete
  // For now, send all authenticated users to dashboard
  if (isSignedIn) {
    return <Redirect href="/dashboard" />;
  }

  // Not signed in, go to onboarding
  return <Redirect href="/onboarding" />;
}

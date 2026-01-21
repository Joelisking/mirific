import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLazyGetApiClerkProfileQuery } from '@/lib/redux';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [checkProfile, { isLoading: isCheckingProfile }] = useLazyGetApiClerkProfileQuery();
  const { setUserProfile } = useApp();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      checkProfile().unwrap()
        .then((response) => {
          if (response.user) {
            // Hydrate AppContext with the fetched profile
            // Map API User type (optional fields) to AppContext UserProfile type (required fields)
            setUserProfile({
              name: response.user.name || '',
              goals: response.user.goals || [],
              struggles: response.user.struggles || [],
              communicationMode: response.user.communicationMode || 'text',
              reminderTone: response.user.reminderTone || 'gentle',
            });
            router.replace('/home');
          } else {
            // No user in response, treat as new user
            router.replace('/onboarding');
          }
        })
        .catch((error) => {
          // STRICT CHECK: Only redirect to onboarding if status is 404 (Not Found)
          if (error?.status === 404) {
            // User is signed in but has no backend profile -> Send to onboarding
            router.replace('/onboarding');
          } else {
            // For other errors (network etc), we might want to stay on splash or retry
            // For now, let's just log it. If we route to home, it might show empty state.
            console.error('Index profile check failed:', error);
          }
        });
    } else if (isLoaded && !isSignedIn) {
      router.replace('/landing');
    }
  }, [isLoaded, isSignedIn]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

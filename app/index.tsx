import { theme } from '@/constants/theme';
import { useLazyGetApiClerkProfileQuery } from '@/lib/redux';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [checkProfile, { isLoading: isCheckingProfile }] = useLazyGetApiClerkProfileQuery();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      checkProfile().unwrap()
        .then(() => {
          router.replace('/home');
        })
        .catch(() => {
          // User is signed in but has no backend profile -> Send to onboarding
          router.replace('/onboarding');
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

import ClerkAccountStep from '@/components/onboarding/ClerkAccountStep';
import { theme } from '@/constants/theme';
import { useLazyGetApiClerkProfileQuery } from '@/lib/redux';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [checkProfile, { isLoading }] = useLazyGetApiClerkProfileQuery();

  /*
   * Handle successful authentication
   * 1. Check if user profile exists in backend
   * 2. If exists -> Sync to AppContext & Go Home
   * 3. If 404 -> Go to Onboarding
   */
  const handleAuthSuccess = async () => {
    try {
      const profile = await checkProfile().unwrap();
      // If we get here, profile exists. The query hook normally caches this,
      // but we should arguably sync it to AppContext here or in index.tsx.
      // For now, let's rely on index.tsx / AppContext loading logic or just redirect.
      // Ideally, we pass this data to context so it's ready immediately.

      router.replace('/home');
    } catch (error: any) {
      // STRICT CHECK: Only redirect to onboarding if status is 404 (Not Found)
      if (error?.status === 404) {
        console.log('User profile not found (404), redirecting to onboarding');
        router.replace('/onboarding');
      } else {
        // Other errors (network, 500, etc) - Do NOT force onboarding.
        // Alert user to try again.
        console.error('Login profile check failed:', error);
        alert('Failed to load profile. Please check your connection and try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={theme.gradients.warmBeige as [string, string]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={theme.gradients.warmBeige as [string, string]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <ClerkAccountStep
          onAuthSuccess={handleAuthSuccess}
          title="Welcome to Mirific"
          subtitle="Sign in or create an account"
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
});

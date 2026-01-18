import ClerkAccountStep from '@/components/onboarding/ClerkAccountStep';
import { theme } from '@/constants/theme';
import { useLazyGetApiClerkProfileQuery } from '@/lib/redux';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [checkProfile, { isLoading }] = useLazyGetApiClerkProfileQuery();

  const handleAuthSuccess = async () => {
    try {
      // Check if user exists in backend
      await checkProfile().unwrap();
      // If successful (no error), user exists -> go to home
      router.replace('/home');
    } catch (error) {
      // If error (404), user needs to onboard -> go to onboarding
      console.log('User profile not found, redirecting to onboarding');
      router.replace('/onboarding');
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
          title="Welcome back!"
          subtitle="Sign in to continue your journey"
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

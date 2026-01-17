import ClerkAccountStep from '@/components/onboarding/ClerkAccountStep';
import { theme } from '@/constants/theme';
import { useLazyGetApiClerkProfileQuery } from '@/lib/redux';
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ClerkAccountStep 
        onAuthSuccess={handleAuthSuccess} 
        title="Welcome back!"
        subtitle="Sign in to continue your journey"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
});

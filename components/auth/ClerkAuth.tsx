import { theme } from '@/constants/theme';
import { SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWarmUpBrowser } from '@/hooks/use-warm-up-browser';

WebBrowser.maybeCompleteAuthSession();

interface ClerkAuthProps {
  onAuthSuccess: (user: any) => void;
}

export default function ClerkAuth({ onAuthSuccess }: ClerkAuthProps) {
  useWarmUpBrowser();

  const { isLoaded, signOut } = useAuth();
  const { user } = useUser();

  // Handle auth success
  if (user) {
    onAuthSuccess(user);
  }

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SignedOut>
        <View style={styles.authContainer}>
          <Text style={styles.title}>Sign in to continue</Text>
          <Text style={styles.subtitle}>Choose your preferred sign in method</Text>

          <View style={styles.buttonContainer}>
            {/* We'll implement OAuth buttons using Clerk's OAuth flow */}
            <TouchableOpacity style={styles.oauthButton}>
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.buttonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.oauthButton}>
              <Ionicons name="logo-apple" size={20} color={theme.colors.textPrimary} />
              <Text style={styles.buttonText}>Continue with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.oauthButton}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.textPrimary} />
              <Text style={styles.buttonText}>Continue with Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SignedOut>

      <SignedIn>
        <View style={styles.signedInContainer}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.emailText}>{user?.emailAddresses[0]?.emailAddress}</Text>
          <TouchableOpacity style={styles.signOutButton} onPress={() => signOut()}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </SignedIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  authContainer: {
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  signedInContainer: {
    alignItems: 'center',
    gap: 12,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  emailText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  signOutButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.lg,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

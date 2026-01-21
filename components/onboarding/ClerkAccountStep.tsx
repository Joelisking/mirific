import { theme } from '@/constants/theme';
import { useWarmUpBrowser } from '@/hooks/use-warm-up-browser';
import { useOAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

interface ClerkAccountStepProps {
  onAuthSuccess: () => void;
  title?: string;
  subtitle?: string;
}

export default function ClerkAccountStep({
  onAuthSuccess,
  title = "Create your account",
  subtitle = "Choose your preferred sign-in method"
}: ClerkAccountStepProps) {
  useWarmUpBrowser();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const { startOAuthFlow: googleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: appleOAuth } = useOAuth({ strategy: 'oauth_apple' });

  const onGooglePress = useCallback(async () => {
    try {
      setGoogleLoading(true);
      const { createdSessionId, setActive } = await googleOAuth();

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      // If user is already signed in, just proceed
      if (err.errors?.[0]?.code === 'session_exists' ||
        err.message?.includes('already signed in')) {
        onAuthSuccess();
        return;
      }
      Alert.alert('Error', err.message || 'Failed to sign in with Google');
    } finally {
      setGoogleLoading(false);
    }
  }, [googleOAuth, onAuthSuccess]);

  const onApplePress = useCallback(async () => {
    try {
      setAppleLoading(true);
      const { createdSessionId, setActive } = await appleOAuth();

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error('Apple OAuth error:', err);
      // If user is already signed in, just proceed
      if (err.errors?.[0]?.code === 'session_exists' ||
        err.message?.includes('already signed in')) {
        onAuthSuccess();
        return;
      }
      Alert.alert('Error', err.message || 'Failed to sign in with Apple');
    } finally {
      setAppleLoading(false);
    }
  }, [appleOAuth, onAuthSuccess]);

  return (
    <View style={styles.stepContainer}>
      {/* Logo/Brand */}
      <View style={styles.brandContainer}>
        <LinearGradient
          colors={theme.gradients.sage as [string, string]}
          style={styles.logoGradient}
        >
          <Ionicons name="leaf" size={32} color="#fff" />
        </LinearGradient>
        <Text style={styles.brandName}>Mirific</Text>
      </View>

      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepSubtitle}>{subtitle}</Text>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Sign in with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.buttonsContainer}>
        {/* Google Sign In */}
        <TouchableOpacity
          style={styles.oauthButton}
          onPress={onGooglePress}
          disabled={googleLoading || appleLoading}
          activeOpacity={0.8}
        >
          {googleLoading ? (
            <ActivityIndicator color={theme.colors.textPrimary} />
          ) : (
            <>
              <View style={styles.oauthIconContainer}>
                <Ionicons name="logo-google" size={22} color="#DB4437" />
              </View>
              <Text style={styles.oauthButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Apple Sign In */}
        <TouchableOpacity
          style={[styles.oauthButton, styles.oauthButtonApple]}
          onPress={onApplePress}
          disabled={googleLoading || appleLoading}
          activeOpacity={0.8}
        >
          {appleLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <View style={[styles.oauthIconContainer, styles.oauthIconContainerApple]}>
                <Ionicons name="logo-apple" size={22} color="#fff" />
              </View>
              <Text style={[styles.oauthButtonText, styles.oauthButtonTextApple]}>Continue with Apple</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.noteContainer}>
        <Text style={styles.noteText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    paddingTop: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...theme.shadows.medium,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.h1.fontFamily,
    letterSpacing: -0.5,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: theme.typography.h1.fontFamily,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    fontWeight: '500',
  },
  buttonsContainer: {
    gap: 14,
    marginTop: 8,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 16,
    paddingHorizontal: 20,
    ...theme.shadows.small,
  },
  oauthButtonApple: {
    backgroundColor: theme.colors.textPrimary,
  },
  oauthIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oauthIconContainerApple: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  oauthButtonTextApple: {
    color: '#fff',
  },
  noteContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  noteText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

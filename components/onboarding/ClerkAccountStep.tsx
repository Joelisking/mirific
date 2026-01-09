import { theme } from '@/constants/theme';
import { useWarmUpBrowser } from '@/hooks/use-warm-up-browser';
import { useOAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

interface ClerkAccountStepProps {
  onAuthSuccess: () => void;
}

export default function ClerkAccountStep({ onAuthSuccess }: ClerkAccountStepProps) {
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
      Alert.alert('Error', err.message || 'Failed to sign in with Apple');
    } finally {
      setAppleLoading(false);
    }
  }, [appleOAuth, onAuthSuccess]);

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Create your account</Text>
      <Text style={styles.stepSubtitle}>Choose your preferred sign-in method 🚀</Text>

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
          disabled={googleLoading || appleLoading}>
          {googleLoading ? (
            <ActivityIndicator color={theme.colors.textPrimary} />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.oauthButtonText}>Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Apple Sign In */}
        <TouchableOpacity
          style={styles.oauthButton}
          onPress={onApplePress}
          disabled={googleLoading || appleLoading}>
          {appleLoading ? (
            <ActivityIndicator color={theme.colors.textPrimary} />
          ) : (
            <>
              <Ionicons name="logo-apple" size={20} color={theme.colors.textPrimary} />
              <Text style={styles.oauthButtonText}>Apple</Text>
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
  },
  stepTitle: {
    fontSize: 24,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  oauthButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  oauthButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  noteContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  noteText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

import { theme } from '@/constants/theme';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

interface OAuthButtonsProps {
  onGoogleSuccess: (accessToken: string, idToken: string) => void;
  onAppleSuccess: (identityToken: string, user?: any) => void;
}

export default function OAuthButtons({ onGoogleSuccess, onAppleSuccess }: OAuthButtonsProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  // Google OAuth configuration
  // TODO: Replace with your actual Google OAuth client IDs from Google Cloud Console
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken && authentication?.idToken) {
        onGoogleSuccess(authentication.accessToken, authentication.idToken);
      }
      setIsGoogleLoading(false);
    } else if (response?.type === 'error' || response?.type === 'dismiss') {
      setIsGoogleLoading(false);
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await promptAsync();
    } catch (error) {
      console.error('Google sign in error:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsAppleLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        onAppleSuccess(credential.identityToken, {
          email: credential.email,
          fullName: credential.fullName,
        });
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // User canceled
      } else {
        console.error('Apple sign in error:', error);
        Alert.alert('Error', 'Failed to sign in with Apple');
      }
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.buttonsContainer}>
        {/* Google Sign In */}
        <TouchableOpacity
          style={styles.oauthButton}
          onPress={handleGoogleSignIn}
          disabled={isGoogleLoading || !request}>
          {isGoogleLoading ? (
            <ActivityIndicator color={theme.colors.textPrimary} />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.oauthButtonText}>Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Apple Sign In - Only show on iOS */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.oauthButton}
            onPress={handleAppleSignIn}
            disabled={isAppleLoading}>
            {isAppleLoading ? (
              <ActivityIndicator color={theme.colors.textPrimary} />
            ) : (
              <>
                <Ionicons name="logo-apple" size={20} color={theme.colors.textPrimary} />
                <Text style={styles.oauthButtonText}>Apple</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
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
});

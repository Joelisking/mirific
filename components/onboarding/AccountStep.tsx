import { theme } from '@/constants/theme';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import OAuthButtons from '../auth/OAuthButtons';

interface AccountStepProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onGoogleSuccess: (accessToken: string, idToken: string) => void;
  onAppleSuccess: (identityToken: string, user?: any) => void;
}

export default function AccountStep({
  email,
  setEmail,
  password,
  setPassword,
  onGoogleSuccess,
  onAppleSuccess,
}: AccountStepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Create your account</Text>
      <Text style={styles.stepSubtitle}>Let&apos;s get you set up 🚀</Text>

      <OAuthButtons onGoogleSuccess={onGoogleSuccess} onAppleSuccess={onAppleSuccess} />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoFocus
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password (min. 6 characters)"
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
        />
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
  inputContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
});

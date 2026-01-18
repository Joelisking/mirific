import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface NameStepProps {
  name: string;
  setName: (name: string) => void;
}

export default function NameStep({ name, setName }: NameStepProps) {
  return (
    <View style={styles.stepContainer}>
      <LinearGradient
        colors={theme.gradients.sage as [string, string]}
        style={styles.iconContainer}
      >
        <Ionicons name="person-outline" size={32} color="#fff" />
      </LinearGradient>
      <Text style={styles.stepTitle}>What should we call you?</Text>
      <Text style={styles.stepSubtitle}>Let&apos;s keep it casual</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={theme.colors.textTertiary}
          autoFocus
          selectionColor={theme.colors.primary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...theme.shadows.medium,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    fontFamily: theme.typography.h1.fontFamily,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 32,
  },
  inputContainer: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.small,
  },
  input: {
    padding: 20,
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
});

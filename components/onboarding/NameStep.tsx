import { theme } from '@/constants/theme';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface NameStepProps {
  name: string;
  setName: (name: string) => void;
}

export default function NameStep({ name, setName }: NameStepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What should we call you?</Text>
      <Text style={styles.stepSubtitle}>Let&apos;s keep it casual 👋</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={theme.colors.textSecondary}
        autoFocus
      />
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

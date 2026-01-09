import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function WelcomeStep() {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <View style={styles.iconGradient}>
          <Ionicons name="sparkles" size={48} color="#fff" />
        </View>
      </View>

      <Text style={styles.title}>
        Welcome to <Text style={styles.brandName}>Mirific</Text>
      </Text>
      <Text style={styles.subtitle}>
        Your AI-powered productivity coach ✨
      </Text>

      <View style={styles.featureList}>
        <View style={styles.featureCard}>
          <Text style={styles.featureText}>
            💬 Talk through your goals naturally
          </Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureText}>
            🎯 Set deadlines that actually stick
          </Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureText}>
            📈 Stay accountable & adapt when life happens
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  brandName: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: 32,
  },
  featureList: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featureText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
});

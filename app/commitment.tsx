import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { theme } from "@/constants/theme";

export default function CommitmentScreen() {
  const router = useRouter();
  const { currentGoal, confirmCommitment } = useApp();

  const [goalText, setGoalText] = useState(currentGoal?.text || '');
  const [deadline, setDeadline] = useState(currentGoal?.deadline || '');
  const [isEditingText, setIsEditingText] = useState(false);

  const handleConfirm = () => {
    if (!goalText || !deadline) return;

    confirmCommitment({
      id: currentGoal?.id || Date.now().toString(),
      text: goalText,
      deadline,
      status: 'on-track',
      progress: 0,
    });
    router.replace('/dashboard');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Commitment</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.section}>
            <View style={styles.icon}>
              <Ionicons name="flag" size={24} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.label}>Your Goal</Text>
              {isEditingText ? (
                <TextInput
                  style={styles.textArea}
                  value={goalText}
                  onChangeText={setGoalText}
                  onBlur={() => setIsEditingText(false)}
                  multiline
                  autoFocus
                />
              ) : (
                <View style={styles.row}>
                  <Text style={styles.goalText}>{goalText}</Text>
                  <TouchableOpacity onPress={() => setIsEditingText(true)}>
                    <Ionicons name="pencil" size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <View style={[styles.icon, styles.iconAmber]}>
              <Ionicons name="calendar" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.label}>Deadline</Text>
              <Text style={styles.deadlineText}>{formatDate(deadline)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.encouragement}>
          <Text style={styles.encouragementTitle}>You've got this! 💪</Text>
          <Text style={styles.encouragementText}>
            I'll check in with you regularly to keep you on track. You can
            always adjust if life throws a curveball.
          </Text>
        </View>

        <View style={styles.benefits}>
          <Text style={styles.benefitsTitle}>What happens next:</Text>
          {[
            'Get gentle reminders as your deadline approaches',
            'Update progress anytime, no pressure',
            'Earn points for staying consistent ✨',
          ].map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.bullet} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, (!goalText || !deadline) && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={!goalText || !deadline}
        >
          <Text style={styles.buttonText}>Lock this in 🔒</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 24,
  },
  section: {
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAmber: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  sectionContent: {
    flex: 1,
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  goalText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  textArea: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  deadlineText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  encouragement: {
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    padding: 24,
    marginTop: 24,
  },
  encouragementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  encouragementText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  benefits: {
    marginTop: 24,
    gap: 12,
  },
  benefitsTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  benefitItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});

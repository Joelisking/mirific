import { theme } from '@/constants/theme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GoalsStepProps {
  selectedGoals: string[];
  onToggleGoal: (goal: string) => void;
}

const goalOptions = [
  'Career & internships',
  'Academic success',
  'Health & fitness',
  'Creative projects',
  'Side hustle',
  'Personal growth',
];

export default function GoalsStep({
  selectedGoals,
  onToggleGoal,
}: GoalsStepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What are you focusing on?</Text>
      <Text style={styles.stepSubtitle}>
        Pick what matters most to you right now
      </Text>
      <View style={styles.optionsGrid}>
        {goalOptions.map((goal) => (
          <TouchableOpacity
            key={goal}
            onPress={() => onToggleGoal(goal)}
            style={[
              styles.optionCard,
              selectedGoals.includes(goal) && styles.optionCardSelected,
            ]}>
            <Text
              style={[
                styles.optionText,
                selectedGoals.includes(goal) && styles.optionTextSelected,
              ]}>
              {goal}
            </Text>
          </TouchableOpacity>
        ))}
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
  },
  optionCardSelected: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  optionTextSelected: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
});

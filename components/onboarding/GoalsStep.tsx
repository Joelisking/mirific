import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GoalsStepProps {
  selectedGoals: string[];
  onToggleGoal: (goal: string) => void;
}

const goalOptions = [
  { label: 'Career & internships', emoji: '💼' },
  { label: 'Academic success', emoji: '📚' },
  { label: 'Health & fitness', emoji: '💪' },
  { label: 'Creative projects', emoji: '🎨' },
  { label: 'Side hustle', emoji: '💰' },
  { label: 'Personal growth', emoji: '🌱' },
];

export default function GoalsStep({
  selectedGoals,
  onToggleGoal,
}: GoalsStepProps) {
  return (
    <View style={styles.stepContainer}>
      <LinearGradient
        colors={theme.gradients.sage as [string, string]}
        style={styles.iconContainer}
      >
        <Ionicons name="flag-outline" size={32} color="#fff" />
      </LinearGradient>
      <Text style={styles.stepTitle}>What are you focusing on?</Text>
      <Text style={styles.stepSubtitle}>
        Pick what matters most to you right now
      </Text>
      <View style={styles.optionsGrid}>
        {goalOptions.map((goal) => {
          const isSelected = selectedGoals.includes(goal.label);
          return (
            <TouchableOpacity
              key={goal.label}
              onPress={() => onToggleGoal(goal.label)}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.emojiContainer, isSelected && styles.emojiContainerSelected]}>
                <Text style={styles.optionEmoji}>{goal.emoji}</Text>
              </View>
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}>
                {goal.label}
              </Text>
              {isSelected && (
                <LinearGradient
                  colors={theme.gradients.sage as [string, string]}
                  style={styles.checkMark}
                >
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </LinearGradient>
              )}
            </TouchableOpacity>
          );
        })}
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '48%',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.small,
  },
  optionCardSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  emojiContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  optionEmoji: {
    fontSize: 18,
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  checkMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

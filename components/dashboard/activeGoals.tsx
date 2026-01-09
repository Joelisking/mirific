import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ActiveGoalsProps {
  setShowQuickActions: (show: boolean) => void;
}

const ActiveGoals = ({ setShowQuickActions }: ActiveGoalsProps) => {
  const router = useRouter();
  const { goals, setCurrentGoal } = useApp();
  const handleNavigateToCheckIn = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      setCurrentGoal(goal);
      router.push('/checkin');
    }
  };

  const activeGoals = goals.filter(
    (g) => g.status === 'on-track' || g.status === 'at-risk'
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Active Goals</Text>
        <TouchableOpacity onPress={() => router.push('/timeline')}>
          <Text style={styles.addButton}>View all</Text>
        </TouchableOpacity>
      </View>
      {activeGoals.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="radio-button-off"
            size={48}
            color={theme.colors.border}
          />
          <Text style={styles.emptyText}>No active goals yet</Text>
          <TouchableOpacity onPress={() => setShowQuickActions(true)}>
            <Text style={styles.emptyButton}>
              Set your first goal
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.goalsList}>
          {activeGoals.slice(0, 3).map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={styles.activeGoalItem}
              onPress={() => handleNavigateToCheckIn(goal.id)}>
              <Text style={styles.goalText}>{goal.text}</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressValue}>
                    {goal.progress}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${goal.progress}%` },
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default ActiveGoals;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
    gap: 24,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  addButton: {
    fontSize: 14,
    color: theme.colors.accent,
  },
  weekDays: {
    flexDirection: 'row',
    gap: 8,
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  dayCardToday: {
    backgroundColor: theme.colors.primary,
  },
  dayName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  dayNameToday: {
    color: theme.colors.textPrimary,
  },
  dayDate: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  dayDateToday: {
    color: theme.colors.textPrimary,
  },
  focusCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: 'theme.colors.accent',
  },
  goalsList: {
    gap: 8,
  },
  goalItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceHighlight,
  },
  goalText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalDeadline: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  goalBadge: {
    backgroundColor: 'theme.colors.surfaceElevated',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalBadgeRisk: {
    backgroundColor: theme.colors.background,
  },
  goalBadgeText: {
    fontSize: 12,
    color: 'theme.colors.success',
  },
  goalBadgeTextRisk: {
    color: 'theme.colors.primary',
  },
  habitsList: {
    gap: 12,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: 'theme.colors.primary',
  },
  habitEmoji: {
    fontSize: 18,
  },
  habitName: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  habitNameCompleted: {
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  habitTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  habitStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  habitStreakNumber: {
    fontSize: 12,
    color: 'theme.colors.warning',
  },
  habitStreakEmoji: {
    fontSize: 14,
  },
  activeGoalItem: {
    borderWidth: 2,
    borderColor: theme.colors.surfaceHighlight,
    borderRadius: 16,
    padding: 16,
  },
  progressContainer: {
    marginTop: 12,
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  progressValue: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'theme.colors.border',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'theme.colors.accent',
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyButton: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  actionsList: {
    gap: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'theme.colors.surfaceElevated',
    borderRadius: 16,
    padding: 16,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  coachButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  coachButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  habitModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  habitModalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  habitModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  habitForm: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOptionSelected: {
    backgroundColor: theme.colors.background,
    borderColor: 'theme.colors.accent',
  },
  emojiText: {
    fontSize: 24,
  },
  addHabitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  addHabitButtonDisabled: {
    opacity: 0.5,
  },
  addHabitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});

import { theme } from '@/constants/theme';
import {
  useDeleteApiHabitsByIdMutation,
  useGetApiHabitsQuery,
  usePatchApiHabitsByIdMutation,
} from '@/lib/redux';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';

interface DailyHabitsProps {
  setShowAddHabit: (show: boolean) => void;
  onEditHabit: (habit: any) => void;
}

function DailyHabits({ setShowAddHabit, onEditHabit }: DailyHabitsProps) {
  const { data: habits, isLoading, error } = useGetApiHabitsQuery();
  const [toggleHabit] = usePatchApiHabitsByIdMutation();
  const [deleteHabit] = useDeleteApiHabitsByIdMutation();

  const handleToggle = async (habitId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await toggleHabit({ id: habitId }).unwrap();
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  };

  const handleDelete = (habitId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to stop tracking this habit?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHabit({ id: habitId }).unwrap();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (e) {
              console.error("Failed to delete", e);
            }
          }
        }
      ]
    );
  };

  const RightAction = ({ prog, drag, onDelete }: any) => {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 60 }],
      };
    });

    return (
      <Reanimated.View style={styleAnimation}>
        <View style={styles.rightActions}>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
            <Ionicons name="trash" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Reanimated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Daily Habits</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Daily Habits</Text>
        </View>
        <Text style={styles.errorText}>
          Failed to load habits:{' '}
          {error && 'message' in error
            ? error.message
            : String(error)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Daily Habits</Text>
        <TouchableOpacity onPress={() => setShowAddHabit(true)}>
          <Text style={styles.addButton}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.habitsList}>
        {habits && habits.length > 0 ? (
          habits.map((habit) => (
            <ReanimatedSwipeable
              key={habit.id}
              friction={2}
              enableTrackpadTwoFingerGesture
              rightThreshold={40}
              renderRightActions={(prog, drag) => (
                <RightAction prog={prog} drag={drag} onDelete={() => handleDelete(habit.id!)} />
              )}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.habitItem,
                  pressed && { opacity: 0.7 }
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  onEditHabit(habit);
                }}
                delayLongPress={500}
              >
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation(); // Prevent opening edit sheet
                    handleToggle(habit.id!);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View
                    style={[
                      styles.checkbox,
                      habit.completedToday && styles.checkboxChecked,
                    ]}
                  >
                    {habit.completedToday && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                <View style={styles.habitContent}>
                  <Text
                    style={[
                      styles.habitName,
                      habit.completedToday && styles.habitNameCompleted,
                    ]}>
                    {habit.name}
                  </Text>
                  {habit.reminderTime && (
                    <Text style={styles.habitTime}>
                      {habit.reminderTime}
                    </Text>
                  )}
                </View>
                {habit.streak! > 0 && (
                  <View style={styles.habitStreak}>
                    <Text style={styles.habitStreakNumber}>
                      {habit.streak}
                    </Text>
                    <Text style={styles.habitStreakEmoji}>🔥</Text>
                  </View>
                )}
              </Pressable>
            </ReanimatedSwipeable>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No habits yet</Text>
            <TouchableOpacity onPress={() => setShowAddHabit(true)}>
              <Text style={styles.emptyButton}>
                + Add your first habit
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

export default DailyHabits;

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
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.h2.fontFamily,
    letterSpacing: -0.5,
  },
  addButton: {
    fontSize: 14,
    color: theme.colors.textPrimary,
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
    borderColor: theme.colors.accent,
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
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalBadgeRisk: {
    backgroundColor: theme.colors.background,
  },
  habitsList: {
    gap: 0, // No gap, using dividers
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    borderRadius: 0, // Flat list
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6, // Squircle
    borderWidth: 1.5,
    borderColor: theme.colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  habitEmoji: {
    fontSize: 18,
  },
  habitContent: {
    flex: 1,
    gap: 2,
    marginLeft: -5,
  },
  habitName: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  habitNameCompleted: {
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  habitTime: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  habitStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  habitStreakNumber: {
    fontSize: 12,
    color: theme.colors.warning,
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
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
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
    color: theme.colors.primary,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error || '#ef4444',
    textAlign: 'center',
    paddingVertical: 24,
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
    backgroundColor: theme.colors.surfaceElevated,
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
    borderColor: theme.colors.accent,
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
  rightActions: {
    width: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: '#ef4444', // Red
  },
});

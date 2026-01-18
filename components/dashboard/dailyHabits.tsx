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
        <TouchableOpacity
          onPress={() => setShowAddHabit(true)}
          style={styles.addButtonContainer}
        >
          <Ionicons name="add" size={18} color={theme.colors.primary} />
          <Text style={styles.addButton}>Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.habitsList}>
        {habits && habits.length > 0 ? (
          habits.map((habit, index) => (
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
                  index === habits.length - 1 && styles.habitItemLast,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  onEditHabit(habit);
                }}
                delayLongPress={500}
              >
                {/* Left colored accent bar */}
                <View style={[
                  styles.accentBar,
                  habit.completedToday && styles.accentBarCompleted
                ]} />

                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleToggle(habit.id!);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.checkboxContainer}
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
                    <View style={styles.habitTimeContainer}>
                      <Ionicons name="time-outline" size={12} color={theme.colors.textTertiary} />
                      <Text style={styles.habitTime}>
                        {habit.reminderTime}
                      </Text>
                    </View>
                  )}
                </View>

                {habit.streak! > 0 && (
                  <View style={[
                    styles.habitStreak,
                    habit.streak! >= 7 && styles.habitStreakGlow
                  ]}>
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
            <View style={styles.emptyIcon}>
              <Ionicons name="leaf-outline" size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyText}>No habits yet</Text>
            <Text style={styles.emptySubtext}>Build your daily routine</Text>
            <TouchableOpacity
              onPress={() => setShowAddHabit(true)}
              style={styles.emptyButtonContainer}
            >
              <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.emptyButton}>
                Add your first habit
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
  addButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.full,
  },
  addButton: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  habitsList: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    paddingLeft: 0,
    backgroundColor: theme.colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  habitItemLast: {
    borderBottomWidth: 0,
  },
  accentBar: {
    width: 4,
    height: '100%',
    backgroundColor: theme.colors.border,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderBottomLeftRadius: theme.borderRadius.xl,
  },
  accentBarCompleted: {
    backgroundColor: theme.colors.success,
  },
  checkboxContainer: {
    marginLeft: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: theme.borderRadius.full, // Circular checkbox
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  habitEmoji: {
    fontSize: 20,
  },
  habitContent: {
    flex: 1,
    gap: 2,
  },
  habitName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  habitNameCompleted: {
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  habitTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  habitTime: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  habitStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  habitStreakGlow: {
    backgroundColor: 'rgba(232, 167, 86, 0.15)',
    ...theme.shadows.streakGlow,
  },
  habitStreakNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.warning,
  },
  habitStreakEmoji: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.full,
  },
  emptyButton: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    textAlign: 'center',
    paddingVertical: 24,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
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
    backgroundColor: theme.colors.error,
  },
});

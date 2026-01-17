import AddHabitSheet from '@/components/dashboard/AddHabitSheet';
import { theme } from "@/constants/theme";
import { useApp } from '@/contexts/AppContext';
import { useDeleteApiGoalsByIdMutation, useGetApiGoalsQuery, usePatchApiGoalsByIdMutation } from '@/lib/redux';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TimelineScreen() {
  const router = useRouter();
  const { points, setCurrentGoal, setPoints } = useApp();
  const { data: goals, isLoading } = useGetApiGoalsQuery();
  const [deleteGoal] = useDeleteApiGoalsByIdMutation();
  const [updateGoal] = usePatchApiGoalsByIdMutation();

  // Edit State
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [editInitialValues, setEditInitialValues] = useState<any>(null);

  // ... (previous helper functions: getStatusColor, getStatusLabel, formatDate) ...
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return { bg: 'rgba(34, 197, 94, 0.1)', text: theme.colors.onTrack, border: theme.colors.onTrack, icon: 'checkmark-circle' };
      case 'at-risk':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: theme.colors.atRisk, border: theme.colors.atRisk, icon: 'alert-circle' };
      case 'completed':
        return { bg: 'rgba(34, 197, 94, 0.2)', text: theme.colors.success, border: theme.colors.success, icon: 'trophy' };
      default:
        return { bg: theme.colors.surfaceElevated, text: theme.colors.textSecondary, border: theme.colors.border, icon: 'ellipse-outline' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-track': return 'On Track';
      case 'at-risk': return 'At Risk';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 0) return 'Overdue';
    if (diffDays <= 7) return `${diffDays} days left`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleGoalPress = (goal: any) => {
    if (goal && goal.status !== 'completed') {
      setCurrentGoal(goal);
      router.push('/checkin');
    }
  };

  const handleEditGoal = (goal: any) => {
    setSelectedGoalId(goal.id);
    setEditInitialValues({
      name: goal.text,
      deadline: goal.deadline ? new Date(goal.deadline) : new Date(),
      emoji: '🎯'
    });
    setShowEditSheet(true);
  };

  const handleDeleteGoal = (goal: any) => {
    Alert.alert(
      "Delete Goal",
      "Are you sure you want to delete this goal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (goal.id) {
                await deleteGoal({ id: goal.id }).unwrap();
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete goal");
            }
          }
        }
      ]
    );
  };

  const handleQuickComplete = async (goal: any) => {
    try {
      await updateGoal({
        id: goal.id,
        updateGoalRequest: {
          status: 'completed',
          progress: 100
        }
      }).unwrap();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPoints(points + 100);
    } catch (e) {
      console.error(e);
    }
  };

  const showGoalOptions = (goal: any) => {
    Alert.alert(
      "Manage Goal",
      "What would you like to do?",
      [
        { text: "Edit", onPress: () => handleEditGoal(goal) },
        { text: "Delete", style: "destructive", onPress: () => handleDeleteGoal(goal) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  // SWIPE ACTIONS
  const RightAction = ({ prog, drag, onEdit, onDelete }: any) => {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 120 }], // 60 width * 2 buttons
      };
    });

    return (
      <Reanimated.View style={styleAnimation}>
        <View style={styles.rightActions}>
          <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={onEdit}>
            <Ionicons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
            <Ionicons name="trash" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Reanimated.View>
    );
  };

  const LeftAction = ({ prog, drag, onComplete }: any) => {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value - 60 }],
      };
    });

    return (
      <Reanimated.View style={styleAnimation}>
        <TouchableOpacity style={[styles.actionBtn, styles.completeBtn]} onPress={onComplete}>
          <Ionicons name="checkmark-done" size={24} color="#fff" />
        </TouchableOpacity>
      </Reanimated.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    )
  }

  const sortedGoals = goals ? [...goals].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return new Date(a.deadline || '').getTime() - new Date(b.deadline || '').getTime();
  }) : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Progress</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Points Banner */}
        <TouchableOpacity
          style={styles.pointsBanner}
          onPress={() => router.push('/rewards')}
        >
          <View style={styles.pointsContent}>
            <View style={styles.trophyIcon}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
            </View>
            <View>
              <Text style={styles.pointsLabel}>Total Points</Text>
              <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>Gold Tier</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Your Goals</Text>

        {!sortedGoals || sortedGoals.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="rocket-outline" size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyText}>No goals yet. Let's change that!</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/coach')}
            >
              <Text style={styles.emptyButtonText}>Create Goal with AI</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.goalsList}>
            {sortedGoals.map((goal) => {
              const colors = getStatusColor(goal.status || 'on-track');
              const isCompleted = goal.status === 'completed';

              return (
                <ReanimatedSwipeable
                  key={goal.id}
                  friction={2}
                  enableTrackpadTwoFingerGesture
                  rightThreshold={40}
                  renderRightActions={(prog, drag) => (
                    <RightAction prog={prog} drag={drag} onEdit={() => handleEditGoal(goal)} onDelete={() => handleDeleteGoal(goal)} />
                  )}
                  renderLeftActions={(prog, drag) => !isCompleted ? (
                    <LeftAction prog={prog} drag={drag} onComplete={() => handleQuickComplete(goal)} />
                  ) : undefined}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.goalCard,
                      isCompleted && styles.goalCardCompleted,
                      { transform: [{ scale: pressed ? 0.98 : 1 }] }
                    ]}
                    onPress={() => handleGoalPress(goal)}
                    delayLongPress={200}
                    onLongPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                      showGoalOptions(goal);
                    }}
                  >
                    <View style={styles.goalHeader}>
                      <View style={[styles.goalTitleRow, { justifyContent: 'space-between', width: '100%' }]}>
                        <View style={{ flexDirection: 'row', gap: 12, flex: 1 }}>
                          <Text style={styles.goalEmoji}>🎯</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.goalText, isCompleted && styles.goalTextCompleted]} numberOfLines={2}>{goal.text}</Text>
                            <Text style={styles.deadline}>{formatDate(goal.deadline)}</Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={{ padding: 4 }}
                          onPress={() => showGoalOptions(goal)}
                        >
                          <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                      </View>

                      <View style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                        <Ionicons name={colors.icon as any} size={12} color={colors.text} style={{ marginRight: 4 }} />
                        <Text style={[styles.statusText, { color: colors.text }]}>
                          {getStatusLabel(goal.status || 'on-track')}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressSection}>
                      <View style={styles.progressLabelRow}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressValue}>{goal.progress || 0}%</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${goal.progress || 0}%` as any, backgroundColor: isCompleted ? theme.colors.success : theme.colors.primary }]} />
                      </View>
                    </View>
                  </Pressable>
                </ReanimatedSwipeable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <AddHabitSheet
        visible={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        initialType="goal"
        initialId={selectedGoalId || undefined}
        initialValues={editInitialValues}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  iconButton: {
    padding: 8,
    margin: -8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 24,
    paddingBottom: 100,
  },
  pointsBanner: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pointsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  trophyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  rankBadge: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.accent,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },

  goalsList: {
    gap: 16,
  },
  goalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  goalCardCompleted: {
    opacity: 0.8,
    borderColor: 'transparent',
  },
  goalHeader: {
    marginBottom: 16,
    gap: 12,
  },
  goalTitleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  goalEmoji: {
    fontSize: 24,
    backgroundColor: theme.colors.surfaceElevated,
    width: 40,
    height: 40,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 40,
    borderRadius: 12,
    overflow: 'hidden',
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  goalTextCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  deadline: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  progressSection: {
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
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  newGoalButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  newGoalButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },

  // SWIPE ACTIONS STYLES
  rightActions: {
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingLeft: 12,
    gap: 8,
  },
  actionBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  editBtn: {
    backgroundColor: '#6b7280', // Gray
  },
  deleteBtn: {
    backgroundColor: '#ef4444', // Red
  },
  completeBtn: {
    backgroundColor: theme.colors.success,
    marginLeft: 12,
    height: 50,
    width: 50,
    borderRadius: 25,
    alignSelf: 'center'
  },
});

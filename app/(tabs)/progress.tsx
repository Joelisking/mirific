import AddHabitSheet from '@/components/dashboard/AddHabitSheet';
import { theme } from "@/constants/theme";
import { useApp } from '@/contexts/AppContext';
import { useDeleteApiGoalsByIdMutation, useGetApiGoalsQuery, usePatchApiGoalsByIdMutation } from '@/lib/redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

  const [showEditSheet, setShowEditSheet] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [editInitialValues, setEditInitialValues] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return { bg: 'rgba(107, 155, 122, 0.12)', text: theme.colors.onTrack, border: theme.colors.onTrack, icon: 'checkmark-circle' };
      case 'at-risk':
        return { bg: 'rgba(217, 115, 115, 0.12)', text: theme.colors.atRisk, border: theme.colors.atRisk, icon: 'alert-circle' };
      case 'completed':
        return { bg: 'rgba(107, 155, 122, 0.2)', text: theme.colors.success, border: theme.colors.success, icon: 'trophy' };
      default:
        return { bg: theme.colors.surfaceHighlight, text: theme.colors.textSecondary, border: theme.colors.border, icon: 'ellipse-outline' };
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

  const RightAction = ({ prog, drag, onEdit, onDelete }: any) => {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 120 }],
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
    <LinearGradient
      colors={theme.gradients.warmBeige as [string, string]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Progress</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Points Banner with Gradient */}
          <TouchableOpacity
            style={styles.pointsBannerContainer}
            onPress={() => router.push('/rewards')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={theme.gradients.sunsetAccent as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pointsBanner}
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
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Your Goals</Text>

          {!sortedGoals || sortedGoals.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="rocket-outline" size={36} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyText}>No goals yet. Let's change that!</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/coach')}
              >
                <LinearGradient
                  colors={theme.gradients.sage as [string, string]}
                  style={styles.emptyButtonGradient}
                >
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.emptyButtonText}>Create Goal with AI</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.goalsList}>
              {sortedGoals.map((goal) => {
                const colors = getStatusColor(goal.status || 'on-track');
                const isCompleted = goal.status === 'completed';
                const progress = goal.progress || 0;

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
                      {/* Status ribbon */}
                      <View style={[styles.statusRibbon, { backgroundColor: colors.border }]} />

                      <View style={styles.goalCardContent}>
                        <View style={styles.goalHeader}>
                          <View style={styles.goalTitleRow}>
                            <View style={styles.goalEmojiContainer}>
                              <Text style={styles.goalEmoji}>🎯</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.goalText, isCompleted && styles.goalTextCompleted]} numberOfLines={2}>{goal.text}</Text>
                              <Text style={styles.deadline}>{formatDate(goal.deadline)}</Text>
                            </View>

                            <TouchableOpacity
                              style={styles.moreButton}
                              onPress={() => showGoalOptions(goal)}
                            >
                              <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textTertiary} />
                            </TouchableOpacity>
                          </View>

                          <View style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                            <Ionicons name={colors.icon as any} size={12} color={colors.text} style={{ marginRight: 4 }} />
                            <Text style={[styles.statusText, { color: colors.text }]}>
                              {getStatusLabel(goal.status || 'on-track')}
                            </Text>
                          </View>
                        </View>

                        {/* Enhanced Progress Bar */}
                        <View style={styles.progressSection}>
                          <View style={styles.progressLabelRow}>
                            <Text style={styles.progressLabel}>Progress</Text>
                            <Text style={[styles.progressValue, isCompleted && { color: theme.colors.success }]}>{progress}%</Text>
                          </View>
                          <View style={styles.progressBarContainer}>
                            <View style={styles.progressBar}>
                              <LinearGradient
                                colors={isCompleted ? theme.gradients.success as [string, string] : theme.gradients.sage as [string, string]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.progressFill, { width: `${progress}%` }]}
                              />
                            </View>
                            {/* Milestone markers */}
                            <View style={styles.milestones}>
                              {[25, 50, 75].map((milestone) => (
                                <View
                                  key={milestone}
                                  style={[
                                    styles.milestone,
                                    { left: `${milestone}%` },
                                    progress >= milestone && styles.milestoneReached
                                  ]}
                                />
                              ))}
                            </View>
                          </View>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.h1.fontFamily,
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 24,
    paddingBottom: 100,
  },
  pointsBannerContainer: {
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  pointsBanner: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  trophyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
    fontWeight: '500',
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  rankBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  goalsList: {
    gap: 16,
  },
  goalCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  goalCardCompleted: {
    opacity: 0.7,
  },
  statusRibbon: {
    width: 5,
  },
  goalCardContent: {
    flex: 1,
    padding: 20,
  },
  goalHeader: {
    marginBottom: 16,
    gap: 12,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  goalEmojiContainer: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalEmoji: {
    fontSize: 22,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    lineHeight: 22,
  },
  goalTextCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  deadline: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  moreButton: {
    padding: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
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
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  progressBarContainer: {
    position: 'relative',
    height: 12,
  },
  progressBar: {
    height: 10,
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  milestones: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 10,
  },
  milestone: {
    position: 'absolute',
    top: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    marginLeft: -3,
  },
  milestoneReached: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 16,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
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
    ...theme.shadows.small,
  },
  editBtn: {
    backgroundColor: theme.colors.textSecondary,
  },
  deleteBtn: {
    backgroundColor: theme.colors.error,
  },
  completeBtn: {
    backgroundColor: theme.colors.success,
    marginLeft: 12,
  },
});

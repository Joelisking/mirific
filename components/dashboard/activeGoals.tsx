import { theme } from '@/constants/theme';
import { useGetApiGoalsQuery } from '@/lib/redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ActiveGoalsProps {
  setShowQuickActions: (show: boolean) => void;
  onAddGoal?: () => void;
}

const ActiveGoals = ({ setShowQuickActions, onAddGoal }: ActiveGoalsProps) => {
  const router = useRouter();
  const { data: goals, isLoading } = useGetApiGoalsQuery();
  const { setCurrentGoal } = require('@/contexts/AppContext').useApp();

  const handleNavigateToCheckIn = (goalId: string) => {
    const goal = goals?.find((g) => g.id === goalId);
    if (goal) {
      setCurrentGoal(goal);
      router.push('/checkin');
    }
  };

  const getProgressMessage = (progress: number) => {
    if (progress >= 75) return "Almost there!";
    if (progress >= 50) return "Halfway done!";
    if (progress >= 25) return "Great start!";
    return "Keep going!";
  };

  const activeGoals = goals?.filter(
    (g) => g.status === 'on-track' || g.status === 'at-risk'
  ) || [];

  if (isLoading) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Active Goals</Text>
        <TouchableOpacity
          onPress={() => router.push('/progress')}
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>View all</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.accent} />
        </TouchableOpacity>
      </View>

      {activeGoals.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="flag-outline"
              size={36}
              color={theme.colors.primary}
            />
          </View>
          <Text style={styles.emptyText}>No active goals yet</Text>
          <Text style={styles.emptySubtext}>Set a goal to start your journey</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => {
              if (onAddGoal) {
                onAddGoal();
              } else {
                setShowQuickActions(true);
              }
            }}
          >
            <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
            <Text style={styles.emptyButtonText}>
              Set your first goal
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.goalsList}>
          {activeGoals.slice(0, 3).map((goal) => {
            const progress = goal.progress || 0;

            return (
              <TouchableOpacity
                key={goal.id}
                style={styles.activeGoalItem}
                onPress={() => handleNavigateToCheckIn(goal.id!)}
                activeOpacity={0.8}
              >
                <View style={styles.goalHeader}>
                  <Text style={styles.goalText} numberOfLines={2}>{goal.text}</Text>
                  <View style={styles.progressBadge}>
                    <Text style={styles.progressBadgeText}>{getProgressMessage(progress)}</Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressValue}>{progress}%</Text>
                  </View>

                  {/* Enhanced progress bar with milestones */}
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={theme.gradients.sage as [string, string]}
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

                <View style={styles.goalFooter}>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default ActiveGoals;

const styles = StyleSheet.create({
  card: {
    gap: 4,
    paddingBottom: 24,
  },
  loadingCard: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
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
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  goalsList: {
    gap: 12,
  },
  activeGoalItem: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    ...theme.shadows.medium,
  },
  goalHeader: {
    marginBottom: 16,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    lineHeight: 22,
  },
  progressBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  progressContainer: {
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
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
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
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.full,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});

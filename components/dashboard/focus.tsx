import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useGetApiGoalsQuery } from '@/lib/redux';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SkeletonItem = ({ style }: { style: any }) => {
  const animatedValue = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  return (
    <Animated.View
      style={[
        { opacity: animatedValue, backgroundColor: theme.colors.surfaceElevated },
        style,
      ]}
    />
  );
};

function DashboardDailyFocus({ onAddGoal }: { onAddGoal?: () => void }) {
  const router = useRouter();
  const { setCurrentGoal } = useApp();
  const { data: goals, isLoading, error } = useGetApiGoalsQuery();

  // ... (rest of the component logic remains same until return)

  const getTodayGoals = () => {
    const today = new Date();
    return goals?.filter((goal) => {
      if (goal.status === 'completed') return false;
      if (!goal.deadline) return false;

      const deadline = new Date(goal.deadline);
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Criteria 1: Due Soon (<= 3 days)
      // Note: We check diffDays > -100 (or similar) to include overdue, 
      // but usually 'completed' check handles old stuff. 
      // Let's assume we want to see overdue items too until completed.
      const isDueSoon = diffDays <= 3;

      // Criteria 2: At Risk (< 7 days AND < 50% progress)
      // This matches the logic discussed for "At Risk"
      const isAtRisk = diffDays < 7 && (goal.progress || 0) < 50;

      return isDueSoon || isAtRisk;
    });
  };

  const todayFocus = getTodayGoals();
  const hasGoals = todayFocus && todayFocus.length > 0;

  if (isLoading) {
    return (
      <View style={styles.focusCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerContent}>
            <SkeletonItem style={{ width: 40, height: 40, borderRadius: 12 }} />
            <View style={{ gap: 8 }}>
              <SkeletonItem style={{ width: 120, height: 20, borderRadius: 4 }} />
              <SkeletonItem style={{ width: 180, height: 14, borderRadius: 4 }} />
            </View>
          </View>
        </View>
        <View style={styles.goalsList}>
          <SkeletonItem style={{ width: '100%', height: 80, borderRadius: 16 }} />
          <SkeletonItem style={{ width: '100%', height: 80, borderRadius: 16 }} />
        </View>
      </View>
    );
  }

  if (error) {
    console.error('Failed to load goals:', error);
    return null;
  }

  // If no goals meet the criteria, hide the component entirely
  if (!hasGoals) {
    return null;
  }

  const handleNavigateToCheckIn = (goalId: string) => {
    const goal = goals?.find((g) => g.id === goalId);
    if (goal) {
      setCurrentGoal(goal);
      router.push('/checkin');
    }
  };

  return (
    <>
      <View style={styles.focusCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerContent}>
            <View style={styles.iconBadge}>
              <Ionicons
                name="flame"
                size={18}
                color={theme.colors.warning}
              />
            </View>
            <View>
              <Text style={styles.cardTitle}>Daily Focus</Text>
              <Text style={styles.cardSubtitle}>
                {`${todayFocus?.length} ${todayFocus?.length === 1 ? 'goal needs' : 'goals need'} attention`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.goalsList}>
          {todayFocus?.map((goal) => {
            const deadline = new Date(goal.deadline!);
            const today = new Date();
            const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const isAtRisk = diffDays < 7 && (goal.progress || 0) < 50;
            const isOverdue = diffDays < 0;

            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalItem,
                  isAtRisk && styles.goalItemAtRisk,
                ]}
                onPress={() => handleNavigateToCheckIn(goal.id as string)}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalText} numberOfLines={2}>
                    {goal.text}
                  </Text>
                  {isAtRisk && (
                    <View style={styles.urgentBadge}>
                      <Ionicons name="alert-circle" size={14} color={theme.colors.error} />
                      <Text style={styles.urgentText}>At Risk</Text>
                    </View>
                  )}
                  {!isAtRisk && isOverdue && (
                    <View style={[styles.urgentBadge, { marginBottom: 0 }]}>
                      <Ionicons name="time" size={14} color={theme.colors.error} />
                      <Text style={styles.urgentText}>Overdue</Text>
                    </View>
                  )}
                </View>
                <View style={styles.goalMeta}>
                  <View style={styles.deadlineContainer}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={[styles.goalDeadline, isOverdue && { color: theme.colors.error }]}>
                      {goal.deadline ? new Date(goal.deadline).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                        }
                      ) : 'No deadline'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.goalBadge,
                      isAtRisk && styles.goalBadgeRisk,
                    ]}>
                    <Text
                      style={[
                        styles.goalBadgeText,
                        isAtRisk && styles.goalBadgeTextRisk,
                      ]}>
                      {goal.progress}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </>
  );
}

export default DashboardDailyFocus;

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
  focusCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: theme.colors.warning,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  goalsList: {
    gap: 12,
  },
  goalItem: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  goalItemAtRisk: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  goalHeader: {
    marginBottom: 12,
  },
  goalText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.error,
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  goalDeadline: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  goalBadge: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  goalBadgeRisk: {
    backgroundColor: 'rgba(239, 83, 80, 0.15)',
  },
  goalBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.success,
  },
  goalBadgeTextRisk: {
    color: theme.colors.error,
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
});

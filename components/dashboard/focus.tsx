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
        { opacity: animatedValue, backgroundColor: theme.colors.surfaceHighlight },
        style,
      ]}
    />
  );
};

function DashboardDailyFocus({ onAddGoal }: { onAddGoal?: () => void }) {
  const router = useRouter();
  const { setCurrentGoal } = useApp();
  const { data: goals, isLoading, error } = useGetApiGoalsQuery();

  const getTodayGoals = () => {
    const today = new Date();
    return goals?.filter((goal) => {
      if (goal.status === 'completed') return false;
      if (!goal.deadline) return false;

      const deadline = new Date(goal.deadline);
      const diffTime = deadline.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isDueSoon = diffDays <= 3;
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
            <SkeletonItem style={{ width: 44, height: 44, borderRadius: theme.borderRadius.md }} />
            <View style={{ gap: 8 }}>
              <SkeletonItem style={{ width: 120, height: 20, borderRadius: theme.borderRadius.sm }} />
              <SkeletonItem style={{ width: 180, height: 14, borderRadius: theme.borderRadius.sm }} />
            </View>
          </View>
        </View>
        <View style={styles.goalsList}>
          <SkeletonItem style={{ width: '100%', height: 80, borderRadius: theme.borderRadius.lg }} />
          <SkeletonItem style={{ width: '100%', height: 80, borderRadius: theme.borderRadius.lg }} />
        </View>
      </View>
    );
  }

  if (error) {
    console.error('Failed to load goals:', error);
    return null;
  }

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
                size={20}
                color={theme.colors.warning}
              />
            </View>
            <View>
              <Text style={styles.cardTitle}>Needs Attention</Text>
              <Text style={styles.cardSubtitle}>
                {`${todayFocus?.length} ${todayFocus?.length === 1 ? 'goal needs' : 'goals need'} your focus`}
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
                style={styles.goalItem}
                onPress={() => handleNavigateToCheckIn(goal.id as string)}
                activeOpacity={0.8}
              >
                {/* Left status ribbon */}
                <View style={[
                  styles.statusRibbon,
                  isOverdue && styles.statusRibbonOverdue,
                  isAtRisk && !isOverdue && styles.statusRibbonAtRisk,
                  !isAtRisk && !isOverdue && styles.statusRibbonWarning
                ]} />

                <View style={styles.goalContent}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalText} numberOfLines={2}>
                      {goal.text}
                    </Text>
                    {(isAtRisk || isOverdue) && (
                      <View style={[
                        styles.urgentBadge,
                        isOverdue && styles.urgentBadgeOverdue
                      ]}>
                        <Ionicons
                          name={isOverdue ? "time" : "alert-circle"}
                          size={14}
                          color={isOverdue ? theme.colors.error : theme.colors.warning}
                        />
                        <Text style={[
                          styles.urgentText,
                          isOverdue && styles.urgentTextOverdue
                        ]}>
                          {isOverdue ? 'Overdue' : 'At Risk'}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.goalMeta}>
                    <View style={styles.deadlineContainer}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={isOverdue ? theme.colors.error : theme.colors.textSecondary}
                      />
                      <Text style={[styles.goalDeadline, isOverdue && styles.goalDeadlineOverdue]}>
                        {goal.deadline ? new Date(goal.deadline).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                          }
                        ) : 'No deadline'}
                      </Text>
                    </View>

                    {/* Progress indicator */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${goal.progress || 0}%` },
                            isAtRisk && styles.progressFillAtRisk
                          ]}
                        />
                      </View>
                      <Text style={[
                        styles.progressText,
                        isAtRisk && styles.progressTextAtRisk
                      ]}>
                        {goal.progress}%
                      </Text>
                    </View>
                  </View>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.colors.textTertiary}
                  style={styles.chevron}
                />
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
  focusCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xxl,
    padding: 20,
    borderWidth: 2,
    borderColor: theme.colors.warning,
    ...theme.shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(232, 167, 86, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  goalsList: {
    gap: 12,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  statusRibbon: {
    width: 5,
    alignSelf: 'stretch',
    backgroundColor: theme.colors.warning,
  },
  statusRibbonAtRisk: {
    backgroundColor: theme.colors.warning,
  },
  statusRibbonOverdue: {
    backgroundColor: theme.colors.error,
  },
  statusRibbonWarning: {
    backgroundColor: theme.colors.warning,
  },
  goalContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 14,
  },
  goalHeader: {
    marginBottom: 10,
  },
  goalText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    lineHeight: 20,
    marginBottom: 6,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(232, 167, 86, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  urgentBadgeOverdue: {
    backgroundColor: 'rgba(217, 115, 115, 0.12)',
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  urgentTextOverdue: {
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
  goalDeadlineOverdue: {
    color: theme.colors.error,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    width: 60,
    height: 6,
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  progressFillAtRisk: {
    backgroundColor: theme.colors.warning,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    minWidth: 32,
  },
  progressTextAtRisk: {
    color: theme.colors.warning,
  },
  chevron: {
    marginRight: 12,
  },
});

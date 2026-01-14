import { theme } from "@/constants/theme";
import { useApp } from '@/contexts/AppContext';
import { useGetApiGoalsQuery } from '@/lib/redux';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TimelineScreen() {
  const router = useRouter();
  const { points, setCurrentGoal } = useApp();
  const { data: goals, isLoading } = useGetApiGoalsQuery();

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

  if (isLoading) {
      return (
          <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
          </SafeAreaView>
      )
  }

  const sortedGoals = goals ? [...goals].sort((a, b) => {
      // Sort: Completed last, then by deadline
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return new Date(a.deadline || '').getTime() - new Date(b.deadline || '').getTime();
  }) : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
                    <TouchableOpacity
                        key={goal.id}
                        style={[styles.goalCard, isCompleted && styles.goalCardCompleted]}
                        onPress={() => handleGoalPress(goal)}
                        disabled={isCompleted}
                    >
                        <View style={styles.goalHeader}>
                            <View style={styles.goalTitleRow}>
                                <Text style={styles.goalEmoji}>🎯</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.goalText, isCompleted && styles.goalTextCompleted]} numberOfLines={2}>{goal.text}</Text>
                                    <Text style={styles.deadline}>{formatDate(goal.deadline)}</Text>
                                </View>
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
                    </TouchableOpacity>
                    );
                })}
            </View>
        )}
      </ScrollView>
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
});

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { theme } from "@/constants/theme";

export default function TimelineScreen() {
  const router = useRouter();
  const { goals, points, setCurrentGoal } = useApp();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return { bg: theme.colors.surfaceElevated, text: theme.colors.onTrack, border: theme.colors.onTrack };
      case 'at-risk':
        return { bg: theme.colors.surfaceElevated, text: theme.colors.atRisk, border: theme.colors.atRisk };
      case 'completed':
        return { bg: theme.colors.surfaceElevated, text: theme.colors.success, border: theme.colors.success };
      default:
        return { bg: theme.colors.surfaceElevated, text: theme.colors.textSecondary, border: theme.colors.border };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-track':
        return '✓ On Track';
      case 'at-risk':
        return '⚠ At Risk';
      case 'completed':
        return '🎉 Completed';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
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

  const handleGoalPress = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal && goal.status !== 'completed') {
      setCurrentGoal(goal);
      router.push('/checkin');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.pointsBanner}
        onPress={() => router.push('/rewards')}
      >
        <View style={styles.pointsContent}>
          <Ionicons name="trophy" size={24} color="#fff" />
          <View>
            <Text style={styles.pointsLabel}>Your Points</Text>
            <Text style={styles.pointsValue}>{points} pts</Text>
          </View>
        </View>
        <Ionicons name="trending-up" size={20} color="#fff" />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubbles-outline" size={32} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.emptyText}>No commitments yet</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/chat')}
            >
              <Text style={styles.emptyButtonText}>Start with your coach</Text>
            </TouchableOpacity>
          </View>
        ) : (
          goals.map((goal) => {
            const colors = getStatusColor(goal.status);
            return (
              <TouchableOpacity
                key={goal.id}
                style={styles.goalCard}
                onPress={() => handleGoalPress(goal.id)}
              >
                <View style={styles.goalHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                    <Text style={[styles.statusText, { color: colors.text }]}>
                      {getStatusLabel(goal.status)}
                    </Text>
                  </View>
                  <Text style={styles.deadline}>{formatDate(goal.deadline)}</Text>
                </View>

                <Text style={styles.goalText}>{goal.text}</Text>

                {goal.status !== 'completed' && goal.status !== 'missed' && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressLabelRow}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressValue}>{goal.progress}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${goal.progress}%` }]} />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.newGoalButton}
          onPress={() => router.push('/chat')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.newGoalButtonText}>New Goal</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  pointsBanner: {
    backgroundColor: theme.colors.primary,
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointsLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
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
    borderRadius: 24,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  goalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deadline: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  goalText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: 16,
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
    color: theme.colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  footer: {
    padding: 24,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  newGoalButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  newGoalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});

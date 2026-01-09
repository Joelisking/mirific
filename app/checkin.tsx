import { useState } from 'react';
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

export default function CheckInScreen() {
  const router = useRouter();
  const { currentGoal, updateGoal, points, setPoints } = useApp();

  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [progress, setProgress] = useState(currentGoal?.progress || 0);

  if (!currentGoal || !currentGoal.id) {
    router.back();
    return null;
  }

  const getDaysUntilDeadline = () => {
    const today = new Date();
    const deadline = new Date(currentGoal.deadline || '');
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilDeadline();

  const handleComplete = () => {
    updateGoal(currentGoal.id!, { status: 'completed', progress: 100 });
    setPoints(points + 100);
    router.back();
  };

  const handleUpdateProgress = () => {
    const newStatus = progress >= 70 ? 'on-track' : 'at-risk';
    updateGoal(currentGoal.id!, { progress, status: newStatus });
    router.back();
  };

  const getMessage = () => {
    if (daysLeft <= 0) return "Hey! I noticed this deadline has passed. That's totally okay – life happens! 🌱";
    if (daysLeft <= 2) return `Your deadline is ${daysLeft === 1 ? 'tomorrow' : 'in 2 days'}. How's it going? No pressure, just checking in 💙`;
    return "How's progress on this goal? Let's make sure you're set up for success!";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check-In</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.aiMessage}>
          <View style={styles.avatar} />
          <View style={styles.messageContent}>
            <Text style={styles.coachLabel}>Your Coach</Text>
            <Text style={styles.messageText}>{getMessage()}</Text>
          </View>
        </View>

        <View style={styles.goalCard}>
          <Text style={styles.goalLabel}>Your Goal</Text>
          <Text style={styles.goalText}>{currentGoal.text}</Text>
          <View style={styles.deadlineRow}>
            <Ionicons name="calendar" size={16} color="#fff" />
            <Text style={styles.deadlineText}>
              Deadline: {new Date(currentGoal.deadline || '').toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.actionsTitle}>What would help most right now?</Text>

          <TouchableOpacity
            style={[
              styles.actionCard,
              selectedAction === 'complete' && styles.actionCardSelected,
            ]}
            onPress={() => setSelectedAction('complete')}
          >
            <View style={[styles.actionIcon, styles.actionIconGreen]}>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>I finished this! 🎉</Text>
              <Text style={styles.actionSubtitle}>Mark as complete and earn points</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionCard,
              selectedAction === 'progress' && styles.actionCardSelected,
            ]}
            onPress={() => setSelectedAction('progress')}
          >
            <View style={[styles.actionIcon, styles.actionIconGray]}>
              <Ionicons name="trending-up" size={24} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Update my progress</Text>
              <Text style={styles.actionSubtitle}>Let me know how far I've gotten</Text>
            </View>
          </TouchableOpacity>
        </View>

        {selectedAction === 'progress' && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>How far along are you?</Text>
              <Text style={styles.progressValue}>{progress}%</Text>
            </View>
            <View style={styles.sliderContainer}>
              {[0, 25, 50, 75, 100].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.progressButton,
                    progress === value && styles.progressButtonActive,
                  ]}
                  onPress={() => setProgress(value)}
                >
                  <Text
                    style={[
                      styles.progressButtonText,
                      progress === value && styles.progressButtonTextActive,
                    ]}
                  >
                    {value}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {selectedAction && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => {
              if (selectedAction === 'complete') handleComplete();
              else if (selectedAction === 'progress') handleUpdateProgress();
            }}
          >
            <Text style={styles.confirmButtonText}>
              {selectedAction === 'complete' ? 'Mark as Complete ✓' : 'Save Progress'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  aiMessage: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
  },
  messageContent: {
    flex: 1,
    gap: 8,
  },
  coachLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  messageText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  goalCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  goalLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  goalText: {
    fontSize: 18,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deadlineText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 24,
  },
  actionsTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  actionCard: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  actionCardSelected: {
    borderColor: theme.colors.primary,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconGreen: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  actionIconGray: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  actionText: {
    flex: 1,
    gap: 4,
  },
  actionTitle: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  actionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  progressCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  progressValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  progressButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  progressButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  progressButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  progressButtonTextActive: {
    color: theme.colors.textPrimary,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});

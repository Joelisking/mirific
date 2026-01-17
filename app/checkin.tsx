import { theme } from "@/constants/theme";
import { useApp } from '@/contexts/AppContext';
import { usePatchApiGoalsByIdMutation } from '@/lib/redux';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function CheckInScreen() {
  const router = useRouter();
  const { currentGoal, setPoints, points } = useApp();
  const [updateGoalApi, { isLoading }] = usePatchApiGoalsByIdMutation();

  const [progress, setProgress] = useState(currentGoal?.progress || 0);

  if (!currentGoal || !currentGoal.id) {
    router.back();
    return null;
  }

  const getDaysUntilDeadline = () => {
    if (!currentGoal.deadline) return null;
    const today = new Date();
    const deadline = new Date(currentGoal.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilDeadline();

  // ----- Actions -----
  const handleSave = async (newStatus?: 'on-track' | 'at-risk' | 'completed') => {
    try {
      let status = newStatus;
      if (!status) {
        if (progress >= 100) status = 'completed';
        else if (daysLeft !== null && daysLeft < 7 && progress < 50) status = 'at-risk';
        else status = 'on-track';
      }

      // Force completion if 100%
      if (progress >= 100 && status !== 'completed') status = 'completed';

      await updateGoalApi({
        id: currentGoal.id!,
        updateGoalRequest: {
          progress: progress,
          status: status
        }
      }).unwrap();

      if (status === 'completed') {
        setPoints(points + 100);
      }

      router.back();
    } catch (error) {
      console.error('Failed to update goal', error);
      // Could show toast here
    }
  };

  const handleMarkComplete = () => {
    setProgress(100);
    handleSave('completed');
  };

  // PanResponder for smooth slider interaction
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        updateProgress(evt.nativeEvent.pageX);
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        updateProgress(gestureState.moveX);
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  const updateProgress = (pageX: number) => {
    // 24 (padding) is the start X of the slider track relative to screen
    const trackX = 24;
    const trackWidth = SCREEN_WIDTH - 48; // Total width minus horizontal padding

    let newProgress = ((pageX - trackX) / trackWidth) * 100;

    // Clamp and round
    newProgress = Math.max(0, Math.min(100, newProgress));
    setProgress(Math.round(newProgress));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check-In</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.emojiContainer}>
            <Text style={styles.heroEmoji}>🎯</Text>
          </View>
          <Text style={styles.goalTitle}>{currentGoal.text}</Text>

          {daysLeft !== null && (
            <View style={[styles.deadlineBadge, daysLeft <= 2 && styles.deadlineBadgeRisk]}>
              <Ionicons name="time-outline" size={14} color={daysLeft <= 2 ? theme.colors.primary : theme.colors.textSecondary} />
              <Text style={[styles.deadlineText, daysLeft <= 2 && styles.deadlineTextRisk]}>
                {daysLeft <= 0 ? 'Overdue' : `${daysLeft} days left`}
              </Text>
            </View>
          )}
        </View>

        {/* PROGRESS SECTION */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionLabel}>YOUR PROGRESS</Text>
            <Text style={styles.percentageText}>{progress}%</Text>
          </View>

          <View style={styles.sliderContainer} {...panResponder.panHandlers}>
            <View style={styles.track} />
            <View style={[styles.fill, { width: `${progress}%` }]} />
            <View style={[styles.knob, { left: `${progress}%` }]} />
          </View>
          <Text style={styles.sliderHint}>Tap or slide to update</Text>
        </View>

        {/* STATUS EXPLANATION (New) */}
        {(() => {
          // Simple check: expected progress vs actual
          // If we assume linear progress from creation to deadline...
          // But we don't have creation date easily available here unless stored.
          // For now, let's use a simpler heuristic:
          // If < 30% progress and < 20% time left -> At Risk
          // But user said "26% complete, 3 months away (April) but shows at risk".
          // This means the current logic (progress >= 70 ? on-track : at-risk) is too harsh.
          // Let's explain WHY it might be at risk or just relax the logic.

          // Updated Logic: 
          // If > 0% progress, it's generally "On Track" unless very close to deadline.
          // Let's calculate percentage of time elapsed. 
          // Ideally we'd need start date. Without it, let's assume if it's not overdue, and has some progress, it's okay.

          const isAtRisk = progress < 50 && (daysLeft !== null && daysLeft < 7);
          const statusText = isAtRisk ? 'At Risk' : 'On Track';

          return (
            <View style={[styles.statusCard, isAtRisk ? styles.statusCardRisk : styles.statusCardTrack]}>
              <Ionicons name={isAtRisk ? "alert-circle" : "checkmark-circle"} size={20} color={isAtRisk ? theme.colors.error : theme.colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>Current Status: {statusText}</Text>
                <Text style={styles.statusExplainer}>
                  {isAtRisk
                    ? "Deadline is approaching and progress is under 50%."
                    : "You have plenty of time to reach your goal. Keep going!"}
                </Text>
              </View>
            </View>
          );
        })()}

        {/* COACH CONTEXT */}
        <View style={styles.coachCard}>
          <View style={styles.coachHeader}>
            <View style={styles.coachAvatar} />
            <Text style={styles.coachName}>Coach</Text>
          </View>
          <Text style={styles.coachMessage}>
            {progress >= 80 ? "You're crushing this! Almost at the finish line. 🚀"
              : progress >= 50 ? "Halfway there! Keep that momentum going. 💪"
                : "Every small step counts. You've got this! 🌱"}
          </Text>
        </View>

      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => handleSave()}
          disabled={isLoading}
        >
          <Text style={styles.btnSecondaryText}>Update Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleMarkComplete}
          disabled={isLoading}
        >
          <Text style={styles.btnPrimaryText}>Mark Complete ✓</Text>
        </TouchableOpacity>
      </View>

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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 48,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  heroEmoji: {
    fontSize: 40,
  },
  goalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deadlineBadgeRisk: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deadlineText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  deadlineTextRisk: {
    color: theme.colors.primary,
  },

  // Progress
  progressSection: {
    marginBottom: 40,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  percentageText: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  sliderContainer: {
    height: 40, // Taller touch area
    justifyContent: 'center',
  },
  track: {
    height: 8,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 4,
    width: '100%',
    position: 'absolute',
  },
  fill: {
    height: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    position: 'absolute',
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 8, // (40 - 24) / 2 = 8
    marginLeft: -12, // center on end of fill
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderHint: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
    opacity: 0.6,
  },

  // Coach
  coachCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  coachAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  coachName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  coachMessage: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },

  // Footer
  footer: {
    padding: 24,
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: theme.colors.success,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: theme.colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnSecondary: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusCardRisk: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusCardTrack: {
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  statusExplainer: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});

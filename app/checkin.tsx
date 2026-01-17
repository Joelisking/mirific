import { theme } from "@/constants/theme";
import { useApp } from '@/contexts/AppContext';
import { analyzeGoalRisk } from '@/lib/ai';
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
  // ----- Actions -----
  const handleSave = async (newStatus?: 'on-track' | 'at-risk' | 'completed') => {
    try {
      let status = newStatus;

      // If manual status not provided, calculate it
      if (!status) {
        if (progress >= 100) {
          status = 'completed';
        } else {
          // AI Analysis
          try {
            // Basic Math Fallback first
            let derivedStatus: 'on-track' | 'at-risk' = 'on-track';
            if (daysLeft !== null && daysLeft < 7 && progress < 50) derivedStatus = 'at-risk';

            // AI Enhancement
            // We only run AI if it's not obviously completed or obviously just started? 
            // Actually, let's run it for key moments or just always (it's cheap).
            const aiResult = await analyzeGoalRisk({
              text: currentGoal.text || '',
              deadline: currentGoal.deadline,
              progress: progress,
              status: derivedStatus
            });

            status = aiResult;
          } catch (e) {
            console.warn('AI analysis failed, using fallback');
            // Fallback to simple math
            if (daysLeft !== null && daysLeft < 7 && progress < 50) status = 'at-risk';
            else status = 'on-track';
          }
        }
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  checkInButton: {
    width: 64,
    height: 64,
    borderRadius: 16, // Squared
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checkInButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    transform: [{ scale: 1.05 }],
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44, // Larger touch target
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  headerTitle: {
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // content: {
  //   flex: 1,
  //   paddingHorizontal: 24,
  // },
  heroSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 48,
  },
  emojiContainer: {
    width: 88,
    height: 88,
    backgroundColor: theme.colors.surface,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...theme.shadows.medium,
    borderWidth: 0,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16, // Squared
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    fontFamily: theme.typography.h3.fontFamily,
  },
  heroEmoji: {
    fontSize: 44,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: theme.typography.h1.fontFamily,
    letterSpacing: -0.5,
  },
  goalTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
    fontFamily: theme.typography.h1.fontFamily,
    letterSpacing: -0.5,
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8, // Squared minimalist
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deadlineBadgeRisk: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.error,
  },
  deadlineText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  deadlineTextRisk: {
    color: theme.colors.error,
  },
  riskBadge: {
    // Kept if needed elsewhere, or remove if not used. 
    // Based on previous edits, I might have intended to replace deadlineBadge BUT the code uses deadlineBadge.
    // So I will keep deadlineBadge as the primary style for that element.
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: theme.colors.surfaceHighlight,
  },

  // Progress
  progressSection: {
    marginBottom: 48,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  percentageText: {
    fontSize: 40,
    fontWeight: '600',
    color: theme.colors.primary,
    fontFamily: theme.typography.h1.fontFamily,
  },
  sliderContainer: {
    height: 48, // Taller touch area
    justifyContent: 'center',
  },
  track: {
    height: 12,
    backgroundColor: theme.colors.surface, // Lighter background
    borderRadius: 6,
    width: '100%',
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  fill: {
    height: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
    position: 'absolute',
  },
  knob: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 8, // (48 - 32) / 2 = 8
    marginLeft: -16,
    ...theme.shadows.medium,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  sliderHint: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
    fontStyle: 'italic',
    opacity: 0.8,
  },

  // Coach
  coachCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    marginTop: 16,
    ...theme.shadows.small,
    borderWidth: 0,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  coachAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  coachMessage: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    lineHeight: 24,
    fontFamily: theme.typography.h3.fontFamily, // Serif for coach voice
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    padding: 24,
    gap: 16,
    paddingBottom: 40,
  },
  btnPrimary: {
    backgroundColor: theme.colors.primary, // Clean primary
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  btnSecondary: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  btnSecondaryText: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  statusCard: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.small,
  },
  statusCardRisk: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  statusCardTrack: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  statusExplainer: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

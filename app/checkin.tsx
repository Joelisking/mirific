import { theme } from "@/constants/theme";
import { useApp } from '@/contexts/AppContext';
import { analyzeGoalRisk } from '@/lib/ai';
import { usePatchApiGoalsByIdMutation } from '@/lib/redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

  // Get celebration message based on progress
  const getCelebrationMessage = () => {
    if (progress >= 100) return { emoji: '🎉', text: 'Goal Complete!' };
    if (progress >= 75) return { emoji: '🚀', text: 'Almost there!' };
    if (progress >= 50) return { emoji: '💪', text: 'Halfway done!' };
    if (progress >= 25) return { emoji: '🌱', text: 'Great start!' };
    return { emoji: '✨', text: 'Keep going!' };
  };

  const celebration = getCelebrationMessage();

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
    const trackX = 24;
    const trackWidth = SCREEN_WIDTH - 48;

    let newProgress = ((pageX - trackX) / trackWidth) * 100;
    newProgress = Math.max(0, Math.min(100, newProgress));
    setProgress(Math.round(newProgress));
  };

  return (
    <LinearGradient
      colors={theme.gradients.warmBeige as [string, string]}
      style={styles.gradientContainer}
    >
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
                <Ionicons name="time-outline" size={14} color={daysLeft <= 2 ? theme.colors.error : theme.colors.textSecondary} />
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
              <View style={styles.progressDisplay}>
                <Text style={styles.percentageText}>{progress}%</Text>
                <View style={styles.celebrationBadge}>
                  <Text style={styles.celebrationEmoji}>{celebration.emoji}</Text>
                  <Text style={styles.celebrationText}>{celebration.text}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sliderContainer} {...panResponder.panHandlers}>
              <View style={styles.track} />
              <LinearGradient
                colors={theme.gradients.sage as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.fill, { width: `${progress}%` }]}
              />

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

              <View style={[styles.knob, { left: `${progress}%` }]}>
                <LinearGradient
                  colors={theme.gradients.sage as [string, string]}
                  style={styles.knobGradient}
                />
              </View>
            </View>
            <Text style={styles.sliderHint}>Tap or slide to update</Text>
          </View>

          {/* STATUS EXPLANATION */}
          {(() => {
            const isAtRisk = progress < 50 && (daysLeft !== null && daysLeft < 7);
            const statusText = isAtRisk ? 'At Risk' : 'On Track';

            return (
              <View style={[styles.statusCard, isAtRisk ? styles.statusCardRisk : styles.statusCardTrack]}>
                <View style={[styles.statusIcon, isAtRisk ? styles.statusIconRisk : styles.statusIconTrack]}>
                  <Ionicons name={isAtRisk ? "alert-circle" : "checkmark-circle"} size={22} color={isAtRisk ? theme.colors.error : theme.colors.success} />
                </View>
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
              <LinearGradient
                colors={theme.gradients.sage as [string, string]}
                style={styles.coachAvatar}
              >
                <Ionicons name="sparkles" size={16} color="#fff" />
              </LinearGradient>
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
            style={styles.btnPrimaryContainer}
            onPress={handleMarkComplete}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={theme.gradients.success as [string, string]}
              style={styles.btnPrimary}
            >
              <Text style={styles.btnPrimaryText}>Mark Complete</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  headerTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 48,
  },
  emojiContainer: {
    width: 88,
    height: 88,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...theme.shadows.medium,
  },
  heroEmoji: {
    fontSize: 44,
  },
  goalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
    fontFamily: theme.typography.h1.fontFamily,
    letterSpacing: -0.5,
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.small,
  },
  deadlineBadgeRisk: {
    backgroundColor: 'rgba(217, 115, 115, 0.12)',
  },
  deadlineText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  deadlineTextRisk: {
    color: theme.colors.error,
  },

  // Progress
  progressSection: {
    marginBottom: 32,
  },
  progressHeader: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  progressDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  percentageText: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: theme.typography.h1.fontFamily,
    letterSpacing: -1,
  },
  celebrationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    marginBottom: 8,
  },
  celebrationEmoji: {
    fontSize: 16,
  },
  celebrationText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  sliderContainer: {
    height: 56,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 12,
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: 6,
    width: '100%',
    position: 'absolute',
  },
  fill: {
    height: 12,
    borderRadius: 6,
    position: 'absolute',
  },
  milestones: {
    position: 'absolute',
    top: 22,
    left: 0,
    right: 0,
    height: 12,
  },
  milestone: {
    position: 'absolute',
    top: 3,
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
  knob: {
    width: 36,
    height: 36,
    borderRadius: 18,
    position: 'absolute',
    top: 10,
    marginLeft: -18,
    ...theme.shadows.medium,
    overflow: 'hidden',
  },
  knobGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  sliderHint: {
    textAlign: 'center',
    color: theme.colors.textTertiary,
    fontSize: 13,
    marginTop: 16,
    fontStyle: 'italic',
  },

  // Status card
  statusCard: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
    marginBottom: 24,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surfaceElevated,
    ...theme.shadows.small,
    borderLeftWidth: 4,
  },
  statusCardRisk: {
    borderLeftColor: theme.colors.error,
  },
  statusCardTrack: {
    borderLeftColor: theme.colors.success,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconRisk: {
    backgroundColor: 'rgba(217, 115, 115, 0.12)',
  },
  statusIconTrack: {
    backgroundColor: 'rgba(107, 155, 122, 0.12)',
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

  // Coach
  coachCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    marginBottom: 24,
    ...theme.shadows.small,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  coachAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    padding: 24,
    gap: 12,
    paddingBottom: 40,
  },
  btnPrimaryContainer: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  btnSecondary: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingVertical: 18,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  btnSecondaryText: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
});

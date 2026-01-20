import CoachMessageCard from '@/components/checkin/CoachMessageCard';
import GoalStatusCard from '@/components/checkin/GoalStatusCard';
import ProgressSlider from '@/components/checkin/ProgressSlider';
import { theme } from "@/constants/theme";
import { useApp } from '@/contexts/AppContext';
import { analyzeGoalRisk } from '@/lib/ai';
import { usePatchApiGoalsByIdMutation } from '@/lib/redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
          <ProgressSlider
            progress={progress}
            onUpdate={setProgress}
            celebration={celebration}
          />

          {/* STATUS EXPLANATION */}
          <GoalStatusCard progress={progress} daysLeft={daysLeft} />

          {/* COACH CONTEXT */}
          <CoachMessageCard progress={progress} />

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

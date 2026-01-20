import AddHabitSheet from '@/components/dashboard/AddHabitSheet';
import GoalListItem from '@/components/progress/GoalListItem';
import PointsBanner from '@/components/progress/PointsBanner';
import { theme } from "@/constants/theme";
import { useApp } from '@/contexts/AppContext';
import { useDeleteApiGoalsByIdMutation, useGetApiGoalsQuery, usePatchApiGoalsByIdMutation } from '@/lib/redux';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TimelineScreen() {
  const router = useRouter();
  const { points, setCurrentGoal, setPoints } = useApp();
  const { data: goals, isLoading } = useGetApiGoalsQuery();
  const [deleteGoal] = useDeleteApiGoalsByIdMutation();
  const [updateGoal] = usePatchApiGoalsByIdMutation();

  const [showEditSheet, setShowEditSheet] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [editInitialValues, setEditInitialValues] = useState<any>(null);



  const handleGoalPress = (goal: any) => {
    if (goal && goal.status !== 'completed') {
      setCurrentGoal(goal);
      router.push('/checkin');
    }
  };

  const handleEditGoal = (goal: any) => {
    setSelectedGoalId(goal.id);
    setEditInitialValues({
      name: goal.text,
      deadline: goal.deadline ? new Date(goal.deadline) : new Date(),
      emoji: '🎯'
    });
    setShowEditSheet(true);
  };

  const handleDeleteGoal = (goal: any) => {
    Alert.alert(
      "Delete Goal",
      "Are you sure you want to delete this goal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (goal.id) {
                await deleteGoal({ id: goal.id }).unwrap();
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete goal");
            }
          }
        }
      ]
    );
  };

  const handleQuickComplete = async (goal: any) => {
    try {
      await updateGoal({
        id: goal.id,
        updateGoalRequest: {
          status: 'completed',
          progress: 100
        }
      }).unwrap();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPoints(points + 100);
    } catch (e) {
      console.error(e);
    }
  };

  const showGoalOptions = (goal: any) => {
    Alert.alert(
      "Manage Goal",
      "What would you like to do?",
      [
        { text: "Edit", onPress: () => handleEditGoal(goal) },
        { text: "Delete", style: "destructive", onPress: () => handleDeleteGoal(goal) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };



  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    )
  }

  const sortedGoals = goals ? [...goals].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return new Date(a.deadline || '').getTime() - new Date(b.deadline || '').getTime();
  }) : [];

  return (
    <LinearGradient
      colors={theme.gradients.warmBeige as [string, string]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Progress</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Points Banner with Gradient */}
          {/* Points Banner with Gradient */}
          <PointsBanner points={points} />

          <Text style={styles.sectionTitle}>Your Goals</Text>

          {!sortedGoals || sortedGoals.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="rocket-outline" size={36} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyText}>No goals yet. Let's change that!</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/coach')}
              >
                <LinearGradient
                  colors={theme.gradients.sage as [string, string]}
                  style={styles.emptyButtonGradient}
                >
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.emptyButtonText}>Create Goal with AI</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.goalsList}>
              {sortedGoals.map((goal) => {
                return (
                  <GoalListItem
                    key={goal.id}
                    goal={goal}
                    onPress={handleGoalPress}
                    onLongPress={showGoalOptions}
                    onEdit={handleEditGoal}
                    onDelete={handleDeleteGoal}
                    onComplete={handleQuickComplete}
                  />
                );
              })}
            </View>
          )}
        </ScrollView>

        <AddHabitSheet
          visible={showEditSheet}
          onClose={() => setShowEditSheet(false)}
          initialType="goal"
          initialId={selectedGoalId || undefined}
          initialValues={editInitialValues}
        />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.h1.fontFamily,
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 24,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  goalsList: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 16,
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
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

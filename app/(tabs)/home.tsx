import ActiveGoals from '@/components/dashboard/activeGoals';
import AddHabitSheet from '@/components/dashboard/AddHabitSheet';
import DashboardWeeklyCalendar from '@/components/dashboard/calendar';
import DailyHabits from '@/components/dashboard/dailyHabits';
import DashboardDailyFocus from '@/components/dashboard/focus';
import DashbordHeader from '@/components/dashboard/header';
import DashboardStatsBar from '@/components/dashboard/statsBar';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [sheetInitialType, setSheetInitialType] = useState<'habit' | 'goal'>('habit');

  const openAddSheet = (type: 'habit' | 'goal') => {
    setSheetInitialType(type);
    setShowAddHabit(true);
  };

  const quickActions = [
    {
      id: 'goal-ai',
      label: 'Set a goal with AI',
      emoji: '🤖',
      action: () => {
        setShowQuickActions(false);
        router.push('/coach');
      },
    },
    {
      id: 'goal-manual',
      label: 'Create goal manually',
      emoji: '🎯',
      action: () => {
        setShowQuickActions(false);
        openAddSheet('goal');
      },
    },
    {
      id: 'habit',
      label: 'Track a habit',
      emoji: '✅',
      action: () => {
        setShowQuickActions(false);
        openAddSheet('habit');
      },
    },
    {
      id: 'checkin',
      label: 'Quick check-in',
      emoji: '💬',
      action: () => {
        setShowQuickActions(false);
        router.push('/coach');
      },
    },
    {
      id: 'milestone',
      label: 'Celebrate a win',
      emoji: '🎉',
      action: () => {
        setShowQuickActions(false);
        router.push('/rewards');
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <DashbordHeader />

      {/* Stats Bar */}
      <DashboardStatsBar />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Week Calendar */}
        <DashboardWeeklyCalendar />

        {/* Today's Focus */}
        <DashboardDailyFocus onAddGoal={() => openAddSheet('goal')} />

        {/* Daily Habits */}
        <DailyHabits setShowAddHabit={(show) => show ? openAddSheet('habit') : setShowAddHabit(false)} />

        {/* Active Goals */}
        <ActiveGoals
          setShowQuickActions={setShowQuickActions}
          onAddGoal={() => openAddSheet('goal')}
        />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowQuickActions(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Quick Actions Modal */}
      <Modal
        visible={showQuickActions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuickActions(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowQuickActions(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons
                  name="sparkles"
                  size={24}
                  color={theme.colors.accent}
                />
                <Text style={styles.modalTitle}>
                  What would you like to do?
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowQuickActions(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.actionsList}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionItem}
                  onPress={action.action}>
                  <Text style={styles.actionEmoji}>
                    {action.emoji}
                  </Text>
                  <Text style={styles.actionLabel}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.coachButton}
              onPress={() => {
                setShowQuickActions(false);
                router.push('/coach');
              }}>
              <Ionicons name="mic" size={20} color="#fff" />
              <Text style={styles.coachButtonText}>
                Talk to your coach
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Habit Sheet */}
      <AddHabitSheet
        visible={showAddHabit}
        onClose={() => setShowAddHabit(false)}
        initialType={sheetInitialType}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 6,
    paddingBottom: 100,
    gap: 12,
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
  addButton: {
    fontSize: 14,
    color: theme.colors.accent,
  },
  weekDays: {
    flexDirection: 'row',
    gap: 8,
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
  },
  dayCardToday: {
    backgroundColor: theme.colors.primary,
  },
  dayName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  dayNameToday: {
    color: theme.colors.textPrimary,
  },
  dayDate: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  dayDateToday: {
    color: theme.colors.textPrimary,
  },
  focusCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  goalsList: {
    gap: 8,
  },
  goalItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceHighlight,
  },
  goalText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalDeadline: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  goalBadge: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalBadgeRisk: {
    backgroundColor: theme.colors.background,
  },
  goalBadgeText: {
    fontSize: 12,
    color: theme.colors.success,
  },
  goalBadgeTextRisk: {
    color: theme.colors.primary,
  },
  habitsList: {
    gap: 12,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  habitEmoji: {
    fontSize: 18,
  },
  habitName: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  habitNameCompleted: {
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  habitTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  habitStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  habitStreakNumber: {
    fontSize: 12,
    color: theme.colors.warning,
  },
  habitStreakEmoji: {
    fontSize: 14,
  },
  activeGoalItem: {
    borderWidth: 2,
    borderColor: theme.colors.surfaceHighlight,
    borderRadius: 16,
    padding: 16,
  },
  progressContainer: {
    marginTop: 12,
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
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 3,
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
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  actionsList: {
    gap: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 16,
    padding: 16,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  coachButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  coachButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});

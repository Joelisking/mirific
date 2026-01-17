import ActiveGoals from '@/components/dashboard/activeGoals';
import AddHabitSheet from '@/components/dashboard/AddHabitSheet';
import DashboardWeeklyCalendar from '@/components/dashboard/calendar';
import DailyHabits from '@/components/dashboard/dailyHabits';
import DashboardDailyFocus from '@/components/dashboard/focus';
import DashbordHeader from '@/components/dashboard/header';
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
  const [sheetInitialValues, setSheetInitialValues] = useState<any>(undefined);
  const [sheetInitialId, setSheetInitialId] = useState<string | undefined>(undefined);

  const openAddSheet = (type: 'habit' | 'goal') => {
    setSheetInitialType(type);
    setSheetInitialValues(undefined);
    setSheetInitialId(undefined);
    setShowAddHabit(true);
  };

  const openEditHabit = (habit: any) => {
    setSheetInitialType('habit');
    setSheetInitialId(habit.id);
    setSheetInitialValues({
      name: habit.name,
      emoji: habit.emoji,
      frequency: habit.frequency,
      reminderTime: habit.reminderTime ? new Date('2024-01-01 ' + habit.reminderTime) : new Date(), // naive parse
    });
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
      {/* <DashboardStatsBar /> */}

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
        <DailyHabits
          setShowAddHabit={(show) => show ? openAddSheet('habit') : setShowAddHabit(false)}
          onEditHabit={openEditHabit}
        />

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
        initialValues={sheetInitialValues}
        initialId={sheetInitialId}
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
    paddingHorizontal: 16, // More breathing room
    paddingBottom: 100,
    gap: 20, // Increased gap for airy feel
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16, // Sharper
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    // No shadow for flat minimalist look
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.h2.fontFamily,
    letterSpacing: -0.5,
  },
  addButton: {
    fontSize: 15,
    color: theme.colors.primary, // Use primary instead of accent
    fontWeight: '500',
  },
  weekDays: {
    flexDirection: 'row',
    gap: 8,
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.02)', // Subtle background
  },
  dayCardToday: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.small,
  },
  dayName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayNameToday: {
    color: 'rgba(255,255,255,0.8)',
  },
  dayDate: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  dayDateToday: {
    color: '#fff',
  },
  focusCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    ...theme.shadows.medium, // Elevated for focus
    borderWidth: 0,
  },
  goalsList: {
    gap: 12,
  },
  goalItem: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  goalText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: 8,
    fontWeight: '500',
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalDeadline: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  goalBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  goalBadgeRisk: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  goalBadgeText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  goalBadgeTextRisk: {
    color: theme.colors.error, // Keep error red for distinct risk
  },
  habitsList: {
    gap: 12,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    ...theme.shadows.small,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14, // Circle checkbox
    borderWidth: 2,
    borderColor: theme.colors.border, // Muted border
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  habitEmoji: {
    fontSize: 20,
  },
  habitName: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  habitNameCompleted: {
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  habitTime: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  habitStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  habitStreakNumber: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  habitStreakEmoji: {
    fontSize: 12,
  },
  activeGoalItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    ...theme.shadows.small,
  },
  progressContainer: {
    marginTop: 16,
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.h3.fontFamily, // Serif nuance
    fontStyle: 'italic',
  },
  emptyButton: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 16, // Squircle
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(70, 90, 79, 0.4)', // Themed overlay
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24, // Sharper
    borderTopRightRadius: 24,
    padding: 32,
    paddingBottom: 48,
    gap: 24,
    // Flat top sheet
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.h2.fontFamily,
  },
  actionsList: {
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    ...theme.shadows.small,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: 17,
    color: theme.colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  coachButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
    ...theme.shadows.medium,
  },
  coachButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

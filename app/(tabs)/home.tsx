import ActiveGoals from '@/components/dashboard/activeGoals';
import AddHabitSheet from '@/components/dashboard/AddHabitSheet';
import DashboardWeeklyCalendar from '@/components/dashboard/calendar';
import DailyHabits from '@/components/dashboard/dailyHabits';
import EditHabitSheet from '@/components/dashboard/EditHabitSheet';
import DashboardDailyFocus from '@/components/dashboard/focus';
import DashbordHeader from '@/components/dashboard/header';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [showEditHabit, setShowEditHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [sheetInitialType, setSheetInitialType] = useState<'habit' | 'goal'>('habit');
  const [sheetInitialId, setSheetInitialId] = useState<string | undefined>(undefined);
  const [sheetInitialValues, setSheetInitialValues] = useState<any>(undefined);

  const openAddSheet = (type: 'habit' | 'goal') => {
    setSheetInitialType(type);
    setSheetInitialValues(undefined);
    setSheetInitialId(undefined);
    setShowAddHabit(true);
  };

  const openEditHabit = (habit: any) => {
    setEditingHabit(habit);
    setShowEditHabit(true);
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
    <LinearGradient
      colors={theme.gradients.warmBeige as [string, string]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <DashbordHeader />

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

        {/* Floating Action Button with gradient */}
        <TouchableOpacity
          style={styles.fabContainer}
          onPress={() => setShowQuickActions(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={theme.gradients.sage as [string, string]}
            style={styles.fab}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Actions Modal */}
        <Modal
          visible={showQuickActions}
          transparent
          animationType="fade"
          onRequestClose={() => setShowQuickActions(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowQuickActions(false)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <View style={styles.modalIcon}>
                    <Ionicons
                      name="sparkles"
                      size={20}
                      color={theme.colors.accent}
                    />
                  </View>
                  <Text style={styles.modalTitle}>
                    What's on your mind?
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowQuickActions(false)}
                  style={styles.closeButton}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.actionsList}>
                {quickActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.actionItem}
                    onPress={action.action}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionEmoji}>
                      {action.emoji}
                    </Text>
                    <Text style={styles.actionLabel}>
                      {action.label}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.coachButton}
                onPress={() => {
                  setShowQuickActions(false);
                  router.push('/coach');
                }}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={theme.gradients.sage as [string, string]}
                  style={styles.coachButtonGradient}
                >
                  <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
                  <Text style={styles.coachButtonText}>
                    Talk to your coach
                  </Text>
                </LinearGradient>
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

        {/* Edit Habit Sheet */}
        <EditHabitSheet
          visible={showEditHabit}
          onClose={() => {
            setShowEditHabit(false);
            setEditingHabit(null);
          }}
          habit={editingHabit}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 24,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 96,
    right: 24,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.large,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surfaceElevated,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    padding: 24,
    paddingBottom: 48,
    gap: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
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
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(196, 149, 106, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.h2.fontFamily,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsList: {
    gap: 10,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    ...theme.shadows.small,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionLabel: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  coachButton: {
    marginTop: 8,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  coachButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
  },
  coachButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },
});

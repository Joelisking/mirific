import ActiveGoals from '@/components/dashboard/activeGoals';
import AddHabitSheet from '@/components/dashboard/AddHabitSheet';
import DashboardWeeklyCalendar from '@/components/dashboard/calendar';
import DailyHabits from '@/components/dashboard/dailyHabits';
import EditHabitSheet from '@/components/dashboard/EditHabitSheet';
import FloatingActionButton from '@/components/dashboard/FloatingActionButton';
import DashboardDailyFocus from '@/components/dashboard/focus';
import DashbordHeader from '@/components/dashboard/header';
import QuickActionsModal from '@/components/dashboard/QuickActionsModal';
import { theme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
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
        {/* Floating Action Button with gradient */}
        <FloatingActionButton onPress={() => setShowQuickActions(true)} />

        {/* Quick Actions Modal */}
        <QuickActionsModal
          visible={showQuickActions}
          onClose={() => setShowQuickActions(false)}
          onOpenAddSheet={openAddSheet}
        />

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
});

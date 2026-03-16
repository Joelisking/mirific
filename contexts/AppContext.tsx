import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Goal, Habit, UserProfile } from '../types';

interface AppContextType {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
  points: number;
  setPoints: (points: number) => void;
  streak: number;
  setStreak: (streak: number) => void;
  currentGoal: Partial<Goal> | null;
  setCurrentGoal: (goal: Partial<Goal> | null) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  toggleHabit: (habitId: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'completedToday' | 'streak'>) => void;
  createCommitment: (goalText: string) => void;
  confirmCommitment: (goal: Goal) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    goals: [],
    struggles: [],
    communicationMode: 'text',
    reminderTone: 'gentle',
  });

  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentGoal, setCurrentGoal] = useState<Partial<Goal> | null>(null);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals(goals.map((g) => (g.id === goalId ? { ...g, ...updates } : g)));
  };

  const toggleHabit = (habitId: string) => {
    setHabits(
      habits.map((h) => {
        if (h.id === habitId) {
          const newCompleted = !h.completedToday;
          return {
            ...h,
            completedToday: newCompleted,
            streak: newCompleted ? h.streak + 1 : h.streak,
          };
        }
        return h;
      })
    );
  };

  const addHabit = (habit: Omit<Habit, 'id' | 'completedToday' | 'streak'>) => {
    setHabits([
      ...habits,
      {
        ...habit,
        id: Date.now().toString(),
        completedToday: false,
        streak: 0,
      },
    ]);
  };

  const createCommitment = (goalText: string) => {
    setCurrentGoal({
      id: Date.now().toString(),
      text: goalText,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      status: 'on-track',
      progress: 0,
    });
  };

  const confirmCommitment = (goal: Goal) => {
    setGoals([...goals, goal]);
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        goals,
        setGoals,
        habits,
        setHabits,
        points,
        setPoints,
        streak,
        setStreak,
        currentGoal,
        setCurrentGoal,
        updateGoal,
        toggleHabit,
        addHabit,
        createCommitment,
        confirmCommitment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

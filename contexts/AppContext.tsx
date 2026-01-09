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

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      text: 'Finish design portfolio for internship applications',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
      status: 'on-track',
      progress: 60,
    },
    {
      id: '2',
      text: 'Study for economics final exam',
      deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      status: 'at-risk',
      progress: 30,
    },
    {
      id: '3',
      text: 'Complete morning workout routine 3x this week',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
      status: 'on-track',
      progress: 75,
    },
  ]);

  const [habits, setHabits] = useState<Habit[]>([
    {
      id: 'h1',
      name: 'Morning journaling',
      emoji: '📝',
      frequency: 'daily',
      completedToday: true,
      streak: 7,
      reminderTime: '8:00 AM',
    },
    {
      id: 'h2',
      name: 'Drink 8 glasses of water',
      emoji: '💧',
      frequency: 'daily',
      completedToday: false,
      streak: 12,
      reminderTime: '10:00 AM',
    },
    {
      id: 'h3',
      name: 'Read for 30 minutes',
      emoji: '📚',
      frequency: 'daily',
      completedToday: true,
      streak: 3,
      reminderTime: '9:00 PM',
    },
  ]);

  const [currentGoal, setCurrentGoal] = useState<Partial<Goal> | null>(null);
  const [points, setPoints] = useState(1250);
  const [streak, setStreak] = useState(7);

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
    setPoints(points + 10);
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
    setPoints(points + 50);
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

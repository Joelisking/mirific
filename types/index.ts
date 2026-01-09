export type Screen =
  | 'onboarding'
  | 'dashboard'
  | 'chat'
  | 'commitment'
  | 'timeline'
  | 'checkin'
  | 'rewards'
  | 'settings';

export interface Goal {
  id: string;
  text: string;
  deadline: string;
  status: 'on-track' | 'at-risk' | 'completed' | 'missed';
  progress: number;
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  frequency: 'daily' | 'weekly';
  completedToday: boolean;
  streak: number;
  reminderTime?: string;
}

export interface UserProfile {
  name: string;
  goals: string[];
  struggles: string[];
  communicationMode: 'text' | 'voice';
  reminderTone: 'gentle' | 'firm' | 'motivational';
}

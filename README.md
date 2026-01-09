# Mirific - AI-Powered Productivity Coach

This is a React Native app built with Expo that helps users achieve their goals through AI-powered coaching, habit tracking, and accountability features.

## Overview

Mirific has been converted from a React web prototype to a fully functional React Native mobile app. The app includes:

- **Onboarding Flow**: Personalized setup to understand user goals and challenges
- **Dashboard**: Overview of daily habits, active goals, and progress tracking
- **AI Coach Chat**: Conversational interface to set and discuss goals
- **Goal Management**: Create commitments, track progress, and check in regularly
- **Rewards System**: Points and achievements for staying consistent
- **Timeline View**: Visual progress tracking for all goals
- **Settings**: Manage preferences and profile information

## Get Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the app**

   ```bash
   npx expo start
   ```

3. **Run on device/emulator**

   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## App Structure

### Screens

- **`/onboarding`** - Welcome flow to capture user preferences
- **`/dashboard`** - Main home screen with habits and goals overview
- **`/chat`** - AI coach conversation interface
- **`/commitment`** - Goal confirmation and deadline setting
- **`/timeline`** - All goals with progress tracking
- **`/checkin`** - Update progress or mark goals complete
- **`/rewards`** - Points, streaks, and achievements
- **`/settings`** - User preferences and profile

### Key Files

- **`contexts/AppContext.tsx`** - Global state management for goals, habits, and user data
- **`types/index.ts`** - TypeScript interfaces for app data models
- **`app/_layout.tsx`** - Root navigation configuration

## Features

### Goal Setting & Tracking
- Natural conversation flow for creating goals
- Deadline management with flexibility to adjust
- Progress tracking with visual indicators
- Status updates (on-track, at-risk, completed)

### Habit Management
- Daily habit tracking with emoji icons
- Streak counting for motivation
- Reminder time settings
- Quick completion toggle

### Gamification
- Points system for completing tasks
- Achievement badges
- Daily streak tracking
- Visual progress indicators

### User Experience
- Clean, mobile-friendly interface
- Smooth navigation between screens
- Encouraging, supportive messaging
- Flexible deadline adjustments

## Technologies Used

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tooling
- **Expo Router** - File-based navigation
- **TypeScript** - Type-safe development
- **React Context API** - State management
- **Ionicons** - Icon library

## Development Notes

This app was converted from a Vite React web app with shadcn/ui components to React Native. The conversion includes:

- Native components replacing web HTML elements
- Touch-optimized interactions
- Mobile-friendly layouts and navigation
- React Native StyleSheet for styling
- Context-based state management instead of prop drilling

## Next Steps

To enhance the app further, consider:

1. Backend integration for data persistence
2. Push notifications for reminders
3. Calendar integration
4. Social features (share progress, compete with friends)
5. Voice input for goal setting
6. Advanced analytics and insights

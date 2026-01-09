// EXAMPLE: Login Screen Component
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { usePostApiAuthLoginMutation } from './api/generated';
import { useAppDispatch } from './hooks';
import { authActions } from './slices/authSlice';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [login, { isLoading, error }] = usePostApiAuthLoginMutation();
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    try {
      const result = await login({
        loginRequest: {
          email,
          password,
        },
      }).unwrap();

      // Save auth state to Redux
      dispatch(authActions.loginSuccess({
        user: result.user!,
        token: result.token!,
      }));

      // Navigate to home screen
      // router.push('/home');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error && <Text style={{ color: 'red' }}>Login failed</Text>}

      <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <Text>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ============================================================

// EXAMPLE: Habits List Component
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react';
import {
  useGetApiHabitsQuery,
  usePatchApiHabitsByIdToggleMutation,
  useDeleteApiHabitsByIdMutation,
} from './api/generated';
import type { Habit } from './api/generated';

export function HabitsList() {
  // Automatically fetches and caches habits
  const { data: habits, isLoading, error, refetch } = useGetApiHabitsQuery();
  const [toggleHabit] = usePatchApiHabitsByIdToggleMutation();
  const [deleteHabit] = useDeleteApiHabitsByIdMutation();

  const handleToggle = async (habitId: string) => {
    try {
      await toggleHabit({ id: habitId }).unwrap();
      // The habits list will automatically refresh due to cache invalidation
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const handleDelete = async (habitId: string) => {
    try {
      await deleteHabit({ id: habitId }).unwrap();
      // The habits list will automatically refresh
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Error loading habits</Text>;
  }

  return (
    <FlatList
      data={habits}
      keyExtractor={(item) => item.id!}
      onRefresh={refetch}
      refreshing={isLoading}
      renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
          <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>
              {item.completedToday ? '✓ Completed' : 'Not done yet'}
            </Text>
            <Text style={{ fontSize: 12, color: '#999' }}>
              🔥 {item.streak} day streak
            </Text>
          </View>

          <TouchableOpacity onPress={() => handleToggle(item.id!)}>
            <Text>{item.completedToday ? '✓' : '○'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleDelete(item.id!)}>
            <Text>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

// ============================================================

// EXAMPLE: Create Habit Component
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { usePostApiHabitsMutation } from './api/generated';

export function CreateHabitForm() {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  const [createHabit, { isLoading }] = usePostApiHabitsMutation();

  const handleCreate = async () => {
    try {
      await createHabit({
        createHabitRequest: {
          name,
          emoji,
          frequency: 'daily',
          reminderTime: reminderTime || null,
        },
      }).unwrap();

      // Clear form
      setName('');
      setEmoji('');
      setReminderTime('');

      // The habits list will automatically refresh
    } catch (err) {
      console.error('Create failed:', err);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Habit name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Emoji"
        value={emoji}
        onChangeText={setEmoji}
      />

      <TextInput
        placeholder="Reminder time (e.g., 08:00)"
        value={reminderTime}
        onChangeText={setReminderTime}
      />

      <TouchableOpacity onPress={handleCreate} disabled={isLoading}>
        <Text>{isLoading ? 'Creating...' : 'Create Habit'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================

// EXAMPLE: User Profile Component
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useGetApiUsersProfileQuery } from './api/generated';
import { useAppSelector } from './hooks';

export function UserProfile() {
  // Get cached user from Redux
  const cachedUser = useAppSelector((state) => state.auth.user);

  // Fetch fresh data from API
  const { data: user, isLoading } = useGetApiUsersProfileQuery();

  if (isLoading && !cachedUser) {
    return <ActivityIndicator />;
  }

  const displayUser = user || cachedUser;

  return (
    <View>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        {displayUser?.name}
      </Text>
      <Text>{displayUser?.email}</Text>

      <View style={{ marginTop: 20 }}>
        <Text>🏆 Points: {displayUser?.points}</Text>
        <Text>🔥 Streak: {displayUser?.streak} days</Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: '600' }}>Goals:</Text>
        {displayUser?.goals?.map((goal, index) => (
          <Text key={index}>• {goal}</Text>
        ))}
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: '600' }}>Struggles:</Text>
        {displayUser?.struggles?.map((struggle, index) => (
          <Text key={index}>• {struggle}</Text>
        ))}
      </View>
    </View>
  );
}

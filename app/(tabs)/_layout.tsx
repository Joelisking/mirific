import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { theme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: theme.colors.surfaceElevated,
            borderTopWidth: 0,
            elevation: 0,
            height: 85,
            paddingBottom: 20,
          },
          default: {
            backgroundColor: theme.colors.surfaceElevated,
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
            paddingBottom: 10,
          },
        }),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'home' : 'home-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
            title: 'Coach',
            tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'chatbubble' : 'chatbubble-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
            title: 'Progress',
            tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'bar-chart' : 'bar-chart-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => <Ionicons size={24} name={focused ? 'settings' : 'settings-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
            href: null,
        }}
      />
    </Tabs>
  );
}

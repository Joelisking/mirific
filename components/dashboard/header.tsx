import { theme } from '@/constants/theme';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

function DashbordHeader() {
  const router = useRouter();
  const { user } = useUser();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get name from Clerk user
  const displayName = user?.firstName || user?.fullName?.split(' ')[0] || 'there';

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.subtitle}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
        </Text>
        <Text style={styles.greeting}>
          {getGreeting()}, {displayName}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => router.push('/settings')}
        style={styles.iconButton}>
        <Ionicons
          name="settings-outline"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

export default DashbordHeader;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl, // More top breathing room
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  greeting: {
    fontSize: 26, // Big Title
    fontWeight: '800',
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.h1.fontFamily,
    letterSpacing: -1,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  iconButton: {
    position: 'absolute',
    right: 24,
    top: 32, // Align with top
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 50, // Perfect circle
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

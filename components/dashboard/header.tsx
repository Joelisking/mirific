import { theme } from '@/constants/theme';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

  const getMotivationalMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Start your day with intention';
    if (hour < 18) return 'Keep the momentum going';
    return 'Reflect on your wins today';
  };

  // Get name from Clerk user
  const displayName = user?.firstName || user?.fullName?.split(' ')[0] || 'there';

  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.surface]}
      style={styles.headerGradient}
    >
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <Text style={styles.greeting}>
            {getGreeting()}, {displayName}
          </Text>
          <Text style={styles.motivational}>
            {getMotivationalMessage()}
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
    </LinearGradient>
  );
}

export default DashbordHeader;

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.h1.fontFamily,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  motivational: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  iconButton: {
    padding: 10,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
});

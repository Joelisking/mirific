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
        <Text style={styles.greeting}>
          {getGreeting()}, {displayName}
        </Text>
        <Text style={styles.subtitle}>
          Let&apos;s make today count ✨
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => router.push('/settings')}
        style={styles.iconButton}>
        <Ionicons
          name="settings-outline"
          size={24}
          color={theme.colors.textPrimary}
        />
      </TouchableOpacity>
    </View>
  );
}

export default DashbordHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    // backgroundColor: theme.colors.surface,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  iconButton: {
    padding: 8,
  },
});

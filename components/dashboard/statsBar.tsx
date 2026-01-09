import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

function DashboardStatsBar() {
  const router = useRouter();
  const { points, streak } = useApp();

  return (
    <View style={styles.statsBar}>
      <TouchableOpacity
        style={styles.pointsCard}
        onPress={() => router.push('/rewards')}>
        <View style={styles.statsContent}>
          <Ionicons name="trophy" size={20} color="#fff" />
          <Text style={styles.statsText}>{points} pts</Text>
        </View>
        <Ionicons name="trending-up" size={16} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.streakCard}
        onPress={() => router.push('/rewards')}>
        <View style={styles.statsContent}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>{streak} day streak</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default DashboardStatsBar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  statsBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  pointsCard: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  streakCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: 12,
  },
  streakEmoji: {
    fontSize: 18,
  },
  streakText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});

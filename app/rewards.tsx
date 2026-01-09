import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { theme } from "@/constants/theme";

export default function RewardsScreen() {
  const router = useRouter();
  const { points, streak } = useApp();

  const achievements = [
    { id: 1, title: 'First Goal', emoji: '🎯', earned: true },
    { id: 2, title: '7 Day Streak', emoji: '🔥', earned: streak >= 7 },
    { id: 3, title: '1000 Points', emoji: '💎', earned: points >= 1000 },
    { id: 4, title: 'Early Bird', emoji: '🌅', earned: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={32} color={theme.colors.accent} />
            <Text style={styles.statValue}>{points}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  achievement.earned && styles.achievementCardEarned,
                ]}
              >
                <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                <Text style={[
                  styles.achievementTitle,
                  achievement.earned && styles.achievementTitleEarned,
                ]}>
                  {achievement.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keep it up!</Text>
          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementText}>
              You're doing great! Every small step counts toward your bigger goals.
              Keep showing up, and the results will follow. 🌟
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  streakEmoji: {
    fontSize: 32,
  },
  divider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  achievementCard: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: theme.colors.border,
    opacity: 0.5,
  },
  achievementCardEarned: {
    opacity: 1,
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.surfaceElevated,
  },
  achievementEmoji: {
    fontSize: 40,
  },
  achievementTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  achievementTitleEarned: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  encouragementCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 20,
  },
  encouragementText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    lineHeight: 24,
    textAlign: 'center',
  },
});

import { theme } from "@/constants/theme";
import { useApp } from '@/contexts/AppContext';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { userProfile, points } = useApp();
  const { signOut } = useAuth();
  const { user } = useUser();

  // Use Clerk user data as fallback
  const displayName = userProfile.name || user?.fullName || user?.firstName || 'User';
  const displayEmail = user?.primaryEmailAddress?.emailAddress || '';

  return (
    <LinearGradient
      colors={theme.gradients.warmBeige as [string, string]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={theme.gradients.sage as [string, string]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{displayName}</Text>
              {displayEmail && (
                <Text style={styles.profileEmail}>{displayEmail}</Text>
              )}
            </View>
            <View style={styles.pointsBadge}>
              <Ionicons name="star" size={14} color={theme.colors.warning} />
              <Text style={styles.pointsText}>{points} pts</Text>
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Get reminders for your goals
                  </Text>
                </View>
                <Switch
                  value={true}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                  thumbColor={theme.colors.primary}
                />
              </View>

              <View style={styles.separator} />

              <View style={styles.settingRow}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="chatbubble-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Daily Check-ins</Text>
                  <Text style={styles.settingDescription}>
                    Receive daily progress prompts
                  </Text>
                </View>
                <Switch
                  value={true}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                  thumbColor={theme.colors.primary}
                />
              </View>

              <View style={styles.separator} />

              <View style={styles.settingRow}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="sparkles-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>AI Coach Tips</Text>
                  <Text style={styles.settingDescription}>
                    Get personalized suggestions
                  </Text>
                </View>
                <Switch
                  value={true}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                  thumbColor={theme.colors.primary}
                />
              </View>
            </View>
          </View>

          {/* Focus Areas Section */}
          {userProfile.goals && userProfile.goals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Focus Areas</Text>
              <View style={styles.card}>
                <View style={styles.tagsContainer}>
                  {userProfile.goals.map((goal, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{goal}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* App Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name="trophy-outline" size={20} color={theme.colors.accent} />
                </View>
                <Text style={styles.menuLabel}>Rewards</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
              </TouchableOpacity>

              <View style={styles.separator} />

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name="help-circle-outline" size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.menuLabel}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
              </TouchableOpacity>

              <View style={styles.separator} />

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.menuLabel}>Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
              </TouchableOpacity>

              <View style={styles.separator} />

              <View style={styles.menuItem}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.menuLabel}>Version</Text>
                <Text style={styles.menuValue}>1.0.0</Text>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={async () => {
                await signOut();
                router.replace('/onboarding');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Made with care for your growth</Text>
            <View style={styles.footerLogo}>
              <LinearGradient
                colors={theme.gradients.sage as [string, string]}
                style={styles.footerLogoGradient}
              >
                <Ionicons name="leaf" size={16} color="#fff" />
              </LinearGradient>
              <Text style={styles.footerBrand}>Mirific</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.h1.fontFamily,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    marginBottom: 24,
    ...theme.shadows.medium,
  },
  avatarContainer: {
    ...theme.shadows.small,
    borderRadius: 28,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(232, 167, 86, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    ...theme.shadows.small,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingInfo: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 8,
  },
  tag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
  },
  tagText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  menuValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 115, 115, 0.3)',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 16,
    gap: 12,
  },
  footerText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerLogoGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});

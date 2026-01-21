import MenuOption from '@/components/settings/MenuOption';
import ProfileCard from '@/components/settings/ProfileCard';
import ToggleOption from '@/components/settings/ToggleOption';
import { theme } from "@/constants/theme";
import { useApp } from '@/contexts/AppContext';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
          {/* Profile Card */}
          <ProfileCard
            displayName={displayName}
            displayEmail={displayEmail}
            points={points}
          />

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.card}>
              <ToggleOption
                label="Push Notifications"
                description="Get reminders for your goals"
                value={true}
                icon="notifications-outline"
              />

              <View style={styles.separator} />

              <ToggleOption
                label="Daily Check-ins"
                description="Receive daily progress prompts"
                value={true}
                icon="chatbubble-outline"
              />

              <View style={styles.separator} />

              <ToggleOption
                label="AI Coach Tips"
                description="Get personalized suggestions"
                value={true}
                icon="sparkles-outline"
              />
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
              <MenuOption
                label="Rewards"
                icon="trophy-outline"
                iconColor={theme.colors.accent}
                onPress={() => { }}
              />

              <View style={styles.separator} />

              <MenuOption
                label="Help & Support"
                icon="help-circle-outline"
                onPress={() => { }}
              />

              <View style={styles.separator} />

              <MenuOption
                label="Privacy Policy"
                icon="document-text-outline"
                onPress={() => { }}
              />

              <View style={styles.separator} />

              <MenuOption
                label="Version"
                icon="information-circle-outline"
                value="1.0.0"
              />
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={async () => {
                await signOut();
                router.replace('/landing');
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

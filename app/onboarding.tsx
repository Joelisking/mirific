import ClerkAccountStep from '@/components/onboarding/ClerkAccountStep';
import GoalsStep from '@/components/onboarding/GoalsStep';
import NameStep from '@/components/onboarding/NameStep';
import PreferencesStep from '@/components/onboarding/PreferencesStep';
import ProgressIndicator from '@/components/onboarding/ProgressIndicator';
import StrugglesStep from '@/components/onboarding/StrugglesStep';
import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useLazyGetApiClerkProfileQuery, usePostApiClerkSyncMutation } from '@/lib/redux';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOTAL_STEPS = 5;

export default function OnboardingScreen() {
  const router = useRouter();
  const { setUserProfile } = useApp();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const [syncUser, { isLoading: isSyncing }] = usePostApiClerkSyncMutation();
  const [checkProfile] = useLazyGetApiClerkProfileQuery();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [communicationMode, setCommunicationMode] = useState<'text' | 'voice'>('text');
  const [reminderTone, setReminderTone] = useState<'gentle' | 'firm' | 'motivational'>('gentle');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedStruggles, setSelectedStruggles] = useState<string[]>([]);

  // When user signs in with Clerk, populate name from their profile
  useEffect(() => {
    if (isSignedIn && user) {
      const fullName = user.fullName || user.firstName || '';
      if (fullName && !name) {
        setName(fullName);
      }
      // Skip account step if already signed in
      if (step === 0) {
        setStep(1);
      }
    }
  }, [isSignedIn, user]);

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleStruggleToggle = (struggle: string) => {
    setSelectedStruggles((prev) =>
      prev.includes(struggle)
        ? prev.filter((s) => s !== struggle)
        : [...prev, struggle]
    );
  };

  const handleAuthSuccess = async () => {
    // Check if user already has a backend profile
    try {
      const profile = await checkProfile().unwrap();
      if (profile.user) {
        // User already exists - sync to AppContext and go home
        setUserProfile({
          name: profile.user.name || '',
          goals: profile.user.goals || [],
          struggles: profile.user.struggles || [],
          communicationMode: profile.user.communicationMode || 'text',
          reminderTone: profile.user.reminderTone || 'gentle',
        });
        router.replace('/home');
        return;
      }
    } catch (error: any) {
      // 404 means user doesn't exist yet - continue with onboarding
      if (error?.status !== 404) {
        console.error('Profile check error:', error);
      }
    }
    // New user - proceed to next step
    setStep(1);
  };

  const handleComplete = async () => {
    try {
      await syncUser({
        body: {
          name,
          goals: selectedGoals,
          struggles: selectedStruggles,
          communicationMode,
          reminderTone,
        },
      }).unwrap();

      // Save user profile to AppContext
      setUserProfile({
        name,
        goals: selectedGoals,
        struggles: selectedStruggles,
        communicationMode,
        reminderTone,
      });

      router.replace('/home');
    } catch (error) {
      console.error('Failed to sync user:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    }
  };

  const canContinue = () => {
    if (step === 0) {
      // Account step - need to be signed in
      return isSignedIn;
    }
    if (step === 1) return name.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <ClerkAccountStep onAuthSuccess={handleAuthSuccess} />;
      case 1:
        return <NameStep name={name} setName={setName} />;
      case 2:
        return (
          <PreferencesStep
            communicationMode={communicationMode}
            setCommunicationMode={setCommunicationMode}
            reminderTone={reminderTone}
            setReminderTone={setReminderTone}
          />
        );
      case 3:
        return (
          <GoalsStep
            selectedGoals={selectedGoals}
            onToggleGoal={handleGoalToggle}
          />
        );
      case 4:
        return (
          <StrugglesStep
            selectedStruggles={selectedStruggles}
            onToggleStruggle={handleStruggleToggle}
          />
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient
      colors={theme.gradients.warmBeige as [string, string]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <ProgressIndicator
          currentStep={step}
          totalSteps={TOTAL_STEPS}
          onBack={() => setStep(step - 1)}
          canGoBack={step > 0}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>

        {/* Hide continue button on Auth step (step 0) because Clerk handles it */}
        {step !== 0 && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              onPress={handleNext}
              disabled={!canContinue() || isSyncing}
              style={[
                styles.buttonContainer,
                !canContinue() && styles.buttonDisabled,
              ]}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={canContinue() ? theme.gradients.sage as [string, string] : [theme.colors.border, theme.colors.border]}
                style={styles.button}
              >
                <Text style={[styles.buttonText, !canContinue() && styles.buttonTextDisabled]}>
                  {step === TOTAL_STEPS - 1
                    ? isSyncing
                      ? 'Creating Account...'
                      : "Let's get started"
                    : 'Continue'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={canContinue() ? '#fff' : theme.colors.textTertiary} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  bottomContainer: {
    padding: theme.spacing.lg,
  },
  buttonContainer: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: theme.colors.textTertiary,
  },
});

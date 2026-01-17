import ClerkAccountStep from '@/components/onboarding/ClerkAccountStep';
import GoalsStep from '@/components/onboarding/GoalsStep';
import NameStep from '@/components/onboarding/NameStep';
import PreferencesStep from '@/components/onboarding/PreferencesStep';
import ProgressIndicator from '@/components/onboarding/ProgressIndicator';
import StrugglesStep from '@/components/onboarding/StrugglesStep';
import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { usePostApiClerkSyncMutation } from '@/lib/redux';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
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

  const handleAuthSuccess = () => {
    // User authenticated with Clerk, move to next step
    setStep(1); // Skip to name step
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
    <SafeAreaView style={styles.container}>
      <View style={styles.gradient}>
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

        {/* Hide continue button on Auth step (step 0) because Clerk handles it, 
            UNLESS user is already signed in (which might happen if they go back) */}
        {step !== 0 && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              onPress={handleNext}
              disabled={!canContinue()}
              style={[
                styles.button,
                !canContinue() && styles.buttonDisabled,
              ]}>
              <View style={styles.buttonGradient}>
                <Text style={styles.buttonText}>
                  {step === TOTAL_STEPS - 1
                    ? isSyncing
                      ? 'Creating Account...'
                      : "Let's get started"
                    : 'Continue'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  gradient: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  bottomContainer: {
    padding: theme.spacing.lg,
  },
  button: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

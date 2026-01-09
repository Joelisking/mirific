import { theme } from '@/constants/theme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PreferencesStepProps {
  communicationMode: 'text' | 'voice';
  setCommunicationMode: (mode: 'text' | 'voice') => void;
  reminderTone: 'gentle' | 'firm' | 'motivational';
  setReminderTone: (tone: 'gentle' | 'firm' | 'motivational') => void;
}

export default function PreferencesStep({
  communicationMode,
  setCommunicationMode,
  reminderTone,
  setReminderTone,
}: PreferencesStepProps) {
  const communicationOptions = [
    {
      value: 'text' as const,
      label: 'Text Chat',
      description: 'Type messages back and forth',
      emoji: '💬',
    },
    {
      value: 'voice' as const,
      label: 'Voice',
      description: 'Talk with your AI coach',
      emoji: '🎙️',
    },
  ];

  const toneOptions = [
    {
      value: 'gentle' as const,
      label: 'Gentle',
      description: 'Soft, supportive approach',
      emoji: '🤗',
    },
    {
      value: 'firm' as const,
      label: 'Firm',
      description: 'Direct, no-nonsense style',
      emoji: '💪',
    },
    {
      value: 'motivational' as const,
      label: 'Motivational',
      description: 'Energetic, encouraging',
      emoji: '🔥',
    },
  ];

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>How should we coach you?</Text>
      <Text style={styles.stepSubtitle}>
        Customize how your AI coach interacts with you
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Communication Style</Text>
        <View style={styles.optionsContainer}>
          {communicationOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setCommunicationMode(option.value)}
              style={[
                styles.preferenceCard,
                communicationMode === option.value &&
                  styles.preferenceCardSelected,
              ]}>
              <Text style={styles.preferenceEmoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.preferenceLabel,
                  communicationMode === option.value &&
                    styles.preferenceLabelSelected,
                ]}>
                {option.label}
              </Text>
              <Text style={styles.preferenceDescription}>
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Reminder Tone</Text>
        <View style={styles.optionsContainer}>
          {toneOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setReminderTone(option.value)}
              style={[
                styles.toneCard,
                reminderTone === option.value && styles.toneCardSelected,
              ]}>
              <Text style={styles.toneEmoji}>{option.emoji}</Text>
              <View style={styles.toneContent}>
                <Text
                  style={[
                    styles.toneLabel,
                    reminderTone === option.value && styles.toneLabelSelected,
                  ]}>
                  {option.label}
                </Text>
                <Text style={styles.toneDescription}>
                  {option.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  preferenceCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    alignItems: 'center',
  },
  preferenceCardSelected: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.primary,
  },
  preferenceEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  preferenceLabelSelected: {
    color: theme.colors.textPrimary,
  },
  preferenceDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  toneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    gap: 16,
  },
  toneCardSelected: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.primary,
  },
  toneEmoji: {
    fontSize: 28,
  },
  toneContent: {
    flex: 1,
  },
  toneLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  toneLabelSelected: {
    color: theme.colors.textPrimary,
  },
  toneDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
});

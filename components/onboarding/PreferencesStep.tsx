import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
      <LinearGradient
        colors={theme.gradients.sage as [string, string]}
        style={styles.iconContainer}
      >
        <Ionicons name="settings-outline" size={32} color="#fff" />
      </LinearGradient>
      <Text style={styles.stepTitle}>How should we coach you?</Text>
      <Text style={styles.stepSubtitle}>
        Customize how your AI coach interacts with you
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Communication Style</Text>
        <View style={styles.optionsRow}>
          {communicationOptions.map((option) => {
            const isSelected = communicationMode === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setCommunicationMode(option.value)}
                style={[
                  styles.preferenceCard,
                  isSelected && styles.preferenceCardSelected,
                ]}
                activeOpacity={0.8}
              >
                <View style={[styles.emojiContainer, isSelected && styles.emojiContainerSelected]}>
                  <Text style={styles.preferenceEmoji}>{option.emoji}</Text>
                </View>
                <Text
                  style={[
                    styles.preferenceLabel,
                    isSelected && styles.preferenceLabelSelected,
                  ]}>
                  {option.label}
                </Text>
                <Text style={styles.preferenceDescription}>
                  {option.description}
                </Text>
                {isSelected && (
                  <LinearGradient
                    colors={theme.gradients.sage as [string, string]}
                    style={styles.checkMark}
                  >
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </LinearGradient>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Reminder Tone</Text>
        <View style={styles.optionsContainer}>
          {toneOptions.map((option) => {
            const isSelected = reminderTone === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setReminderTone(option.value)}
                style={[
                  styles.toneCard,
                  isSelected && styles.toneCardSelected,
                ]}
                activeOpacity={0.8}
              >
                <View style={[styles.toneEmojiContainer, isSelected && styles.toneEmojiContainerSelected]}>
                  <Text style={styles.toneEmoji}>{option.emoji}</Text>
                </View>
                <View style={styles.toneContent}>
                  <Text
                    style={[
                      styles.toneLabel,
                      isSelected && styles.toneLabelSelected,
                    ]}>
                    {option.label}
                  </Text>
                  <Text style={styles.toneDescription}>
                    {option.description}
                  </Text>
                </View>
                {isSelected && (
                  <LinearGradient
                    colors={theme.gradients.sage as [string, string]}
                    style={styles.checkMarkTone}
                  >
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </LinearGradient>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...theme.shadows.medium,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    fontFamily: theme.typography.h1.fontFamily,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 32,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionsContainer: {
    gap: 12,
  },
  preferenceCard: {
    flex: 1,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.small,
  },
  preferenceCardSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emojiContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  preferenceEmoji: {
    fontSize: 24,
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
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
  checkMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 12,
    right: 12,
  },
  toneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    padding: 18,
    gap: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.small,
  },
  toneCardSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  toneEmojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toneEmojiContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  toneEmoji: {
    fontSize: 24,
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
    color: theme.colors.textTertiary,
  },
  checkMarkTone: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { theme } from '@/constants/theme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StrugglesStepProps {
  selectedStruggles: string[];
  onToggleStruggle: (struggle: string) => void;
}

const struggleOptions = [
  'Procrastination',
  'Staying consistent',
  'Managing time',
  'Setting realistic goals',
  'Getting started',
  'Saying no to distractions',
];

export default function StrugglesStep({
  selectedStruggles,
  onToggleStruggle,
}: StrugglesStepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What holds you back?</Text>
      <Text style={styles.stepSubtitle}>
        No judgment – we all have our struggles
      </Text>
      <View style={styles.optionsGrid}>
        {struggleOptions.map((struggle) => (
          <TouchableOpacity
            key={struggle}
            onPress={() => onToggleStruggle(struggle)}
            style={[
              styles.optionCard,
              selectedStruggles.includes(struggle) &&
                styles.optionCardSelected,
            ]}>
            <Text
              style={[
                styles.optionText,
                selectedStruggles.includes(struggle) &&
                  styles.optionTextSelected,
              ]}>
              {struggle}
            </Text>
          </TouchableOpacity>
        ))}
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
    marginBottom: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
  },
  optionCardSelected: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  optionTextSelected: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
});

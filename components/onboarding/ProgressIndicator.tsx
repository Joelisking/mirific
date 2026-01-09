import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  canGoBack: boolean;
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  onBack,
  canGoBack,
}: ProgressIndicatorProps) {
  return (
    <View style={styles.topSection}>
      {canGoBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
      )}
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressBar,
              i <= currentStep && styles.progressBarActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignSelf: 'flex-start',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: theme.colors.primary,
  },
});

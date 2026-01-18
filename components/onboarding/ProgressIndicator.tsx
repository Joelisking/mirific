import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
      )}
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View key={i} style={styles.progressBarContainer}>
            {i <= currentStep ? (
              <LinearGradient
                colors={theme.gradients.sage as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressBarActive}
              />
            ) : (
              <View style={styles.progressBar} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    ...theme.shadows.small,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: 4,
  },
  progressBarActive: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
});

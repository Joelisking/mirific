import { theme } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface GoalStatusCardProps {
    progress: number;
    daysLeft: number | null;
}

const GoalStatusCard: React.FC<GoalStatusCardProps> = ({ progress, daysLeft }) => {
    const isAtRisk = progress < 50 && (daysLeft !== null && daysLeft < 7);
    const statusText = isAtRisk ? 'At Risk' : 'On Track';

    return (
        <View style={[styles.statusCard, isAtRisk ? styles.statusCardRisk : styles.statusCardTrack]}>
            <View style={[styles.statusIcon, isAtRisk ? styles.statusIconRisk : styles.statusIconTrack]}>
                <Ionicons name={isAtRisk ? "alert-circle" : "checkmark-circle"} size={22} color={isAtRisk ? theme.colors.error : theme.colors.success} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>Current Status: {statusText}</Text>
                <Text style={styles.statusExplainer}>
                    {isAtRisk
                        ? "Deadline is approaching and progress is under 50%."
                        : "You have plenty of time to reach your goal. Keep going!"}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    statusCard: {
        flexDirection: 'row',
        gap: 16,
        padding: 20,
        marginBottom: 24,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.colors.surfaceElevated,
        ...theme.shadows.small,
        borderLeftWidth: 4,
    },
    statusCardRisk: {
        borderLeftColor: theme.colors.error,
    },
    statusCardTrack: {
        borderLeftColor: theme.colors.success,
    },
    statusIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusIconRisk: {
        backgroundColor: 'rgba(217, 115, 115, 0.12)',
    },
    statusIconTrack: {
        backgroundColor: 'rgba(107, 155, 122, 0.12)',
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    statusExplainer: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
});

export default GoalStatusCard;

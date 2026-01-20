import { theme } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CoachMessageCardProps {
    progress: number;
}

const CoachMessageCard: React.FC<CoachMessageCardProps> = ({ progress }) => {
    return (
        <View style={styles.coachCard}>
            <View style={styles.coachHeader}>
                <LinearGradient
                    colors={theme.gradients.sage as [string, string]}
                    style={styles.coachAvatar}
                >
                    <Ionicons name="sparkles" size={16} color="#fff" />
                </LinearGradient>
                <Text style={styles.coachName}>Coach</Text>
            </View>
            <Text style={styles.coachMessage}>
                {progress >= 80 ? "You're crushing this! Almost at the finish line. 🚀"
                    : progress >= 50 ? "Halfway there! Keep that momentum going. 💪"
                        : "Every small step counts. You've got this! 🌱"}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    coachCard: {
        backgroundColor: theme.colors.surfaceElevated,
        borderRadius: theme.borderRadius.xl,
        padding: 24,
        marginBottom: 24,
        ...theme.shadows.small,
    },
    coachHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    coachAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    coachName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    coachMessage: {
        fontSize: 16,
        color: theme.colors.textPrimary,
        lineHeight: 24,
        fontStyle: 'italic',
    },
});

export default CoachMessageCard;

import { theme } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProfileCardProps {
    displayName: string;
    displayEmail: string;
    points: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ displayName, displayEmail, points }) => {
    return (
        <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
                <LinearGradient
                    colors={theme.gradients.sage as [string, string]}
                    style={styles.avatar}
                >
                    <Text style={styles.avatarText}>
                        {displayName.charAt(0).toUpperCase()}
                    </Text>
                </LinearGradient>
            </View>
            <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{displayName}</Text>
                {displayEmail ? (
                    <Text style={styles.profileEmail}>{displayEmail}</Text>
                ) : null}
            </View>
            <View style={styles.pointsBadge}>
                <Ionicons name="star" size={14} color={theme.colors.warning} />
                <Text style={styles.pointsText}>{points} pts</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceElevated,
        borderRadius: theme.borderRadius.xl,
        padding: 20,
        marginBottom: 24,
        ...theme.shadows.medium,
    },
    avatarContainer: {
        ...theme.shadows.small,
        borderRadius: 28,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    profileEmail: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(232, 167, 86, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
    },
    pointsText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.warning,
    },
});

export default ProfileCard;

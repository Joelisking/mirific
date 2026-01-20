import { theme } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PointsBannerProps {
    points: number;
}

const PointsBanner: React.FC<PointsBannerProps> = ({ points }) => {
    const router = useRouter();

    return (
        <TouchableOpacity
            style={styles.pointsBannerContainer}
            onPress={() => router.push('/rewards')}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={theme.gradients.sunsetAccent as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pointsBanner}
            >
                <View style={styles.pointsContent}>
                    <View style={styles.trophyIcon}>
                        <Ionicons name="trophy" size={24} color="#FFD700" />
                    </View>
                    <View>
                        <Text style={styles.pointsLabel}>Total Points</Text>
                        <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
                    </View>
                </View>
                <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>Gold Tier</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    pointsBannerContainer: {
        borderRadius: theme.borderRadius.xxl,
        overflow: 'hidden',
        ...theme.shadows.medium,
    },
    pointsBanner: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pointsContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    trophyIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pointsLabel: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 2,
        fontWeight: '500',
    },
    pointsValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
    },
    rankBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.full,
    },
    rankText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },
});

export default PointsBanner;

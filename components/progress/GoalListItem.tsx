import { theme } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { LeftAction, RightAction } from './GoalSwipeActions';

interface GoalListItemProps {
    goal: any;
    onPress: (goal: any) => void;
    onLongPress: (goal: any) => void;
    onEdit: (goal: any) => void;
    onDelete: (goal: any) => void;
    onComplete: (goal: any) => void;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'on-track':
            return { bg: 'rgba(107, 155, 122, 0.12)', text: theme.colors.onTrack, border: theme.colors.onTrack, icon: 'checkmark-circle' };
        case 'at-risk':
            return { bg: 'rgba(217, 115, 115, 0.12)', text: theme.colors.atRisk, border: theme.colors.atRisk, icon: 'alert-circle' };
        case 'completed':
            return { bg: 'rgba(107, 155, 122, 0.2)', text: theme.colors.success, border: theme.colors.success, icon: 'trophy' };
        default:
            return { bg: theme.colors.surfaceHighlight, text: theme.colors.textSecondary, border: theme.colors.border, icon: 'ellipse-outline' };
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'on-track': return 'On Track';
        case 'at-risk': return 'At Risk';
        case 'completed': return 'Completed';
        default: return status;
    }
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 0) return 'Overdue';
    if (diffDays <= 7) return `${diffDays} days left`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const GoalListItem: React.FC<GoalListItemProps> = ({ goal, onPress, onLongPress, onEdit, onDelete, onComplete }) => {
    const colors = getStatusColor(goal.status || 'on-track');
    const isCompleted = goal.status === 'completed';
    const progress = goal.progress || 0;

    return (
        <ReanimatedSwipeable
            friction={2}
            enableTrackpadTwoFingerGesture
            rightThreshold={40}
            renderRightActions={(prog, drag) => (
                <RightAction prog={prog} drag={drag} onEdit={() => onEdit(goal)} onDelete={() => onDelete(goal)} />
            )}
            renderLeftActions={(prog, drag) => !isCompleted ? (
                <LeftAction prog={prog} drag={drag} onComplete={() => onComplete(goal)} />
            ) : undefined}
        >
            <Pressable
                style={({ pressed }) => [
                    styles.goalCard,
                    isCompleted && styles.goalCardCompleted,
                    { transform: [{ scale: pressed ? 0.98 : 1 }] }
                ]}
                onPress={() => onPress(goal)}
                delayLongPress={200}
                onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    onLongPress(goal);
                }}
            >
                {/* Status ribbon */}
                <View style={[styles.statusRibbon, { backgroundColor: colors.border }]} />

                <View style={styles.goalCardContent}>
                    <View style={styles.goalHeader}>
                        <View style={styles.goalTitleRow}>
                            <View style={styles.goalEmojiContainer}>
                                <Text style={styles.goalEmoji}>🎯</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.goalText, isCompleted && styles.goalTextCompleted]} numberOfLines={2}>{goal.text}</Text>
                                <Text style={styles.deadline}>{formatDate(goal.deadline)}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.moreButton}
                                onPress={() => onLongPress(goal)}
                            >
                                <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textTertiary} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                            <Ionicons name={colors.icon as any} size={12} color={colors.text} style={{ marginRight: 4 }} />
                            <Text style={[styles.statusText, { color: colors.text }]}>
                                {getStatusLabel(goal.status || 'on-track')}
                            </Text>
                        </View>
                    </View>

                    {/* Enhanced Progress Bar */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressLabelRow}>
                            <Text style={styles.progressLabel}>Progress</Text>
                            <Text style={[styles.progressValue, isCompleted && { color: theme.colors.success }]}>{progress}%</Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBar}>
                                <LinearGradient
                                    colors={isCompleted ? theme.gradients.success as [string, string] : theme.gradients.sage as [string, string]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.progressFill, { width: `${progress}%` }]}
                                />
                            </View>
                            {/* Milestone markers */}
                            <View style={styles.milestones}>
                                {[25, 50, 75].map((milestone) => (
                                    <View
                                        key={milestone}
                                        style={[
                                            styles.milestone,
                                            { left: `${milestone}%` },
                                            progress >= milestone && styles.milestoneReached
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
            </Pressable>
        </ReanimatedSwipeable>
    );
};

const styles = StyleSheet.create({
    goalCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surfaceElevated,
        borderRadius: theme.borderRadius.xl,
        overflow: 'hidden',
        ...theme.shadows.small,
    },
    goalCardCompleted: {
        opacity: 0.7,
    },
    statusRibbon: {
        width: 5,
    },
    goalCardContent: {
        flex: 1,
        padding: 20,
    },
    goalHeader: {
        marginBottom: 16,
        gap: 12,
    },
    goalTitleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    goalEmojiContainer: {
        width: 44,
        height: 44,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalEmoji: {
        fontSize: 22,
    },
    goalText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 4,
        lineHeight: 22,
    },
    goalTextCompleted: {
        textDecorationLine: 'line-through',
        color: theme.colors.textSecondary,
    },
    deadline: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    moreButton: {
        padding: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.sm,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressSection: {
        gap: 8,
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressLabel: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    progressValue: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    progressBarContainer: {
        position: 'relative',
        height: 12,
    },
    progressBar: {
        height: 10,
        backgroundColor: theme.colors.surfaceHighlight,
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 5,
    },
    milestones: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 10,
    },
    milestone: {
        position: 'absolute',
        top: 2,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.surface,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        marginLeft: -3,
    },
    milestoneReached: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
});

export default GoalListItem;

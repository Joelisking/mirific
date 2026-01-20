import { theme } from "@/constants/theme";
import { type Message } from '@/lib/redux/slices/chatSlice';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProposalRendererProps {
    message: Message;
    onCreateGoal: (suggestion: any, messageId: string) => void;
    onCreateHabit: (suggestion: any, messageId: string) => void;
    onConfirmProgressUpdate: (suggestion: any, messageId: string) => void;
}

const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
        return dateString;
    }
};

const ProposalRenderer: React.FC<ProposalRendererProps> = ({
    message,
    onCreateGoal,
    onCreateHabit,
    onConfirmProgressUpdate
}) => {
    if (message.goalSuggestion) {
        return (
            <View style={styles.proposalContainer}>
                <View style={styles.proposalCard}>
                    <View style={styles.proposalHeader}>
                        <Text style={styles.proposalEmoji}>{message.goalSuggestion.emoji}</Text>
                        <View style={styles.proposalBadge}>
                            <Text style={styles.proposalBadgeText}>Goal Proposal</Text>
                        </View>
                    </View>
                    <Text style={styles.proposalText}>{message.goalSuggestion.text}</Text>

                    {message.goalSuggestion.saved ? (
                        <View style={styles.savedStateContainer}>
                            <View style={styles.savedStateChip}>
                                <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />
                                <Text style={styles.savedStateText}>Added to Goals</Text>
                            </View>
                        </View>
                    ) : (
                        <>
                            <View style={styles.proposalMeta}>
                                <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                                <Text style={styles.proposalDate}>Target: {formatDate(message.goalSuggestion.deadline)}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.proposalButton}
                                onPress={() => onCreateGoal(message.goalSuggestion!, message.id)}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={theme.gradients.sage as [string, string]}
                                    style={styles.proposalButtonGradient}
                                >
                                    <Text style={styles.proposalButtonText}>Review & Save</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        );
    }

    if (message.habitSuggestion) {
        return (
            <View style={styles.proposalContainer}>
                <View style={[styles.proposalCard, styles.habitProposalCard]}>
                    <View style={styles.proposalHeader}>
                        <Text style={styles.proposalEmoji}>{message.habitSuggestion.emoji}</Text>
                        <View style={[styles.proposalBadge, styles.habitProposalBadge]}>
                            <Text style={[styles.proposalBadgeText, { color: theme.colors.accent }]}>Habit Proposal</Text>
                        </View>
                    </View>
                    <Text style={styles.proposalText}>{message.habitSuggestion.name}</Text>

                    {message.habitSuggestion.saved ? (
                        <View style={styles.savedStateContainer}>
                            <View style={[styles.savedStateChip, { backgroundColor: 'rgba(196, 149, 106, 0.15)' }]}>
                                <Ionicons name="checkmark-circle" size={18} color={theme.colors.accent} />
                                <Text style={[styles.savedStateText, { color: theme.colors.accent }]}>Added to Habits</Text>
                            </View>
                        </View>
                    ) : (
                        <>
                            <View style={styles.habitProposalMeta}>
                                <View style={styles.metaChip}>
                                    <Ionicons name="repeat-outline" size={14} color={theme.colors.textSecondary} />
                                    <Text style={styles.metaChipText}>{message.habitSuggestion.frequency}</Text>
                                </View>
                                <View style={styles.metaChip}>
                                    <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                                    <Text style={styles.metaChipText}>{message.habitSuggestion.reminderTime}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.proposalButton}
                                onPress={() => onCreateHabit(message.habitSuggestion!, message.id)}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={theme.gradients.sunsetAccent as [string, string]}
                                    style={styles.proposalButtonGradient}
                                >
                                    <Text style={styles.proposalButtonText}>Review & Save</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        );
    }

    if (message.progressUpdateSuggestion) {
        return (
            <View style={styles.proposalContainer}>
                <View style={[styles.proposalCard, { borderLeftColor: theme.colors.primary }]}>
                    <View style={styles.proposalHeader}>
                        <Text style={styles.proposalEmoji}>📈</Text>
                        <View style={[styles.proposalBadge, { backgroundColor: theme.colors.surface }]}>
                            <Text style={[styles.proposalBadgeText, { color: theme.colors.textPrimary }]}>Progress Update</Text>
                        </View>
                    </View>
                    <Text style={styles.proposalText}>
                        Update <Text style={{ fontWeight: '700' }}>{message.progressUpdateSuggestion.goalTitle}</Text> to {message.progressUpdateSuggestion.newProgress}%?
                    </Text>

                    {message.progressUpdateSuggestion.saved ? (
                        <View style={styles.savedStateContainer}>
                            <View style={[styles.savedStateChip, { backgroundColor: theme.colors.primary }]}>
                                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                                <Text style={[styles.savedStateText, { color: '#fff' }]}>Updated</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <View style={styles.proposalMeta}>
                                <Text style={styles.proposalDate}>{message.progressUpdateSuggestion.oldProgress}% → {message.progressUpdateSuggestion.newProgress}%</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.proposalButton}
                                onPress={() => onConfirmProgressUpdate(message.progressUpdateSuggestion!, message.id)}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={theme.gradients.sage as [string, string]}
                                    style={styles.proposalButtonGradient}
                                >
                                    <Text style={styles.proposalButtonText}>Confirm</Text>
                                    <Ionicons name="arrow-up-circle" size={16} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    proposalContainer: {
        marginTop: 8,
        marginBottom: 4,
    },
    proposalCard: {
        backgroundColor: '#fff',
        borderRadius: theme.borderRadius.lg,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
        ...theme.shadows.small,
    },
    habitProposalCard: {
        borderLeftColor: theme.colors.accent,
    },
    proposalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    proposalEmoji: {
        fontSize: 24,
    },
    proposalBadge: {
        backgroundColor: theme.colors.surfaceElevated,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.sm,
    },
    habitProposalBadge: {
        backgroundColor: 'rgba(196, 149, 106, 0.1)',
    },
    proposalBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: theme.colors.primary,
        textTransform: 'uppercase',
    },
    proposalText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 12,
        lineHeight: 24,
    },
    proposalMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
    },
    habitProposalMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    metaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.sm,
    },
    metaChipText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    proposalDate: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    proposalButton: {
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
    },
    proposalButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    proposalButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    savedStateContainer: {
        marginTop: 8,
    },
    savedStateChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(124, 144, 112, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: theme.borderRadius.md,
        alignSelf: 'flex-start',
    },
    savedStateText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
});

export default ProposalRenderer;

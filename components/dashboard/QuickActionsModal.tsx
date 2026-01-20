import { theme } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickActionsModalProps {
    visible: boolean;
    onClose: () => void;
    onOpenAddSheet: (type: 'habit' | 'goal') => void;
}

const QuickActionsModal: React.FC<QuickActionsModalProps> = ({ visible, onClose, onOpenAddSheet }) => {
    const router = useRouter();

    const quickActions = [
        {
            id: 'goal-ai',
            label: 'Set a goal with AI',
            emoji: '🤖',
            action: () => {
                onClose();
                router.push('/coach');
            },
        },
        {
            id: 'goal-manual',
            label: 'Create goal manually',
            emoji: '🎯',
            action: () => {
                onClose();
                onOpenAddSheet('goal');
            },
        },
        {
            id: 'habit',
            label: 'Track a habit',
            emoji: '✅',
            action: () => {
                onClose();
                onOpenAddSheet('habit');
            },
        },
        {
            id: 'checkin',
            label: 'Quick check-in',
            emoji: '💬',
            action: () => {
                onClose();
                router.push('/coach');
            },
        },
        {
            id: 'milestone',
            label: 'Celebrate a win',
            emoji: '🎉',
            action: () => {
                onClose();
                router.push('/rewards');
            },
        },
    ];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}>
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHandle} />

                    <View style={styles.modalHeader}>
                        <View style={styles.modalTitleRow}>
                            <View style={styles.modalIcon}>
                                <Ionicons
                                    name="sparkles"
                                    size={20}
                                    color={theme.colors.accent}
                                />
                            </View>
                            <Text style={styles.modalTitle}>
                                What's on your mind?
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <Ionicons
                                name="close"
                                size={22}
                                color={theme.colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionsList}>
                        {quickActions.map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                style={styles.actionItem}
                                onPress={action.action}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.actionEmoji}>
                                    {action.emoji}
                                </Text>
                                <Text style={styles.actionLabel}>
                                    {action.label}
                                </Text>
                                <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.coachButton}
                        onPress={() => {
                            onClose();
                            router.push('/coach');
                        }}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={theme.gradients.sage as [string, string]}
                            style={styles.coachButtonGradient}
                        >
                            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
                            <Text style={styles.coachButtonText}>
                                Talk to your coach
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.colors.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.surfaceElevated,
        borderTopLeftRadius: theme.borderRadius.xxl,
        borderTopRightRadius: theme.borderRadius.xxl,
        padding: 24,
        paddingBottom: 48,
        gap: 20,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modalIcon: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.md,
        backgroundColor: 'rgba(196, 149, 106, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.h2.fontFamily,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionsList: {
        gap: 10,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: 16,
        ...theme.shadows.small,
    },
    actionEmoji: {
        fontSize: 24,
    },
    actionLabel: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.textPrimary,
        fontWeight: '500',
    },
    coachButton: {
        marginTop: 8,
        borderRadius: theme.borderRadius.xl,
        overflow: 'hidden',
        ...theme.shadows.medium,
    },
    coachButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 18,
    },
    coachButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.3,
    },
});

export default QuickActionsModal;

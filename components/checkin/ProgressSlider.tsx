import { theme } from "@/constants/theme";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import { Dimensions, GestureResponderEvent, PanResponder, PanResponderGestureState, StyleSheet, Text, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface ProgressSliderProps {
    progress: number;
    onUpdate: (progress: number) => void;
    celebration: { emoji: string; text: string };
}

const ProgressSlider: React.FC<ProgressSliderProps> = ({ progress, onUpdate, celebration }) => {
    const updateProgress = (pageX: number) => {
        const trackX = 24;
        const trackWidth = SCREEN_WIDTH - 48; // Assuming 24px padding on both sides of container

        let newProgress = ((pageX - trackX) / trackWidth) * 100;
        newProgress = Math.max(0, Math.min(100, newProgress));
        onUpdate(Math.round(newProgress));
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt: GestureResponderEvent) => {
                updateProgress(evt.nativeEvent.pageX);
            },
            onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
                updateProgress(gestureState.moveX);
            },
            onPanResponderTerminationRequest: () => false,
        })
    ).current;

    return (
        <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
                <Text style={styles.sectionLabel}>YOUR PROGRESS</Text>
                <View style={styles.progressDisplay}>
                    <Text style={styles.percentageText}>{progress}%</Text>
                    <View style={styles.celebrationBadge}>
                        <Text style={styles.celebrationEmoji}>{celebration.emoji}</Text>
                        <Text style={styles.celebrationText}>{celebration.text}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.sliderContainer} {...panResponder.panHandlers}>
                <View style={styles.track} />
                <LinearGradient
                    colors={theme.gradients.sage as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.fill, { width: `${progress}%` }]}
                />

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

                <View style={[styles.knob, { left: `${progress}%` }]}>
                    <LinearGradient
                        colors={theme.gradients.sage as [string, string]}
                        style={styles.knobGradient}
                    />
                </View>
            </View>
            <Text style={styles.sliderHint}>Tap or slide to update</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    progressSection: {
        marginBottom: 32,
    },
    progressHeader: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    progressDisplay: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    percentageText: {
        fontSize: 48,
        fontWeight: '700',
        color: theme.colors.primary,
        fontFamily: theme.typography.h1.fontFamily,
        letterSpacing: -1,
    },
    celebrationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
        marginBottom: 8,
    },
    celebrationEmoji: {
        fontSize: 16,
    },
    celebrationText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    sliderContainer: {
        height: 56,
        justifyContent: 'center',
        position: 'relative',
    },
    track: {
        height: 12,
        backgroundColor: theme.colors.surfaceHighlight,
        borderRadius: 6,
        width: '100%',
        position: 'absolute',
    },
    fill: {
        height: 12,
        borderRadius: 6,
        position: 'absolute',
    },
    milestones: {
        position: 'absolute',
        top: 22,
        left: 0,
        right: 0,
        height: 12,
    },
    milestone: {
        position: 'absolute',
        top: 3,
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
    knob: {
        width: 36,
        height: 36,
        borderRadius: 18,
        position: 'absolute',
        top: 10,
        marginLeft: -18,
        ...theme.shadows.medium,
        overflow: 'hidden',
    },
    knobGradient: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    sliderHint: {
        textAlign: 'center',
        color: theme.colors.textTertiary,
        fontSize: 13,
        marginTop: 16,
        fontStyle: 'italic',
    },
});

export default ProgressSlider;

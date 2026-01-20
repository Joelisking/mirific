import { theme } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';

export const RightAction = ({ prog, drag, onEdit, onDelete }: any) => {
    const styleAnimation = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: drag.value + 120 }], // Adjust based on width of rightActions
        };
    });

    return (
        <Reanimated.View style={styleAnimation}>
            <View style={styles.rightActions}>
                <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={onEdit}>
                    <Ionicons name="pencil" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
                    <Ionicons name="trash" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </Reanimated.View>
    );
};

export const LeftAction = ({ prog, drag, onComplete }: any) => {
    const styleAnimation = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: drag.value - 60 }],
        };
    });

    return (
        <Reanimated.View style={styleAnimation}>
            <TouchableOpacity style={[styles.actionBtn, styles.completeBtn]} onPress={onComplete}>
                <Ionicons name="checkmark-done" size={24} color="#fff" />
            </TouchableOpacity>
        </Reanimated.View>
    );
};

const styles = StyleSheet.create({
    rightActions: {
        width: 120,
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
        paddingLeft: 12,
        gap: 8,
    },
    actionBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.small,
    },
    editBtn: {
        backgroundColor: theme.colors.textSecondary,
    },
    deleteBtn: {
        backgroundColor: theme.colors.error,
    },
    completeBtn: {
        backgroundColor: theme.colors.success,
        marginLeft: 12,
    },
});

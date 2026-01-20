import { theme } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface FloatingActionButtonProps {
    onPress: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => {
    return (
        <TouchableOpacity
            style={styles.fabContainer}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={theme.gradients.sage as [string, string]}
                style={styles.fab}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fabContainer: {
        position: 'absolute',
        bottom: 96,
        right: 24,
        borderRadius: theme.borderRadius.xl,
        ...theme.shadows.large,
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: theme.borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default FloatingActionButton;

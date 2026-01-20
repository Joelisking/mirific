import { theme } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

interface ToggleOptionProps {
    label: string;
    description: string;
    value: boolean;
    onValueChange?: (value: boolean) => void;
    icon: keyof typeof Ionicons.glyphMap;
}

const ToggleOption: React.FC<ToggleOptionProps> = ({ label, description, value, onValueChange, icon }) => {
    return (
        <View style={styles.settingRow}>
            <View style={styles.settingIconContainer}>
                <Ionicons name={icon} size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{label}</Text>
                <Text style={styles.settingDescription}>{description}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                thumbColor={theme.colors.primary}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    settingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    settingInfo: {
        flex: 1,
        gap: 2,
    },
    settingLabel: {
        fontSize: 16,
        color: theme.colors.textPrimary,
        fontWeight: '500',
    },
    settingDescription: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
});

export default ToggleOption;

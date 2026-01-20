import { theme } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MenuOptionProps {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    value?: string;
    iconColor?: string;
}

const MenuOption: React.FC<MenuOptionProps> = ({ label, icon, onPress, value, iconColor = theme.colors.primary }) => {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIconContainer}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <Text style={styles.menuLabel}>{label}</Text>
            {value ? (
                <Text style={styles.menuValue}>{value}</Text>
            ) : (
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            )}
        </Container>
    );
};

const styles = StyleSheet.create({
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.textPrimary,
        fontWeight: '500',
    },
    menuValue: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
});

export default MenuOption;

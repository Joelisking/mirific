import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface ChatContextMenuProps {
    visible: boolean;
    x: number;
    y: number;
    text: string;
    onClose: () => void;
}

const ChatContextMenu: React.FC<ChatContextMenuProps> = ({ visible, x, y, text, onClose }) => {
    const handleCopy = async () => {
        await Clipboard.setStringAsync(text);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.menuOverlay}>
                    <View
                        style={[
                            styles.contextMenu,
                            {
                                top: y + 10,
                                // Center menu horizontally if possible, or align to touch
                                left: 60, // A safer default for centered-ish or fixed
                                right: 60
                            }
                        ]}
                    >
                        <TouchableOpacity style={styles.menuItem} onPress={handleCopy}>
                            <Ionicons name="copy-outline" size={20} color="#fff" />
                            <Text style={styles.menuText}>Copy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)', // Slight dim
    },
    contextMenu: {
        position: 'absolute',
        backgroundColor: '#1E1E1E', // Dark generic
        borderRadius: 12,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
        minWidth: 150,
        alignSelf: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    menuText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ChatContextMenu;

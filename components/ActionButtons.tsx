import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { COLORS } from '@/constants/theme';

interface ActionButtonsProps {
    cancelText: string;
    confirmText: string;
    onCancel: () => void;
    onConfirm: () => void;
    insets?: {
        bottom: number;
    };
    confirmDisabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    cancelText,
    confirmText,
    onCancel,
    onConfirm,
    insets = { bottom: 0 },
    confirmDisabled = false,
}) => {
    return (
        <View style={[styles.container, { bottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
            <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
            >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.button,
                    styles.confirmButton,
                    confirmDisabled && styles.confirmButtonDisabled,
                ]}
                onPress={onConfirm}
                disabled={confirmDisabled}
            >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 8,
    },
    cancelButton: {
        flex: 1,
        marginRight: 8,
        backgroundColor: '#f5f5f5',
    },
    confirmButton: {
        flex: 2,
        marginLeft: 8,
        backgroundColor: COLORS.secondary,
    },
    confirmButtonDisabled: {
        opacity: 0.6,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
});
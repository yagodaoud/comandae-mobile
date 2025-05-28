import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { COLORS } from '@/constants/theme';

interface ActionButtonsProps {
    cancelText: string;
    confirmText: string;
    onCancel: () => void;
    onConfirm: () => void;
    confirmDisabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    cancelText,
    confirmText,
    onCancel,
    onConfirm,
    confirmDisabled = false,
}) => {
    return (
        <View style={styles.container}>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 0,
        paddingVertical: 0,
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
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
}

export const Button = ({
    title,
    onPress,
    disabled = false,
    loading = false
}: ButtonProps) => {
    return (
        <TouchableOpacity
            style={[styles.button, (disabled || loading) && styles.buttonDisabled]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            <Text style={styles.buttonText}>
                {loading ? 'Carregando...' : title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
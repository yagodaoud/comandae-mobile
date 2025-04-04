import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface CheckboxProps {
    label: string;
    checked: boolean;
    onToggle: () => void;
    icon?: React.ReactNode;
}

export const Checkbox = ({
    label,
    checked,
    onToggle,
    icon
}: CheckboxProps) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onToggle}>
            <View style={[styles.checkboxContainer, checked && styles.checkboxSelected]}>
                {checked && <Feather name="check" size={16} color="#fff" />}
            </View>
            <Text style={styles.label}>{label}</Text>
            {icon}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    checkboxContainer: {
        width: 24,
        height: 24,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxSelected: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    label: {
        fontSize: 16,
        color: '#555',
    },
});
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';
import { parseBRL } from '@/utils/formatBRL';

interface ExtraAmountInputProps {
    extraAmount: string;
    setExtraAmount: (amount: string) => void;
}

export const ExtraAmountInput: React.FC<ExtraAmountInputProps> = ({ extraAmount, setExtraAmount }) => {
    const handleAmountChange = (text: string) => {
        // Remove any non-numeric characters except comma and dot
        const cleaned = text.replace(/[^0-9,.]/g, '');

        // Convert comma to dot for parsing
        const normalized = cleaned.replace(',', '.');

        // Only allow one decimal point
        const parts = normalized.split('.');
        if (parts.length > 2) {
            return;
        }

        // Limit to 2 decimal places
        if (parts.length === 2 && parts[1].length > 2) {
            return;
        }

        setExtraAmount(cleaned);
    };

    return (
        <View style={styles.extraAmountCard}>
            <Text style={styles.label}>Adicionar Valor Extra</Text>
            <TextInput
                style={styles.input}
                value={extraAmount}
                onChangeText={handleAmountChange}
                placeholder="0,00"
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    extraAmountCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#f9f9f9',
    },
}); 
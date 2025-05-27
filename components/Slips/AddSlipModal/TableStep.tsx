import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface TableStepProps {
    table: string;
    setTable: (value: string) => void;
    tableError: string;
    onNext: () => void;
}

export default function TableStep({ table, setTable, tableError, onNext }: TableStepProps) {
    return (
        <View style={styles.step}>
            <Text style={styles.stepTitle}>Número da Comanda</Text>
            <TextInput
                style={[styles.input, tableError && styles.inputError]}
                value={table}
                onChangeText={setTable}
                placeholder="Ex: 1"
                autoFocus
                keyboardType="numeric"
                maxLength={3}
            />
            {tableError ? (
                <Text style={styles.errorText}>{tableError}</Text>
            ) : null}
            <TouchableOpacity
                style={[
                    styles.nextButton,
                    !table && styles.nextButtonDisabled
                ]}
                onPress={onNext}
                disabled={!table}
            >
                <Text style={styles.nextButtonText}>Próximo</Text>
                <Feather name="arrow-right" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    step: {
        padding: 20,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    inputError: {
        borderColor: '#F44336',
    },
    errorText: {
        color: '#F44336',
        fontSize: 14,
        marginTop: -12,
        marginBottom: 16,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        padding: 12,
        borderRadius: 8,
        paddingHorizontal: 20,
    },
    nextButtonDisabled: {
        opacity: 0.6,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
}); 
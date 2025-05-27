import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface FilterChipsProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

export function FilterChips({ activeFilter, onFilterChange }: FilterChipsProps) {
    const filters = [
        { id: 'all', label: 'Todas' },
        { id: 'recent', label: 'Recentes' },
        { id: 'medium', label: 'Intermediárias' },
        { id: 'long', label: 'Demoradas' },
    ];

    return (
        <View style={styles.container}>
            {filters.map((filter) => (
                <TouchableOpacity
                    key={filter.id}
                    style={[
                        styles.chip,
                        activeFilter === filter.id && styles.activeChip,
                    ]}
                    onPress={() => onFilterChange(filter.id)}
                >
                    <Text
                        style={[
                            styles.chipText,
                            activeFilter === filter.id && styles.activeChipText,
                        ]}
                    >
                        {filter.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    activeChip: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    chipText: {
        fontSize: 14,
        color: '#666',
    },
    activeChipText: {
        color: '#fff',
    },
});

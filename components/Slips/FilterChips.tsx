import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface FilterChipsProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
    activeFilter,
    onFilterChange
}) => {
    const filterOptions = [
        { key: 'all', label: 'Todos' },
        { key: 'recent', label: 'Recentes', color: '#4CAF50' },
        { key: 'medium', label: 'Em Espera', color: '#FF9800' },
        { key: 'long', label: 'Atrasados', color: '#F44336' }
    ];

    return (
        <View style={styles.filterContainer}>
            {filterOptions.map((filter) => (
                <TouchableOpacity
                    key={filter.key}
                    style={[
                        styles.filterChip,
                        activeFilter === filter.key && styles.activeFilterChip
                    ]}
                    onPress={() => onFilterChange(filter.key)}
                >
                    {filter.color && (
                        <View
                            style={[
                                styles.colorIndicator,
                                { backgroundColor: filter.color }
                            ]}
                        />
                    )}
                    <Text
                        style={[
                            styles.filterText,
                            activeFilter === filter.key && styles.activeFilterText
                        ]}
                    >
                        {filter.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        overflow: 'scroll',
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    activeFilterChip: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    colorIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    filterText: {
        fontSize: 12,
        color: '#333',
    },
    activeFilterText: {
        color: '#fff',
        fontWeight: '500',
    },
})

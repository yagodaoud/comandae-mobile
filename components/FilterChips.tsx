import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface FilterOption {
    id: string;
    label: string;
    icon: string;
}

interface FilterChipsProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    filters: FilterOption[];
}

export const FilterChips: React.FC<FilterChipsProps> = ({
    activeFilter,
    onFilterChange,
    filters,
}) => {
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
                    <Feather
                        name={filter.icon as any}
                        size={16}
                        color={activeFilter === filter.id ? '#fff' : '#666'}
                    />
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
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    chip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#f0f0f0',
    },
    activeChip: {
        backgroundColor: COLORS.secondary,
    },
    chipText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#666',
    },
    activeChipText: {
        color: '#fff',
        fontWeight: '500',
    },
});
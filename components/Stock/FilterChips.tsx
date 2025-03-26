import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS } from '@/constants/theme';

interface FilterChipsProps {
    categories: Array<{ id: string; name: string }>;
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({
    categories,
    selectedCategory,
    onSelectCategory
}) => {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <TouchableOpacity
                    style={[
                        styles.filterChip,
                        selectedCategory === 'all' && styles.activeFilterChip
                    ]}
                    onPress={() => onSelectCategory('all')}
                >
                    <Text style={[
                        styles.filterText,
                        selectedCategory === 'all' && styles.activeFilterText
                    ]}>
                        Todos
                    </Text>
                </TouchableOpacity>

                {categories.map(category => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.filterChip,
                            selectedCategory === category.name && styles.activeFilterChip
                        ]}
                        onPress={() => onSelectCategory(category.name)}
                    >
                        <Text style={[
                            styles.filterText,
                            selectedCategory === category.name && styles.activeFilterText
                        ]}>
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 40,
        marginVertical: 8,
    },
    scrollContent: {
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    filterChip: {
        height: 32,
        justifyContent: 'center',
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
    filterText: {
        fontSize: 12,
        color: '#333',
    },
    activeFilterText: {
        color: '#fff',
        fontWeight: '500',
    },
});

export default FilterChips;
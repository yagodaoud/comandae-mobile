import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface Category {
    _id: string;
    name: string;
}

interface CategorySelectorProps {
    categories: Category[];
    selectedCategory: string | null;
    onSelect: (categoryId: string) => void;
}

export const CategorySelector = ({
    categories,
    selectedCategory,
    onSelect
}: CategorySelectorProps) => {
    return (
        <View style={styles.formGroup}>
            <Text style={styles.label}>Categoria*</Text>
            <View style={styles.categoryContainer}>
                {categories.map(category => (
                    <TouchableOpacity
                        key={category._id}
                        style={[
                            styles.categoryButton,
                            selectedCategory === category._id && styles.selectedCategory
                        ]}
                        onPress={() => onSelect(category._id)}
                    >
                        <Text style={[
                            styles.categoryText,
                            selectedCategory === category._id && styles.selectedCategoryText
                        ]}>
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#555',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryButton: {
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    categoryText: {
        fontSize: 14,
    },
    selectedCategoryText: {
        color: '#fff',
    },
    selectedCategory: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.white,
    },
});
import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface Category {
    id: string;
    name: string;
}

interface CategoryChipsProps {
    categories: Category[];
    activeCategory: string | null;
    onCategorySelect: any;
}

export const CategoryChip = ({ categories, activeCategory, onCategorySelect }: CategoryChipsProps) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
        >
            {categories.map(category => (
                <TouchableOpacity
                    key={category.id}
                    style={[
                        styles.categoryChip,
                        activeCategory === category.id && styles.activeCategoryChip
                    ]}
                    onPress={() => onCategorySelect(
                        activeCategory === category.id ? null : category.id
                    )}
                >
                    <Text
                        style={[
                            styles.categoryChipText,
                            activeCategory === category.id && styles.activeCategoryChipText
                        ]}
                    >
                        {category.name}
                    </Text>
                </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addCategoryChip}>
                <Feather name="plus" size={16} color={COLORS.primary} />
                <Text style={styles.addCategoryText}>Nova</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    categoriesContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    activeCategoryChip: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.white,
    },
    categoryChipText: {
        color: '#333',
        fontWeight: '500',
    },
    activeCategoryChipText: {
        color: '#fff',
    },
    addCategoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
    },
    addCategoryText: {
        marginLeft: 4,
        color: COLORS.primary,
        fontWeight: '500',
    },
})
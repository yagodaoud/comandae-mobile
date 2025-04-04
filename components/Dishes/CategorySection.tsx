import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/theme';
import { CategoryChip } from './CategoryChip';

interface CategorySectionProps {
    categories: { _id: string; name: string }[];
    activeCategory: string | null;
    setActiveCategory: (categoryId: string | null) => void;
    onAddCategory: () => void;
    dishes: { categoryId: string }[];
}

const CategorySection: React.FC<CategorySectionProps> = ({
    categories,
    activeCategory,
    setActiveCategory,
    onAddCategory,
    dishes
}) => {
    const transformedCategories = categories.map(category => ({
        id: category._id,
        name: category.name,
        dishCount: dishes.filter(dish => dish.categoryId === category._id).length
    }));

    return (
        <View style={styles.categoriesContainer}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categorias</Text>
                <TouchableOpacity onPress={() => setActiveCategory(null)}>
                    <Text style={[styles.filterText, !activeCategory && styles.activeFilter]}>
                        Todos
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScrollContent}
            >
                <CategoryChip
                    categories={transformedCategories}
                    activeCategory={activeCategory}
                    onCategorySelect={setActiveCategory}
                    onAddCategoryPress={onAddCategory}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    categoriesContainer: {
        backgroundColor: COLORS.background,
    },
    categoryScrollContent: {
        paddingHorizontal: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    filterText: {
        fontSize: 14,
        color: '#888',
    },
    activeFilter: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});

export default CategorySection;
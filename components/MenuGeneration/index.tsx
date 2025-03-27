import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import TransparentHeader from '@/components/TransparentHeader';
import { SearchBar } from './SearchBar';
import { CategoryChip } from './CategoryChip';
import { DishCard } from './DishCard';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function MenuGeneration() {
    const insets = useSafeAreaInsets();
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const categories = useQuery(api.menu.getDishCategories) || [];
    const dishes = useQuery(api.menu.getDishes) || [];
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (categories && dishes) {
            setIsLoading(false);
        }
    }, [categories, dishes]);

    const bottomPadding = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

    const transformedCategories = categories.map(category => ({
        id: category._id,
        name: category.name,
        dishCount: dishes.filter(dish => dish.categoryId === category._id).length
    }));

    const filteredDishes = activeCategory
        ? dishes.filter(dish => dish.categoryId === activeCategory)
        : dishes.filter(dish =>
            dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );

    const handleAddItem = () => {
        console.log('Add new menu item');
    };

    const handleScanMenu = () => {
        console.log('Scan menu from image');
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text>Carregando cardápio...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TransparentHeader title="Cardápio" />

            <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddItem={handleAddItem}
                onScanMenu={handleScanMenu}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: bottomPadding }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Categorias</Text>
                    <TouchableOpacity onPress={() => setActiveCategory(null)}>
                        <Text style={[styles.filterText, !activeCategory && styles.activeFilter]}>
                            Todos
                        </Text>
                    </TouchableOpacity>
                </View>

                <CategoryChip
                    categories={transformedCategories}
                    activeCategory={activeCategory}
                    onCategorySelect={setActiveCategory}
                />

                <View style={styles.dishesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Itens do Cardápio</Text>
                        <Text style={styles.itemCount}>{filteredDishes.length} itens</Text>
                    </View>

                    {filteredDishes.map(dish => (
                        <DishCard
                            key={dish._id}
                            name={dish.name}
                            price={dish.price.toFixed(2).replace('.', ',')}
                            description={dish.description}
                            emoji={dish.emoji}
                        />
                    ))}

                    <TouchableOpacity style={styles.addDishButton} onPress={handleAddItem}>
                        <Feather name="plus" size={18} color="#fff" />
                        <Text style={styles.addDishText}>Adicionar Item</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    dishesSection: {
        marginTop: 8,
        paddingBottom: 16,
    },
    addDishButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginTop: 8,
    },
    addDishText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 8,
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
    itemCount: {
        fontSize: 14,
        color: '#888',
    },
});
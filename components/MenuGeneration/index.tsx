import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import TransparentHeader from '@/components/TransparentHeader';
import { SearchBar } from './SearchBar';
import { CategoryChip } from './CategoryChip';
import { DishCard } from './DishCard';

const initialCategories = [
    { id: '1', name: 'Entradas', dishCount: 4 },
    { id: '2', name: 'Pratos Principais', dishCount: 6 },
    { id: '3', name: 'Sobremesas', dishCount: 3 },
];

const initialDishes = [
    { id: '1', categoryId: '1', name: 'Bruschetta', price: '18,90', description: 'Tomate, manjericão e alho no pão italiano' },
    { id: '2', categoryId: '1', name: 'Carpaccio', price: '32,00', description: 'Fatias finas de carne com molho especial' },
    { id: '3', categoryId: '2', name: 'Risoto de Funghi', price: '45,90', description: 'Arroz arbóreo com cogumelos frescos' },
    { id: '4', categoryId: '2', name: 'Filé ao Molho Madeira', price: '58,90', description: 'Filé mignon grelhado ao ponto com molho madeira' },
    { id: '5', categoryId: '3', name: 'Tiramisu', price: '22,90', description: 'Sobremesa italiana com café e mascarpone' },
];

export default function MenuGeneration() {
    const insets = useSafeAreaInsets();
    const [categories, setCategories] = useState(initialCategories);
    const [dishes, setDishes] = useState(initialDishes);
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const bottomPadding = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

    const filteredDishes = activeCategory
        ? dishes.filter(dish => dish.categoryId === activeCategory)
        : dishes.filter(dish =>
            dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dish.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const handleAddItem = () => {
        console.log('Add new menu item');
    };

    const handleScanMenu = () => {
        console.log('Scan menu from image');
    };

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
                    categories={categories}
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
                            key={dish.id}
                            name={dish.name}
                            price={dish.price}
                            description={dish.description}
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
})
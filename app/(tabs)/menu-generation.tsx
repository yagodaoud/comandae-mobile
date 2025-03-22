import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import TransparentHeader from '@/components/TransparentHeader';


// Sample menu data - you'll replace this with your actual data
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

const CategoryCard = ({ name, dishCount, onPress }) => {
    return (
        <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
            <View style={styles.categoryCardContent}>
                <View style={styles.categoryIconContainer}>
                    <Feather name="book-open" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.categoryTextContainer}>
                    <Text style={styles.categoryName}>{name}</Text>
                    <Text style={styles.categoryCount}>{dishCount} {dishCount === 1 ? 'item' : 'itens'}</Text>
                </View>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
        </TouchableOpacity>
    );
};

const DishCard = ({ name, price, description }) => {
    return (
        <View style={styles.dishCard}>
            <View style={styles.dishCardHeader}>
                <Text style={styles.dishName}>{name}</Text>
                <Text style={styles.dishPrice}>R$ {price}</Text>
            </View>
            <Text style={styles.dishDescription}>{description}</Text>
            <TouchableOpacity style={styles.editButton}>
                <Feather name="edit-2" size={16} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );
};

export default function Cardapio() {
    const insets = useSafeAreaInsets();
    const [categories, setCategories] = useState(initialCategories);
    const [dishes, setDishes] = useState(initialDishes);
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Calculate bottom padding to account for tab bar height plus any additional safe area
    const bottomPadding = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

    const filteredDishes = activeCategory
        ? dishes.filter(dish => dish.categoryId === activeCategory)
        : dishes.filter(dish =>
            dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dish.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <View style={styles.container}>
            <TransparentHeader title="Cardápio" />
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Feather name="search" size={18} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar item no cardápio"
                        placeholderTextColor="#888"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity style={styles.iconButton}>
                    <Feather name="plus" size={24} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => console.log('Scan menu from image')}
                >
                    <Feather name="camera" size={20} color={COLORS.white} />
                </TouchableOpacity>
            </View>

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
                            onPress={() => setActiveCategory(
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

                    <TouchableOpacity style={styles.addDishButton}>
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
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginRight: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: '#333',
    },
    scanButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
    },
    scrollView: {
        flex: 1,
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
    dishesSection: {
        marginTop: 8,
        paddingBottom: 16,
    },
    dishCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        position: 'relative',
    },
    dishCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    dishName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    dishPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
    },
    dishDescription: {
        fontSize: 14,
        color: '#666',
        paddingRight: 24,
    },
    editButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    categoryCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoryTextContainer: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    categoryCount: {
        fontSize: 14,
        color: '#888',
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
});
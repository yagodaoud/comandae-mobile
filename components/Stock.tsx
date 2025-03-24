import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import TransparentHeader from '@/components/TransparentHeader';

const initialCategories = [
    { id: '1', name: 'Bebidas', products: 12, image: 'https://placeholder.com/drinks' },
    { id: '2', name: 'Pratos Principais', products: 8, image: 'https://placeholder.com/main' },
    { id: '3', name: 'Sobremesas', products: 6, image: 'https://placeholder.com/desserts' },
    { id: '4', name: 'Aperitivos', products: 9, image: 'https://placeholder.com/appetizers' },
];

const initialProducts = [
    { id: '1', name: 'Coca-Cola', category: 'Bebidas', price: '8,90', stock: 24, image: 'https://placeholder.com/coke' },
    { id: '2', name: 'Água Mineral', category: 'Bebidas', price: '4,50', stock: 36, image: 'https://placeholder.com/water' },
    { id: '3', name: 'Filé Mignon', category: 'Pratos Principais', price: '62,90', stock: 8, image: 'https://placeholder.com/steak' },
    { id: '4', name: 'Pudim', category: 'Sobremesas', price: '12,90', stock: 12, image: 'https://placeholder.com/pudding' },
    { id: '5', name: 'Batata Frita', category: 'Aperitivos', price: '18,90', stock: 20, image: 'https://placeholder.com/fries' },
    { id: '6', name: 'Salada Caesar', category: 'Pratos Principais', price: '32,50', stock: 6, image: 'https://placeholder.com/caesar' },
    { id: '7', name: 'Cheesecake', category: 'Sobremesas', price: '15,90', stock: 7, image: 'https://placeholder.com/cheesecake' },
    { id: '8', name: 'Suco de Laranja', category: 'Bebidas', price: '9,90', stock: 18, image: 'https://placeholder.com/orange-juice' },
];

const CategoryCard = ({ name, products, image, onPress }) => {
    return (
        <TouchableOpacity
            style={styles.categoryCard}
            onPress={onPress}
        >
            <View style={styles.categoryImageContainer}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.categoryImage} />
                ) : (
                    <View style={styles.categoryImagePlaceholder}>
                        <Feather name="image" size={24} color="#ccc" />
                    </View>
                )}
            </View>
            <Text style={styles.categoryName}>{name}</Text>
            <Text style={styles.categoryProducts}>{products} produtos</Text>
        </TouchableOpacity>
    );
};

const ProductCard = ({ name, category, price, stock, image, onPress }) => {
    const lowStock = stock < 10;

    return (
        <TouchableOpacity
            style={styles.productCard}
            onPress={onPress}
        >
            <View style={styles.productHeader}>
                <View style={styles.productImageContainer}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.productImage} />
                    ) : (
                        <View style={styles.productImagePlaceholder}>
                            <Feather name="image" size={24} color="#ccc" />
                        </View>
                    )}
                </View>
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{name}</Text>
                    <Text style={styles.productCategory}>{category}</Text>
                </View>
            </View>
            <View style={styles.productFooter}>
                <Text style={styles.productPrice}>R$ {price}</Text>
                <View style={[styles.stockIndicator, { backgroundColor: lowStock ? '#F44336' : '#4CAF50' }]}>
                    <Text style={styles.stockText}>{stock} un</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function Stock() {
    const insets = useSafeAreaInsets();
    const [categories, setCategories] = useState(initialCategories);
    const [products, setProducts] = useState(initialProducts);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeView, setActiveView] = useState('products');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const bottomPadding = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (selectedCategory === 'all') return matchesSearch;
        return matchesSearch && product.category === selectedCategory;
    });

    const stats = {
        totalProducts: products.length,
        totalCategories: categories.length,
        lowStock: products.filter(p => p.stock < 10).length,
        totalValue: products.reduce((sum, product) =>
            sum + (parseFloat(product.price.replace(',', '.')) * product.stock), 0).toFixed(2).replace('.', ','),
    };

    return (
        <View style={styles.container}>
            <TransparentHeader title="Estoque" />

            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Feather name="search" size={18} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={activeView === 'products' ? "Buscar produtos" : "Buscar categorias"}
                        placeholderTextColor="#888"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => console.log(`Add new ${activeView === 'products' ? 'product' : 'category'}`)}
                >
                    <Feather name="plus" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.statsCard}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.totalProducts}</Text>
                    <Text style={styles.statLabel}>Produtos</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.totalCategories}</Text>
                    <Text style={styles.statLabel}>Categorias</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.lowStock}</Text>
                    <Text style={[styles.statLabel, stats.lowStock > 0 && { color: '#F44336' }]}>Baixo Estoque</Text>
                </View>
            </View>

            <View style={styles.viewToggleContainer}>
                <TouchableOpacity
                    style={[styles.viewToggleButton, activeView === 'products' && styles.activeViewToggle]}
                    onPress={() => setActiveView('products')}
                >
                    <Feather name="box" size={16} color={activeView === 'products' ? '#fff' : '#666'} />
                    <Text style={[styles.viewToggleText, activeView === 'products' && styles.activeViewToggleText]}>
                        Produtos
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.viewToggleButton, activeView === 'categories' && styles.activeViewToggle]}
                    onPress={() => setActiveView('categories')}
                >
                    <Feather name="tag" size={16} color={activeView === 'categories' ? '#fff' : '#666'} />
                    <Text style={[styles.viewToggleText, activeView === 'categories' && styles.activeViewToggleText]}>
                        Categorias
                    </Text>
                </TouchableOpacity>
            </View>

            {activeView === 'products' && (
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterChip, selectedCategory === 'all' && styles.activeFilterChip]}
                        onPress={() => setSelectedCategory('all')}
                    >
                        <Text style={[styles.filterText, selectedCategory === 'all' && styles.activeFilterText]}>
                            Todos
                        </Text>
                    </TouchableOpacity>

                    {categories.map(category => (
                        <TouchableOpacity
                            key={category.id}
                            style={[styles.filterChip, selectedCategory === category.name && styles.activeFilterChip]}
                            onPress={() => setSelectedCategory(category.name)}
                        >
                            <Text style={[styles.filterText, selectedCategory === category.name && styles.activeFilterText]}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{
                    paddingBottom: bottomPadding,
                    paddingHorizontal: 16
                }}
                showsVerticalScrollIndicator={false}
            >
                {activeView === 'products' ? (
                    <>
                        <View style={styles.productsGrid}>
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    name={product.name}
                                    category={product.category}
                                    price={product.price}
                                    stock={product.stock}
                                    image={product.image}
                                    onPress={() => console.log('View product', product.id)}
                                />
                            ))}
                        </View>

                        {filteredProducts.length === 0 && (
                            <View style={styles.emptyState}>
                                <Feather name="box" size={48} color="#ccc" />
                                <Text style={styles.emptyStateText}>Nenhum produto encontrado</Text>
                            </View>
                        )}
                    </>
                ) : (
                    <>
                        <View style={styles.categoriesGrid}>
                            {categories
                                .filter(category => category.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(category => (
                                    <CategoryCard
                                        key={category.id}
                                        name={category.name}
                                        products={category.products}
                                        image={category.image}
                                        onPress={() => {
                                            setActiveView('products');
                                            setSelectedCategory(category.name);
                                        }}
                                    />
                                ))}
                        </View>

                        {categories.filter(category => category.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                            <View style={styles.emptyState}>
                                <Feather name="tag" size={48} color="#ccc" />
                                <Text style={styles.emptyStateText}>Nenhuma categoria encontrada</Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center',
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginRight: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: '#333',
    },
    addButton: {
        width: 40,
        height: 40,
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 12,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: '70%',
        backgroundColor: '#e0e0e0',
        alignSelf: 'center',
    },
    viewToggleContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    viewToggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#f0f0f0',
    },
    activeViewToggle: {
        backgroundColor: COLORS.secondary,
    },
    viewToggleText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#666',
    },
    activeViewToggleText: {
        color: '#fff',
        fontWeight: '500',
    },
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
    filterText: {
        fontSize: 12,
        color: '#333',
    },
    activeFilterText: {
        color: '#fff',
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingTop: 8,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingTop: 8,
    },
    productCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    productHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    productImageContainer: {
        width: 50,
        height: 50,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    productImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    productCategory: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    stockIndicator: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    stockText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#fff',
    },
    categoryCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        alignItems: 'center',
    },
    categoryImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        marginBottom: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    categoryImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    categoryName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    categoryProducts: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 64,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#888',
        marginTop: 16,
    }
});
import React, { useState } from 'react';
import { View, ScrollView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import TransparentHeader from '@/components/TransparentHeader';

import SearchBar from './SearchBar';
import StatsCard from './StatsCard';
import ViewToggle from './ViewToggle';
import FilterChips from './FilterChips';
import CategoryCard from './CategoryCard';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

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

export default function Stock() {
    const insets = useSafeAreaInsets();
    const [categories, setCategories] = useState(initialCategories);
    const [products, setProducts] = useState(initialProducts);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeView, setActiveView] = useState<'products' | 'categories'>('products');
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

    const handleAddItem = () => {
        console.log(`Add new ${activeView === 'products' ? 'product' : 'category'}`);
    };

    const renderContent = () => {
        if (activeView === 'products') {
            return filteredProducts.length > 0 ? (
                <View style={styles.productsGrid}>
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            {...product}
                            onPress={() => console.log('View product', product.id)}
                        />
                    ))}
                </View>
            ) : (
                <EmptyState
                    icon="box"
                    message="Nenhum produto encontrado"
                />
            );
        }

        const filteredCategories = categories.filter(category =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return filteredCategories.length > 0 ? (
            <View style={styles.categoriesGrid}>
                {filteredCategories.map(category => (
                    <CategoryCard
                        key={category.id}
                        {...category}
                        productTotal={products.filter(p => p.category === category.name).length}
                        onPress={() => {
                            setActiveView('products');
                            setSelectedCategory(category.name);
                        }}
                    />
                ))}
            </View>
        ) : (
            <EmptyState
                icon="tag"
                message="Nenhuma categoria encontrada"
            />
        );
    };

    return (
        <View style={styles.container}>
            <TransparentHeader title="Estoque" />

            <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeView={activeView}
                onAddPress={handleAddItem}
            />

            <StatsCard
                totalProducts={stats.totalProducts}
                totalCategories={stats.totalCategories}
                lowStock={stats.lowStock}
            />

            <ViewToggle
                activeView={activeView}
                onToggleView={setActiveView}
            />

            {activeView === 'products' && (
                <FilterChips
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />
            )}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{
                    paddingBottom: bottomPadding,
                    paddingHorizontal: 16
                }}
                showsVerticalScrollIndicator={false}
            >
                {renderContent()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    // Copy remaining styles from the original component
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
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
});
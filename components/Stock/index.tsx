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
import AddItemModal from './AddItemModal';
import AddProductModal from './AddProductModal';
import AddCategoryModal from './AddCategoryModal';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

type Product = Doc<"products">;
type Category = Doc<"product_categories">;

export default function Stock() {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeView, setActiveView] = useState<'products' | 'categories'>('products');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>();
    const [editingProduct, setEditingProduct] = useState<Product | undefined>();

    const products = useQuery(api.products.getProducts);
    const categories = useQuery(api.products.getProductCategories);

    const bottomPadding = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

    // Sort categories by display order
    const sortedCategories = categories ? [...categories].sort((a, b) =>
        (a.displaOrder ?? 0) - (b.displaOrder ?? 0)
    ) : [];

    const filteredProducts = products?.filter((product: Product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (selectedCategory === 'all') return matchesSearch;
        const category = categories?.find((c: Category) => c._id === product.categoryId);
        return matchesSearch && category?.name === selectedCategory;
    }) ?? [];

    const stats = {
        totalProducts: products?.length ?? 0,
        totalCategories: categories?.length ?? 0,
        lowStock: products?.filter((p: Product) => p.stock < 10).length ?? 0,
        totalValue: (products?.reduce((sum: number, product: Product) =>
            sum + (product.price * product.stock), 0) ?? 0).toFixed(2).replace('.', ','),
    };

    const handleAddItem = () => {
        setShowAddItemModal(true);
    };

    const handleProductAdded = () => {
        setShowAddProductModal(false);
        setEditingProduct(undefined);
    };

    const handleCategoryAdded = () => {
        setShowAddCategoryModal(false);
        setEditingCategory(undefined);
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setShowAddCategoryModal(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setShowAddProductModal(true);
    };

    const renderContent = () => {
        if (activeView === 'products') {
            if (products === undefined) {
                return (
                    <LoadingOverlay
                        size="small"
                        backgroundColor={COLORS.white}
                        overlayOpacity={0.7}
                    />
                );
            }

            return filteredProducts.length > 0 ? (
                <View style={styles.productsGrid}>
                    {filteredProducts.map((product: Product) => (
                        <ProductCard
                            key={product._id}
                            name={product.name}
                            category={categories?.find((c: Category) => c._id === product.categoryId)?.name ?? ''}
                            price={product.price.toString()}
                            stock={product.stock}
                            image={product.image}
                            onPress={() => handleEditProduct(product)}
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

        if (categories === undefined) {
            return (
                <LoadingOverlay
                    size="small"
                    backgroundColor={COLORS.white}
                    overlayOpacity={0.7}
                />
            );
        }

        const filteredCategories = sortedCategories.filter((category: Category) =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return filteredCategories.length > 0 ? (
            <View style={styles.categoriesGrid}>
                {filteredCategories.map((category: Category) => (
                    <CategoryCard
                        key={category._id}
                        name={category.name}
                        productTotal={products?.filter((p: Product) => p.categoryId === category._id).length ?? 0}
                        image="https://placeholder.com/category"
                        onPress={() => handleEditCategory(category)}
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
                    categories={sortedCategories.map((c: Category) => ({ id: c._id, name: c.name }))}
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

            <AddItemModal
                visible={showAddItemModal}
                onClose={() => setShowAddItemModal(false)}
                onSelectProduct={() => setShowAddProductModal(true)}
                onSelectCategory={() => setShowAddCategoryModal(true)}
            />

            <AddProductModal
                visible={showAddProductModal}
                onClose={() => {
                    setShowAddProductModal(false);
                    setEditingProduct(undefined);
                }}
                onProductAdded={handleProductAdded}
                editingProduct={editingProduct}
            />

            <AddCategoryModal
                visible={showAddCategoryModal}
                onClose={() => {
                    setShowAddCategoryModal(false);
                    setEditingCategory(undefined);
                }}
                onCategoryAdded={handleCategoryAdded}
                editingCategory={editingCategory}
            />
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
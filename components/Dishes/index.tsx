import React, { useState, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import TransparentHeader from '@/components/TransparentHeader';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

import HeaderSection from './HeaderSection';
import CategorySection from './CategorySection';
import DishesSection from './DishesSection';
import AddDishModal from './AddDishModal/AddDishModal';
import AddCategoryModal from './AddCategoryModal';

import { useCategories } from './hooks/useCategories';
import { useDishes } from './hooks/useDishes';
import { useRouter } from 'expo-router';

const ITEMS_PER_PAGE = 10;

export default function Dishes() {
    const insets = useSafeAreaInsets();

    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [currentEditDish, setCurrentEditDish] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const searchTimeout = useRef(null);

    const router = useRouter();

    const { categories, currentMaxOrder } = useCategories();
    const {
        dishes,
        isLoading,
        totalDishCount,
        loadMoreDishes,
        hasMore,
        loadingMore,
        resetDishes,
        shouldResetDishes
    } = useDishes({
        activeCategory,
        searchQuery,
        itemsPerPage: ITEMS_PER_PAGE
    });

    const deleteDish = useMutation(api.menu.deleteDish);

    const handleSearchChange = (query) => {
        setIsSearching(true);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        setSearchQuery(query);

        searchTimeout.current = setTimeout(() => {
            resetDishes();

            setTimeout(() => {
                setIsSearching(false);
            }, 300);
        }, 500);
    };

    const handleAddItem = () => {
        setIsEditing(false);
        setCurrentEditDish(null);
        setIsAddModalVisible(true);
    };

    const handleEditDish = (dish) => {
        setIsEditing(true);
        setCurrentEditDish({
            id: dish._id,
            name: dish.name,
            description: dish.description,
            price: dish.price,
            emoji: dish.emoji,
            isFavorite: dish.isFavorite,
            categoryId: dish.categoryId
        });
        setIsAddModalVisible(true);
    };

    const handleDeleteDish = async (dishId) => {
        try {
            await deleteDish({ id: dishId });
            resetDishes();
        } catch (error) {
            console.error('Error deleting dish:', error);
            alert('Erro ao excluir o prato. Tente novamente.');
        }
    };

    const handleScanMenu = () => {
        console.log('Navigating to Menu Generation screen...');
        router.push('/dishes/menu-generation');
    };

    const handleCloseDishModal = () => {
        setIsAddModalVisible(false);
        setCurrentEditDish(null);
        setIsEditing(false);
    };

    const handleDishChange = () => {
        resetDishes();
    };

    const bottomPadding = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

    return (
        <View style={styles.container}>
            <TransparentHeader title="Cardápio" />

            <HeaderSection
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onAddItem={handleAddItem}
                onScanMenu={handleScanMenu}
                isSearching={isSearching}
            />

            <CategorySection
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                onAddCategory={() => setIsCategoryModalVisible(true)}
                dishes={dishes}
            />

            <DishesSection
                dishes={dishes}
                isLoading={isLoading}
                isSearching={isSearching}
                searchQuery={searchQuery}
                totalDishCount={totalDishCount}
                hasMore={hasMore}
                loadingMore={loadingMore}
                loadMoreDishes={loadMoreDishes}
                onEditDish={handleEditDish}
                onDeleteDish={handleDeleteDish}
                onAddItem={handleAddItem}
                bottomPadding={bottomPadding}
            />

            <AddDishModal
                visible={isAddModalVisible}
                categories={categories}
                onClose={handleCloseDishModal}
                onDishAdded={handleDishChange}
                onDishUpdated={handleDishChange}
                editDish={currentEditDish}
                isEditing={isEditing}
            />

            <AddCategoryModal
                visible={isCategoryModalVisible}
                onClose={() => setIsCategoryModalVisible(false)}
                onCategoryAdded={() => { }}
                currentMaxOrder={currentMaxOrder}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
});
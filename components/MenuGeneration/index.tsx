import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import TransparentHeader from '@/components/TransparentHeader';
import { SearchBar } from './SearchBar';
import { CategoryChip } from './CategoryChip';
import { DishCard } from './DishCard';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import AddDishModal from './AddDishModal';
import AddCategoryModal from './AddCategoryModal';

const ITEMS_PER_PAGE = 10;

export default function MenuGeneration() {
    const insets = useSafeAreaInsets();
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [dishes, setDishes] = useState([]);

    const categories = useQuery(api.menu.getDishCategories) || [];
    const paginatedDishes = useQuery(api.dishes.getDishesWithPagination, {
        limit: ITEMS_PER_PAGE,
        skip: skip,
        categoryId: activeCategory,
        searchQuery: searchQuery
    }) || [];

    const totalDishCount = useQuery(api.dishes.getDishesCount, {
        categoryId: activeCategory,
        searchQuery: searchQuery
    }) || 0;

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [currentEditDish, setCurrentEditDish] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const deleteDish = useMutation(api.menu.deleteDish);

    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

    const currentMaxOrder = Math.max(...categories.map(c => c.order), 0);

    useEffect(() => {
        if (paginatedDishes.length > 0) {
            if (skip === 0) {
                setDishes(paginatedDishes);
            } else {
                setDishes(prevDishes => [...prevDishes, ...paginatedDishes]);
            }
            setHasMore(paginatedDishes.length === ITEMS_PER_PAGE);
            setLoadingMore(false);
            setIsLoading(false);
        } else if (skip === 0) {
            setDishes([]);
            setHasMore(false);
            setIsLoading(false);
        } else if (paginatedDishes.length === 0) {
            setHasMore(false);
            setLoadingMore(false);
        }
    }, [paginatedDishes, skip]);

    useEffect(() => {
        setSkip(0);
        setHasMore(true);
        setIsLoading(true);
    }, [activeCategory, searchQuery]);

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
            setDishes(prevDishes => prevDishes.filter(dish => dish._id !== dishId));
        } catch (error) {
            console.error('Error deleting dish:', error);
            alert('Erro ao excluir o prato. Tente novamente.');
        }
    };

    const handleLoadMore = useCallback(() => {
        if (hasMore && !loadingMore) {
            setLoadingMore(true);
            setSkip(prevSkip => prevSkip + ITEMS_PER_PAGE);
        }
    }, [hasMore, loadingMore]);

    const handleScroll = useCallback(({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const paddingToBottom = 20;
        if (layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom && !loadingMore && hasMore) {
            handleLoadMore();
        }
    }, [handleLoadMore, loadingMore, hasMore]);

    const handleScanMenu = () => {
        console.log('Scan menu from image');
    };

    const bottomPadding = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

    const transformedCategories = categories.map(category => ({
        id: category._id,
        name: category.name,
        dishCount: dishes.filter(dish => dish.categoryId === category._id).length
    }));

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <Text>Carregando cardápio...</Text>
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 16 }} />
            </View>
        );
    }

    const itemCountDisplay = dishes.length === totalDishCount
        ? `${totalDishCount} itens`
        : `${dishes.length} de ${totalDishCount} itens`;

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
                onScroll={handleScroll}
                scrollEventThrottle={16}
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
                    onAddCategoryPress={() => setIsCategoryModalVisible(true)}
                />

                <View style={styles.dishesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Itens do Cardápio</Text>
                        <Text style={styles.itemCount}>{itemCountDisplay}</Text>
                    </View>

                    {dishes.length > 0 ? (
                        dishes.map(dish => (
                            <DishCard
                                key={dish._id}
                                id={dish._id}
                                name={dish.name}
                                price={dish.price.toFixed(2).replace('.', ',')}
                                description={dish.description}
                                emoji={dish.emoji}
                                isFavorite={dish.isFavorite}
                                onEdit={() => handleEditDish(dish)}
                                onDelete={handleDeleteDish}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>
                                {searchQuery ? 'Nenhum item encontrado para essa busca.' : 'Sem itens no cardápio.'}
                            </Text>
                        </View>
                    )}

                    {loadingMore && (
                        <View style={styles.loadingMoreContainer}>
                            <ActivityIndicator size="small" color={COLORS.primary} />
                            <Text style={styles.loadingMoreText}>Carregando mais itens...</Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.addDishButton} onPress={handleAddItem}>
                        <Feather name="plus" size={18} color="#fff" />
                        <Text style={styles.addDishText}>Adicionar Item</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <AddDishModal
                visible={isAddModalVisible}
                categories={categories}
                onClose={() => {
                    setIsAddModalVisible(false);
                    setCurrentEditDish(null);
                    setIsEditing(false);
                }}
                onDishAdded={() => {
                    setSkip(0);
                    setHasMore(true);
                }}
                onDishUpdated={() => {
                    setSkip(0);
                    setHasMore(true);
                }}
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
    emptyState: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        color: '#888',
        textAlign: 'center',
    },
    loadingMoreContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
    },
    loadingMoreText: {
        marginLeft: 8,
        color: '#666',
    },
});
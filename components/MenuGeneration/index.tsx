import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import TransparentHeader from '@/components/TransparentHeader';
import { SearchBar } from './SearchBar';
import { CategoryChip } from './CategoryChip';
import { DishCard } from './DishCard';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import AddDishModal from './AddDishModal/AddDishModal';
import AddCategoryModal from './AddCategoryModal';

const ITEMS_PER_PAGE = 10;

export default function MenuGeneration() {
    const insets = useSafeAreaInsets();
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [dishes, setDishes] = useState([]);

    const shouldResetDishes = useRef(false);
    const searchTimeout = useRef(null);

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
        shouldResetDishes.current = true;
        setSkip(0);
        setHasMore(true);
        setIsLoading(true);
    }, [activeCategory]);

    const handleSearchChange = (query) => {
        setIsSearching(true);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        setSearchQuery(query);

        searchTimeout.current = setTimeout(() => {
            shouldResetDishes.current = true;
            setSkip(0);
            setHasMore(true);

            setTimeout(() => {
                setIsSearching(false);
            }, 300);
        }, 500);
    };

    useEffect(() => {
        if (paginatedDishes.length > 0) {
            if (skip === 0 || shouldResetDishes.current) {
                setDishes(paginatedDishes);
                shouldResetDishes.current = false;
                setIsLoading(false);
            } else {
                setDishes(prevDishes => [...prevDishes, ...paginatedDishes]);
            }
            setHasMore(paginatedDishes.length === ITEMS_PER_PAGE);
            setLoadingMore(false);
        } else if (skip === 0 || shouldResetDishes.current) {
            setDishes([]);
            shouldResetDishes.current = false;
            setHasMore(false);
            setIsLoading(false);
        } else if (paginatedDishes.length === 0) {
            setHasMore(false);
            setLoadingMore(false);
        }
    }, [paginatedDishes, skip]);

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

    const handleScanMenu = () => {
        console.log('Scan menu from image');
    };

    const bottomPadding = 60 + (Platform.OS === 'ios' ? insets.bottom : 0);

    const transformedCategories = categories.map(category => ({
        id: category._id,
        name: category.name,
        dishCount: dishes.filter(dish => dish.categoryId === category._id).length
    }));

    const renderDishItem = useCallback(({ item }) => (
        <DishCard
            key={item._id}
            id={item._id}
            name={item.name}
            price={item.price.toFixed(2).replace('.', ',')}
            description={item.description}
            emoji={item.emoji}
            isFavorite={item.isFavorite}
            onEdit={() => handleEditDish(item)}
            onDelete={handleDeleteDish}
        />
    ), []);

    const ListEmptyComponent = useCallback(() => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
                {searchQuery ? 'Nenhum item encontrado para essa busca.' : 'Sem itens no cardápio.'}
            </Text>
        </View>
    ), [searchQuery]);

    const ListFooterComponent = useCallback(() => (
        <>
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
        </>
    ), [loadingMore, handleAddItem]);

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
                onSearchChange={handleSearchChange}
                onAddItem={handleAddItem}
                onScanMenu={handleScanMenu}
                isSearching={isSearching}
            />

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
                        onAddCategoryPress={() => setIsCategoryModalVisible(true)}
                    />
                </ScrollView>
            </View>

            <View style={styles.dishesHeaderContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Itens do Cardápio</Text>
                    <Text style={styles.itemCount}>{itemCountDisplay}</Text>
                </View>
            </View>

            {isSearching ? (
                <View style={styles.searchingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.searchingText}>Buscando itens...</Text>
                </View>
            ) : (
                <FlatList
                    data={dishes}
                    renderItem={renderDishItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingBottom: bottomPadding }}
                    onEndReached={hasMore ? handleLoadMore : null}
                    onEndReachedThreshold={0.3}
                    ListEmptyComponent={ListEmptyComponent}
                    ListFooterComponent={ListFooterComponent}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    initialNumToRender={5}
                    windowSize={10}
                />
            )}

            <AddDishModal
                visible={isAddModalVisible}
                categories={categories}
                onClose={() => {
                    setIsAddModalVisible(false);
                    setCurrentEditDish(null);
                    setIsEditing(false);
                }}
                onDishAdded={() => {
                    shouldResetDishes.current = true;
                    setSkip(0);
                    setHasMore(true);
                }}
                onDishUpdated={() => {
                    shouldResetDishes.current = true;
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
    categoriesContainer: {
        backgroundColor: COLORS.background,
    },
    categoryScrollContent: {
        paddingHorizontal: 8,
    },
    dishesHeaderContainer: {
        backgroundColor: COLORS.background,
    },
    searchingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    searchingText: {
        marginTop: 12,
        color: '#666',
        fontSize: 16,
    },
    addDishButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.secondary,
        borderRadius: 8,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
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
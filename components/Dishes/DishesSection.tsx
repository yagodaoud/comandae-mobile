import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { DishCard } from './DishCard';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { Id } from '@/convex/_generated/dataModel';

interface Dish {
    _id: Id<'dishes'>;
    name: string;
    description: string;
    price: number;
    emoji: string;
    isFavorite: boolean;
    categoryId: Id<'dish_categories'>;
}

interface DishesSectionProps {
    dishes: Dish[];
    isLoading: boolean;
    isSearching: boolean;
    searchQuery: string;
    totalDishCount: number;
    hasMore: boolean;
    loadingMore: boolean;
    loadMoreDishes: () => void;
    onEditDish: (dish: Dish) => void;
    onDeleteDish: (dishId: Id<'dishes'>) => void;
    onAddItem: () => void;
    bottomPadding: number;
}

const DishesSection = ({
    dishes,
    isLoading,
    isSearching,
    searchQuery,
    totalDishCount,
    hasMore,
    loadingMore,
    loadMoreDishes,
    onEditDish,
    onDeleteDish,
    onAddItem,
    bottomPadding
}: DishesSectionProps) => {
    const renderDishItem = useCallback(({ item }: { item: Dish }) => {
        try {
            return (
                <DishCard
                    key={item._id}
                    id={item._id}
                    name={item.name}
                    price={item.price.toFixed(2).replace('.', ',')}
                    description={item.description}
                    emoji={item.emoji}
                    isFavorite={item.isFavorite}
                    onEdit={() => onEditDish(item)}
                    onDelete={() => onDeleteDish(item._id)}
                />
            );
        } catch (error) {
            console.error('Error rendering dish item:', error);
            return null;
        }
    }, [onEditDish, onDeleteDish]);

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
                    <LoadingOverlay
                        size="small"
                        backgroundColor={COLORS.white}
                        overlayOpacity={0.7}
                    />
                    <Text style={styles.loadingMoreText}>Carregando mais itens...</Text>
                </View>
            )}
            <TouchableOpacity style={styles.addDishButton} onPress={onAddItem}>
                <Feather name="plus" size={18} color="#fff" />
                <Text style={styles.addDishText}>Adicionar Item</Text>
            </TouchableOpacity>
        </>
    ), [loadingMore, onAddItem]);

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <LoadingOverlay
                    size="small"
                    backgroundColor={COLORS.white}
                    overlayOpacity={0.7}
                />
            </View>
        );
    }

    const itemCountDisplay = dishes.length === totalDishCount
        ? `${totalDishCount} itens`
        : `${dishes.length} de ${totalDishCount} itens`;

    return (
        <>
            <View style={styles.dishesHeaderContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Itens do Cardápio</Text>
                    <Text style={styles.itemCount}>{itemCountDisplay}</Text>
                </View>
            </View>

            {isSearching ? (
                <View style={styles.searchingContainer}>
                    <LoadingOverlay
                        size="small"
                        backgroundColor={COLORS.white}
                        overlayOpacity={0.7}
                    />
                    <Text style={styles.searchingText}>Buscando itens...</Text>
                </View>
            ) : (
                <FlatList
                    data={dishes}
                    renderItem={renderDishItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingBottom: bottomPadding }}
                    onEndReached={hasMore ? loadMoreDishes : null}
                    onEndReachedThreshold={0.3}
                    ListEmptyComponent={ListEmptyComponent}
                    ListFooterComponent={ListFooterComponent}
                    removeClippedSubviews={Platform.OS === 'android'}
                    maxToRenderPerBatch={3}
                    initialNumToRender={3}
                    windowSize={5}
                    updateCellsBatchingPeriod={50}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
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

export default DishesSection;
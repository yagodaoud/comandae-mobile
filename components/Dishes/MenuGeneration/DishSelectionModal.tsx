import React, { useMemo, useCallback, memo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Animated, Platform, ScrollView } from 'react-native';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface DishSelectionModalProps {
    visible: boolean;
    matchedDishes: Doc<'dishes'>[];
    allDishes: Doc<'dishes'>[];
    selectedDishIds: Set<string>;
    onToggleDish: (dishId: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

interface DishItemProps {
    dish: Doc<'dishes'>;
    isSelected: boolean;
    onToggle: (dishId: string) => void;
}

const DishItem = memo(({ dish, isSelected, onToggle }: DishItemProps) => {
    const scaleAnim = new Animated.Value(1);

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => onToggle(dish._id));
    };

    return (
        <TouchableOpacity
            style={styles.dishItem}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Animated.View style={[styles.dishItemContent, { transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.checkboxContainer}>
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggle(dish._id)}
                    />
                </View>
                <View style={styles.dishInfo}>
                    <Text style={styles.dishEmoji}>{dish.emoji || '🍽️'}</Text>
                    <Text style={styles.dishName} numberOfLines={2}>{dish.name}</Text>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
});

interface CategorySectionProps {
    category: Doc<'dish_categories'>;
    dishes: Doc<'dishes'>[];
    selectedDishIds: Set<string>;
    onToggleDish: (dishId: string) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

const CategorySection = memo(({
    category,
    dishes,
    selectedDishIds,
    onToggleDish,
    isExpanded,
    onToggleExpand
}: CategorySectionProps) => {
    const [height] = useState(new Animated.Value(0));
    const [isAnimating, setIsAnimating] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        if (isAnimating) return;

        setIsAnimating(true);
        Animated.timing(height, {
            toValue: isExpanded ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start(() => setIsAnimating(false));
    }, [isExpanded]);

    if (dishes.length === 0) return null;

    // Memoize the dishes list to prevent unnecessary re-renders
    const dishItems = useMemo(() =>
        dishes.map(dish => (
            <DishItem
                key={dish._id}
                dish={dish}
                isSelected={selectedDishIds.has(dish._id)}
                onToggle={onToggleDish}
            />
        )),
        [dishes, selectedDishIds, onToggleDish]
    );

    return (
        <View style={styles.categorySection}>
            <View style={styles.categoryHeaderContainer}>
                <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={onToggleExpand}
                    activeOpacity={0.7}
                >
                    <View style={styles.categoryTitleContainer}>
                        <Text style={styles.categoryTitle}>{category.name}</Text>
                        <Text style={styles.dishCount}>{dishes.length} pratos</Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={24}
                        color={COLORS.black}
                    />
                </TouchableOpacity>
            </View>
            <Animated.View
                style={[
                    styles.dishesContainer,
                    {
                        height: height.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, contentHeight || dishes.length * 60]
                        }),
                        backgroundColor: isExpanded ? COLORS.white : 'transparent'
                    }
                ]}
            >
                <View
                    style={styles.dishesList}
                    onLayout={(event) => {
                        const { height } = event.nativeEvent.layout;
                        setContentHeight(height);
                    }}
                >
                    {dishItems}
                </View>
            </Animated.View>
        </View>
    );
});

export const DishSelectionModal: React.FC<DishSelectionModalProps> = ({
    visible,
    matchedDishes,
    allDishes,
    selectedDishIds,
    onToggleDish,
    onConfirm,
    onCancel,
}) => {
    const categories = useQuery(api.dishes.listCategories);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (categories && categories.length > 0) {
            setExpandedCategories(new Set([categories[0]._id]));
        }
    }, [categories]);

    const dishesByCategory = useMemo(() => {
        if (!categories) return new Map();

        // Pre-allocate the map with empty arrays
        const grouped = new Map(
            categories.map(category => [category._id, []])
        );

        // Process matched dishes first (usually smaller set)
        for (const dish of matchedDishes) {
            grouped.get(dish.categoryId)?.push(dish);
        }

        // Process remaining dishes only if needed
        if (matchedDishes.length < allDishes.length) {
            const matchedIds = new Set(matchedDishes.map(d => d._id));
            for (const dish of allDishes) {
                if (!matchedIds.has(dish._id)) {
                    grouped.get(dish.categoryId)?.push(dish);
                }
            }
        }

        return grouped;
    }, [categories, matchedDishes, allDishes]);

    const handleToggleCategory = useCallback((categoryId: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    }, []);

    const renderCategory = useCallback(({ item: category }: { item: Doc<'dish_categories'> }) => {
        const dishes = dishesByCategory.get(category._id) || [];
        return (
            <CategorySection
                category={category}
                dishes={dishes}
                selectedDishIds={selectedDishIds}
                onToggleDish={onToggleDish}
                isExpanded={expandedCategories.has(category._id)}
                onToggleExpand={() => handleToggleCategory(category._id)}
            />
        );
    }, [dishesByCategory, selectedDishIds, onToggleDish, expandedCategories, handleToggleCategory]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Selecione os pratos</Text>
                        <Text style={styles.modalSubtitle}>
                            {selectedDishIds.size} pratos selecionados
                        </Text>
                    </View>

                    <View style={styles.categoriesContainer}>
                        <FlatList
                            data={categories}
                            renderItem={renderCategory}
                            keyExtractor={category => category._id}
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle={styles.categoriesList}
                            removeClippedSubviews={true}
                            initialNumToRender={3}
                            maxToRenderPerBatch={3}
                            windowSize={3}
                            updateCellsBatchingPeriod={50}
                            getItemLayout={(data, index) => ({
                                length: 80, // Approximate height of each category
                                offset: 80 * index,
                                index,
                            })}
                        />
                    </View>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmButtonText}>Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        width: '90%',
        height: '85%',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    modalHeader: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        color: COLORS.gray[500],
    },
    categoriesContainer: {
        flex: 1,

    },
    categoriesList: {
        padding: 16,
    },
    categorySection: {
        marginBottom: 12,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    categoryHeaderContainer: {
        backgroundColor: COLORS.white,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    categoryTitleContainer: {
        flex: 1,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 2,
    },
    dishCount: {
        fontSize: 12,
        color: COLORS.gray[500],
    },
    dishesContainer: {
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    dishesList: {
        padding: 16,
        backgroundColor: COLORS.white,
    },
    dishItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        minHeight: 48,
    },
    dishItemContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checkboxContainer: {
        marginRight: 16,
    },
    dishInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    dishEmoji: {
        fontSize: 20,
    },
    dishName: {
        fontSize: 15,
        color: COLORS.black,
        flex: 1,
        lineHeight: 20,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
        gap: 12,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.tertiary,
    },
    confirmButton: {
        backgroundColor: COLORS.secondary,
    },
    cancelButtonText: {
        color: COLORS.black,
        fontSize: 15,
        fontWeight: '500',
    },
    confirmButtonText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '500',
    },
}); 
import { useState, useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
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

interface UseDishesProps {
    activeCategory: Id<'dish_categories'> | null;
    searchQuery: string | null;
    itemsPerPage: number;
}

interface UseAllDishesProps {
    activeCategory?: Id<'dish_categories'> | null;
    searchQuery?: string | null;
}

export const useDishes = ({
    activeCategory,
    searchQuery,
    itemsPerPage
}: UseDishesProps) => {
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const allDishes = useRef<Dish[]>([]);

    // Get all dishes filtered by category
    const categoryDishes = useQuery(api.dishes.getDishesByCategory, {
        categoryId: activeCategory
    });

    // Update all dishes when category or search query changes
    useEffect(() => {
        try {
            if (categoryDishes) {
                let filteredDishes = categoryDishes;

                // Apply search filter if search query exists
                if (searchQuery && searchQuery.trim() !== '') {
                    const query = searchQuery.toLowerCase().trim();
                    filteredDishes = categoryDishes.filter(dish =>
                        dish.name.toLowerCase().includes(query) ||
                        dish.description.toLowerCase().includes(query)
                    );
                }

                // Sort alphabetically only if there's an active filter
                if (searchQuery?.trim() || activeCategory) {
                    filteredDishes = [...filteredDishes].sort((a, b) =>
                        a.name.localeCompare(b.name)
                    );
                }

                allDishes.current = filteredDishes;
                setSkip(0);
                setHasMore(filteredDishes.length > itemsPerPage);
                setDishes(filteredDishes.slice(0, itemsPerPage));
            } else {
                allDishes.current = [];
                setDishes([]);
                setHasMore(false);
            }
            setIsLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
            setIsLoading(false);
        }
    }, [categoryDishes, searchQuery, itemsPerPage, activeCategory]);

    const loadMoreDishes = () => {
        try {
            if (hasMore && !loadingMore) {
                setLoadingMore(true);
                const newSkip = skip + itemsPerPage;
                const newDishes = allDishes.current.slice(newSkip, newSkip + itemsPerPage);

                setDishes(prev => [...prev, ...newDishes]);
                setSkip(newSkip);
                setHasMore(newSkip + itemsPerPage < allDishes.current.length);
                setLoadingMore(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
            setLoadingMore(false);
        }
    };

    const resetDishes = () => {
        try {
            setSkip(0);
            setHasMore(allDishes.current.length > itemsPerPage);
            setDishes(allDishes.current.slice(0, itemsPerPage));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        }
    };

    return {
        dishes,
        isLoading,
        totalDishCount: allDishes.current.length,
        loadMoreDishes,
        hasMore,
        loadingMore,
        resetDishes,
        shouldResetDishes: { current: false },
        error
    };
};

export const useAllDishes = ({
}: UseAllDishesProps = {}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [error, setError] = useState<Error | null>(null);

    const allDishes = useQuery(api.dishes.getAllDishes);

    useEffect(() => {
        try {
            if (allDishes !== undefined) {
                setDishes(allDishes);
                setIsLoading(false);
                setError(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
            setIsLoading(false);
        }
    }, [allDishes]);

    return {
        dishes: dishes || [],
        isLoading,
        error
    };
};
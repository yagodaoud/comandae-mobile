import { useState, useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

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
    const [dishes, setDishes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const shouldResetDishes = useRef(false);

    const paginatedDishes = useQuery(api.dishes.getDishesWithPagination, {
        limit: itemsPerPage,
        skip: skip,
        categoryId: activeCategory || undefined,
        searchQuery: searchQuery || undefined
    }) || [];

    const totalDishCount = useQuery(api.dishes.getDishesCount, {
        categoryId: activeCategory || undefined,
        searchQuery: searchQuery || undefined
    }) || 0;

    useEffect(() => {
        shouldResetDishes.current = true;
        setSkip(0);
        setHasMore(true);
        setIsLoading(true);
    }, [activeCategory]);

    useEffect(() => {
        if (paginatedDishes.length > 0) {
            if (skip === 0 || shouldResetDishes.current) {
                setDishes(paginatedDishes);
                shouldResetDishes.current = false;
                setIsLoading(false);
            } else {
                setDishes(prevDishes => [...prevDishes, ...paginatedDishes]);
            }
            setHasMore(paginatedDishes.length === itemsPerPage);
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
    }, [paginatedDishes, skip, itemsPerPage]);

    const loadMoreDishes = () => {
        if (hasMore && !loadingMore) {
            setLoadingMore(true);
            setSkip(prevSkip => prevSkip + itemsPerPage);
        }
    };

    const resetDishes = () => {
        shouldResetDishes.current = true;
        setSkip(0);
        setHasMore(true);
    };

    return {
        dishes,
        isLoading,
        totalDishCount,
        loadMoreDishes,
        hasMore,
        loadingMore,
        resetDishes,
        shouldResetDishes
    };
};

export const useAllDishes = ({
}: UseAllDishesProps = {}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [dishes, setDishes] = useState<any[]>([]);

    const allDishes = useQuery(api.dishes.getAllDishes, {
    }) || [];

    useEffect(() => {
        setDishes(allDishes);
        setIsLoading(false);
    }, [allDishes]);

    return {
        dishes,
        isLoading
    };
};
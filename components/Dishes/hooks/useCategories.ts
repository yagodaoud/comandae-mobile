import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export const useCategories = () => {
    const categories = useQuery(api.menu.getDishCategories) || [];
    const currentMaxOrder = Math.max(...categories.map(c => c.order), 0);

    return {
        categories,
        currentMaxOrder
    };
};
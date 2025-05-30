import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDishesWithPagination = query({
    args: {
        limit: v.number(),
        skip: v.number(),
        categoryId: v.optional(v.union(v.id("dish_categories"), v.null())),
        searchQuery: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        try {
            const { limit, skip, categoryId, searchQuery = "" } = args;

            // Get all dishes
            const dishes = await ctx.db.query("dishes").collect();

            // Get categories for ordering
            const categories = await ctx.db.query("dish_categories").collect();
            const categoryOrderMap: Record<string, number> = {};
            categories.forEach(category => {
                categoryOrderMap[category._id.toString()] = category.order;
            });

            // Filter by category if provided
            let filteredDishes = categoryId
                ? dishes.filter(dish => dish.categoryId === categoryId)
                : dishes;

            // Filter by search query if provided
            if (searchQuery) {
                const lowerSearchQuery = searchQuery.toLowerCase();
                filteredDishes = filteredDishes.filter(dish =>
                    dish.name.toLowerCase().includes(lowerSearchQuery) ||
                    (dish.description && dish.description.toLowerCase().includes(lowerSearchQuery))
                );
            }

            // Sort dishes by category order and creation time
            filteredDishes.sort((a, b) => {
                const orderA = categoryOrderMap[a.categoryId.toString()] ?? Number.MAX_SAFE_INTEGER;
                const orderB = categoryOrderMap[b.categoryId.toString()] ?? Number.MAX_SAFE_INTEGER;

                if (orderA !== orderB) {
                    return orderA - orderB;
                }

                return b._creationTime - a._creationTime;
            });

            // Apply pagination
            return filteredDishes.slice(skip, skip + limit);
        } catch (error) {
            console.error("Error in getDishesWithPagination:", error);
            return [];
        }
    }
});

export const getDishesCount = query({
    args: {
        categoryId: v.optional(v.union(v.id("dish_categories"), v.null())),
        searchQuery: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        try {
            const { categoryId, searchQuery = "" } = args;

            // Get all dishes
            const dishes = await ctx.db.query("dishes").collect();

            // Filter by category if provided
            let filteredDishes = categoryId
                ? dishes.filter(dish => dish.categoryId === categoryId)
                : dishes;

            // Filter by search query if provided
            if (searchQuery) {
                const lowerSearchQuery = searchQuery.toLowerCase();
                filteredDishes = filteredDishes.filter(dish =>
                    dish.name.toLowerCase().includes(lowerSearchQuery) ||
                    (dish.description && dish.description.toLowerCase().includes(lowerSearchQuery))
                );
            }

            return filteredDishes.length;
        } catch (error) {
            console.error("Error in getDishesCount:", error);
            return 0;
        }
    }
});

export const getAllDishes = query({
    args: {},
    handler: async (ctx) => {
        try {
            return await ctx.db.query("dishes").collect();
        } catch (error) {
            console.error("Error in getAllDishes:", error);
            return [];
        }
    },
});

export const listCategories = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("dish_categories").collect();
    },
});

export const getDishCount = query({
    handler: async (ctx) => {
        const count = await ctx.db.query("dishes").collect();
        return count.length;
    },
});

export const getLowStockDishes = query({
    args: {
        threshold: v.number(),
    },
    handler: async (ctx, args) => {
        const products = await ctx.db
            .query("products")
            .filter(q => q.lt(q.field("stock"), args.threshold))
            .filter(q => q.eq(q.field("hasInfiniteStock"), false))
            .collect();
        return products.length;
    },
});

export const getOneDish = query({
    args: {},
    handler: async (ctx) => {
        try {
            const dishes = await ctx.db.query("dishes").collect();
            return dishes[0] || null;
        } catch (error) {
            console.error("Error in getOneDish:", error);
            return null;
        }
    }
});

export const getTenDishes = query({
    args: {},
    handler: async (ctx) => {
        try {
            const dishes = await ctx.db.query("dishes").collect();
            return dishes.slice(0, 10);
        } catch (error) {
            console.error("Error in getTenDishes:", error);
            return [];
        }
    }
});

export const getDishesByCategory = query({
    args: {
        categoryId: v.optional(v.union(v.id("dish_categories"), v.null())),
    },
    handler: async (ctx, args) => {
        try {
            const { categoryId } = args;
            const dishes = await ctx.db.query("dishes").collect();

            // Filter by category if provided
            const filteredDishes = categoryId
                ? dishes.filter(dish => dish.categoryId === categoryId)
                : dishes;

            // Sort by creation time (newest first)
            return filteredDishes.sort((a, b) => b._creationTime - a._creationTime);
        } catch (error) {
            console.error("Error in getDishesByCategory:", error);
            return [];
        }
    }
});
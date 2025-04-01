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
        const { limit, skip, categoryId, searchQuery = "" } = args;

        const categories = await ctx.db.query("dish_categories").collect();

        const categoryOrderMap: Record<string, number> = {};

        categories.forEach(category => {
            categoryOrderMap[category._id.toString()] = category.order;
        });

        let dishesQuery = categoryId
            ? ctx.db.query("dishes").withIndex("by_category", q => q.eq("categoryId", categoryId))
            : ctx.db.query("dishes");

        let dishes = await dishesQuery.collect();

        if (searchQuery) {
            dishes = dishes.filter(dish =>
                dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        dishes.sort((a, b) => {
            const orderA = categoryOrderMap[a.categoryId.toString()] ?? Number.MAX_SAFE_INTEGER;
            const orderB = categoryOrderMap[b.categoryId.toString()] ?? Number.MAX_SAFE_INTEGER;

            if (orderA !== orderB) {
                return orderA - orderB;
            }

            return b._creationTime - a._creationTime;
        });

        return dishes.slice(skip, skip + limit);
    }
});

export const getDishesCount = query({
    args: {
        categoryId: v.optional(v.union(v.id("dish_categories"), v.null())),
        searchQuery: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const { categoryId, searchQuery = "" } = args;

        let dishesQuery = categoryId
            ? ctx.db.query("dishes").withIndex("by_category", q => q.eq("categoryId", categoryId))
            : ctx.db.query("dishes");

        let dishes = await dishesQuery.collect();

        if (searchQuery) {
            dishes = dishes.filter(dish =>
                dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        return dishes.length;
    }
});
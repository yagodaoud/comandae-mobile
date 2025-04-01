import { query } from "./_generated/server";
import { v } from "convex/values";

// Add this function to your menu.js in the convex folder

export const getDishesWithPagination = query({
    args: {
        limit: v.number(),
        skip: v.number(),
        categoryId: v.optional(v.union(v.id("dish_categories"), v.null())),
        searchQuery: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const { limit, skip, categoryId, searchQuery = "" } = args;

        // Initialize the query with the index if filtering by category
        let dishesQuery = categoryId
            ? ctx.db.query("dishes").withIndex("by_category", q => q.eq("categoryId", categoryId))
            : ctx.db.query("dishes");

        // Get all results that match the filters
        let dishes = await dishesQuery.collect();

        // Apply search filter if provided
        if (searchQuery) {
            dishes = dishes.filter(dish =>
                dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Sort by creation time (newest first)
        dishes.sort((a, b) => b._creationTime - a._creationTime);

        // Apply pagination
        return dishes.slice(skip, skip + limit);
    }
});
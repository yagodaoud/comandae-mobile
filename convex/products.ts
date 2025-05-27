import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getProducts = query({
    handler: async (ctx) => {
        const products = await ctx.db.query("products").collect();
        return products;
    },
});

export const getProductCategories = query({
    handler: async (ctx) => {
        const categories = await ctx.db.query("product_categories").collect();
        return categories;
    },
});

export const getProductsByCategory = query({
    args: { categoryId: v.id("product_categories") },
    handler: async (ctx, args) => {
        const products = await ctx.db
            .query("products")
            .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
            .collect();
        return products;
    },
});

export const getCategories = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("product_categories")
            .order("asc")
            .collect();
    },
});

export const createProduct = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        price: v.float64(),
        stock: v.float64(),
        image: v.string(),
        categoryId: v.id("product_categories"),
        hasInfiniteStock: v.boolean(),
        hasCustomPrice: v.boolean(),
        notStack: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("products", args);
        return id;
    },
});

export const createProductCategory = mutation({
    args: {
        name: v.string(),
        displaOrder: v.number(),
    },
    handler: async (ctx, args) => {
        const categoryId = await ctx.db.insert("product_categories", {
            name: args.name,
            displaOrder: args.displaOrder,
        });
        return categoryId;
    },
});

export const updateProductCategory = mutation({
    args: {
        id: v.id("product_categories"),
        name: v.string(),
        displaOrder: v.number(),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
        return id;
    },
});

export const updateProduct = mutation({
    args: {
        id: v.id("products"),
        name: v.string(),
        description: v.string(),
        price: v.float64(),
        stock: v.float64(),
        image: v.string(),
        categoryId: v.id("product_categories"),
        hasInfiniteStock: v.boolean(),
        hasCustomPrice: v.boolean(),
        notStack: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        await ctx.db.patch(id, data);
    },
}); 
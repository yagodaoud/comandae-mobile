import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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

export const createProduct = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        price: v.number(),
        stock: v.number(),
        image: v.string(),
        categoryId: v.id("product_categories"),
        hasInfiniteStock: v.boolean(),
        hasCustomPrice: v.boolean(),
    },
    handler: async (ctx, args) => {
        const productId = await ctx.db.insert("products", {
            name: args.name,
            description: args.description,
            price: args.price,
            stock: args.stock,
            image: args.image,
            categoryId: args.categoryId,
            hasInfiniteStock: args.hasInfiniteStock,
            hasCustomPrice: args.hasCustomPrice,
        });
        return productId;
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
        price: v.number(),
        stock: v.number(),
        image: v.string(),
        categoryId: v.id("product_categories"),
        hasInfiniteStock: v.boolean(),
        hasCustomPrice: v.boolean(),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
        return id;
    },
}); 
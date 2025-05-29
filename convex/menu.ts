import { mutation, query } from './_generated/server';
import { v } from "convex/values";

export const getDishCategories = query({
  handler: async (ctx) => {
    return await ctx.db.query('dish_categories')
      .withIndex("by_order")
      .order('asc')
      .collect();
  },
});

export const getDishes = query({
  handler: async (ctx) => {
    return await ctx.db.query('dishes')
      .withIndex("by_category")
      .order('asc')
      .collect();
  },
});

export const createDish = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    emoji: v.string(),
    isFavorite: v.boolean(),
    categoryId: v.id("dish_categories"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dishes", {
      name: args.name,
      description: args.description,
      price: args.price,
      emoji: args.emoji,
      isFavorite: args.isFavorite || false,
      categoryId: args.categoryId,
    });
  },
});

export const createDishCategory = mutation({
  args: {
    name: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dish_categories", {
      name: args.name,
      order: args.order,
    });
  },
});

export const updateCategoryOrder = mutation({
  args: {
    categoryId: v.id("dish_categories"),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.categoryId, {
      order: args.newOrder
    });
  },
});

export const updateCategoryName = mutation({
  args: {
    id: v.id("dish_categories"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      name: args.name
    });
  },
});

export const deleteCategory = mutation({
  args: {
    id: v.id("dish_categories"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const updateDish = mutation({
  args: {
    id: v.id("dishes"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    emoji: v.string(),
    isFavorite: v.boolean(),
    categoryId: v.id("dish_categories"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      price: args.price,
      emoji: args.emoji,
      isFavorite: args.isFavorite,
      categoryId: args.categoryId,
    });
  },
});

export const deleteDish = mutation({
  args: {
    id: v.id("dishes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Get active header
export const getActiveHeader = query({
  handler: async (ctx) => {
    const header = await ctx.db
      .query("menu_headers")
      .first();
    return header;
  },
});

// Get active footer
export const getActiveFooter = query({
  handler: async (ctx) => {
    const footer = await ctx.db
      .query("menu_footers")
      .first();
    return footer;
  },
});

// Create or update header
export const upsertHeader = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Get existing header
    const existingHeader = await ctx.db
      .query("menu_headers")
      .first();

    if (existingHeader) {
      // Update existing header
      return await ctx.db.patch(existingHeader._id, {
        content: args.content,
      });
    } else {
      // Create new header
      return await ctx.db.insert("menu_headers", {
        content: args.content,
      });
    }
  },
});

// Create or update footer
export const upsertFooter = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Get existing footer
    const existingFooter = await ctx.db
      .query("menu_footers")
      .first();

    if (existingFooter) {
      // Update existing footer
      return await ctx.db.patch(existingFooter._id, {
        content: args.content,
      });
    } else {
      // Create new footer
      return await ctx.db.insert("menu_footers", {
        content: args.content,
      });
    }
  },
});
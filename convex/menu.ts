import { mutation, query } from './_generated/server';
import { v } from "convex/values";

export const getDishCategories = query({
  handler: async (ctx) => {
    return await ctx.db.query('dish_categories')
      .order('asc')
      .collect();
  },
});

export const getDishes = query({
  handler: async (ctx) => {
    return await ctx.db.query('dishes').collect();
  },
});

export const createDish = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    emoji: v.string(),
    categoryId: v.id("dish_categories"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dishes", {
      name: args.name,
      description: args.description,
      price: args.price,
      emoji: args.emoji,
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